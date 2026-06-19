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

    document = Document(
        filename=file.filename,
        file_type=extension,
        file_path=file_path,
        file_size=os.path.getsize(file_path)
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "document_id": document.id,
        "filename": document.filename
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
