import os
import shutil

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.postgres import get_db
from app.database.models import Document
from app.extractor.extractor_factory import ExtractorFactory
from app.chunkers.text_chunker import TextChunker
from app.database.models import DocumentChunk
from app.embeddings.embedding_service import (
    EmbeddingService
)

from app.vector_db.qdrant_service import (
    QdrantService
)



router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".png",
    ".jpg",
    ".jpeg"
}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    folder_map = {
        ".pdf": "uploads/pdfs",
        ".docx": "uploads/docx",
        ".png": "uploads/images",
        ".jpg": "uploads/images",
        ".jpeg": "uploads/images"
    }

    save_folder = folder_map[extension]

    os.makedirs(
        save_folder,
        exist_ok=True
    )

    file_path = os.path.join(
        save_folder,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    extractor = ExtractorFactory.get_extractor(
            extension
        )

    text = extractor.extract(
            file_path
        )

    document = Document(
        filename=file.filename,
        file_type=extension,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        extracted_text=text
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    chunker = TextChunker()

    chunks = chunker.chunk(text)

    embedding_service = EmbeddingService()

    qdrant_service = QdrantService()

    for index, chunk in enumerate(chunks):

        embedding = (
            embedding_service.generate_embedding(
                chunk
            )
        )

        vector_id = (
            qdrant_service.store_embedding(
                embedding=embedding,
                payload={
                    "document_id": document.id,
                    "filename": document.filename,
                    "chunk_index": index,
                    "text": chunk
                }
            )
        )

        db_chunk = DocumentChunk(
            document_id=document.id,
            chunk_index=index,
            content=chunk,
            vector_id=vector_id
        )

        db.add(db_chunk)

    db.commit()

    return {
        "document_id": document.id,
        "filename": document.filename,
        "chunks_created": len(chunks)
    }


@router.get("/{document_id}/extract")
def extract_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    extractor = ExtractorFactory.get_extractor(
        document.file_type
    )

    text = extractor.extract(
        document.file_path
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "text": text
    }
