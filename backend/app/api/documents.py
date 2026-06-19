import logging
import os
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.chunkers.text_chunker import TextChunker
from app.config.settings import MAX_UPLOAD_SIZE, UPLOAD_DIR
from app.database.models import Document, DocumentChunk
from app.database.postgres import get_db
from app.embeddings.embedding_service import get_embedding_service
from app.extractor.extractor_factory import ExtractorFactory
from app.vector_db.qdrant_service import get_qdrant_service


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".png", ".jpg", ".jpeg"}
UPLOAD_FOLDERS = {
    ".pdf": "pdfs",
    ".docx": "docx",
    ".png": "images",
    ".jpg": "images",
    ".jpeg": "images",
}
COPY_CHUNK_SIZE = 1024 * 1024


def safe_filename(filename: str | None) -> str:
    name = Path(filename or "document").name
    cleaned = re.sub(r"[^A-Za-z0-9._ -]", "_", name).strip(" .")
    return cleaned or "document"


def save_upload(file: UploadFile, destination: Path) -> int:
    size = 0
    destination.parent.mkdir(parents=True, exist_ok=True)

    try:
        with destination.open("wb") as output:
            while chunk := file.file.read(COPY_CHUNK_SIZE):
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail=f"File exceeds the {MAX_UPLOAD_SIZE // (1024 * 1024)} MB limit",
                    )
                output.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        file.file.close()

    if size == 0:
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="The uploaded file is empty")

    return size


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    original_filename = safe_filename(file.filename)
    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use PDF, DOCX, PNG, JPG, or JPEG.",
        )

    stored_filename = f"{uuid.uuid4().hex}_{original_filename}"
    file_path = UPLOAD_DIR / UPLOAD_FOLDERS[extension] / stored_filename
    vector_ids: list[str] = []

    try:
        logger.info("Saving upload: %s", original_filename)
        file_size = save_upload(file, file_path)

        logger.info("Extracting text: %s", original_filename)
        extractor = ExtractorFactory.get_extractor(extension)
        text = extractor.extract(str(file_path))
        if not text:
            raise HTTPException(
                status_code=422,
                detail="No text could be extracted from this document",
            )

        chunks = TextChunker().chunk(text)
        logger.info("Creating %d chunks: %s", len(chunks), original_filename)

        document = Document(
            filename=original_filename,
            file_type=extension,
            file_path=str(file_path),
            file_size=file_size,
            extracted_text=text,
            total_chunks=len(chunks),
        )
        db.add(document)
        db.flush()

        embedding_service = get_embedding_service()
        qdrant_service = get_qdrant_service()
        embeddings = embedding_service.generate_embeddings(chunks) if chunks else []

        for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            vector_id = qdrant_service.store_embedding(
                embedding=embedding,
                payload={
                    "document_id": document.id,
                    "filename": document.filename,
                    "chunk_index": index,
                    "text": chunk,
                },
            )
            vector_ids.append(vector_id)
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    chunk_index=index,
                    content=chunk,
                    vector_id=vector_id,
                )
            )

        db.commit()
        db.refresh(document)
        logger.info("Upload complete: %s", original_filename)

        return {
            "document_id": document.id,
            "filename": document.filename,
            "chunks_created": len(chunks),
        }
    except HTTPException:
        db.rollback()
        if vector_ids:
            get_qdrant_service().delete_vectors(vector_ids)
        file_path.unlink(missing_ok=True)
        raise
    except Exception as exc:
        db.rollback()
        if vector_ids:
            get_qdrant_service().delete_vectors(vector_ids)
        file_path.unlink(missing_ok=True)
        logger.exception("Document upload failed: %s", original_filename)
        raise HTTPException(
            status_code=500,
            detail="Document processing failed",
        ) from exc


@router.get("")
def get_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "file_size": doc.file_size,
            "total_chunks": doc.total_chunks,
            "created_at": doc.created_at,
        }
        for doc in documents
    ]


def find_document(document_id: str, db: Session) -> Document:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/{document_id}/extract")
def extract_document(document_id: str, db: Session = Depends(get_db)):
    document = find_document(document_id, db)
    return {
        "document_id": document.id,
        "filename": document.filename,
        "text": document.extracted_text or "",
    }


@router.get("/{document_id}")
def get_document(document_id: str, db: Session = Depends(get_db)):
    document = find_document(document_id, db)
    return {
        "id": document.id,
        "filename": document.filename,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "total_chunks": document.total_chunks,
        "created_at": document.created_at,
    }


@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    document = find_document(document_id, db)
    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).all()
    vector_ids = [chunk.vector_id for chunk in chunks if chunk.vector_id]

    try:
        get_qdrant_service().delete_vectors(vector_ids)
        file_path = Path(document.file_path)
        db.delete(document)
        db.commit()
        file_path.unlink(missing_ok=True)
    except Exception as exc:
        db.rollback()
        logger.exception("Document deletion failed: %s", document_id)
        raise HTTPException(status_code=500, detail="Document deletion failed") from exc

    return {"message": "Document deleted"}
