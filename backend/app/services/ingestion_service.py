import logging
import uuid
from pathlib import Path
from typing import BinaryIO

from fastapi import HTTPException, UploadFile, status
from qdrant_client.http import models as qdrant_models
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.chunking.text_splitter import TextSplitter
from app.config import Settings
from app.database.models import Chunk, Document
from app.embeddings.embedding_service import EmbeddingService
from app.extractors.extractor_factory import ExtractorFactory
from app.vectordb.qdrant_service import QdrantService

logger = logging.getLogger(__name__)

ALLOWED_FILE_TYPES = {"pdf", "docx", "png", "jpg", "jpeg"}


class IngestionService:
    def __init__(
        self,
        db: Session,
        settings: Settings,
        embedding_service: EmbeddingService,
        qdrant_service: QdrantService,
    ) -> None:
        self.db = db
        self.settings = settings
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service
        self.splitter = TextSplitter(settings.chunk_size, settings.chunk_overlap)

    def ingest(self, upload_file: UploadFile) -> Document:
        original_filename = upload_file.filename or "document"
        file_type = self._file_type(original_filename)
        if file_type not in ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Allowed types: {', '.join(sorted(ALLOWED_FILE_TYPES))}",
            )

        stored_path, file_size, stored_filename = self._save_upload(upload_file.file, file_type)
        try:
            extractor = ExtractorFactory.get_extractor(file_type)
            extracted_text = extractor.extract(stored_path)
            chunks_text = self.splitter.split(extracted_text)

            document = Document(
                filename=stored_filename,
                original_filename=original_filename,
                file_type=file_type,
                file_size=file_size,
                file_path=str(stored_path),
                extracted_text=extracted_text,
                total_chunks=len(chunks_text),
            )
            self.db.add(document)
            self.db.flush()

            chunks = [
                Chunk(document_id=document.id, chunk_index=index, chunk_text=chunk_text)
                for index, chunk_text in enumerate(chunks_text)
            ]
            self.db.add_all(chunks)
            self.db.flush()

            embeddings = self.embedding_service.generate_embeddings(chunks_text)
            points = [
                qdrant_models.PointStruct(
                    id=str(chunk.id),
                    vector=embedding,
                    payload={
                        "document_id": str(document.id),
                        "chunk_id": str(chunk.id),
                        "filename": document.original_filename,
                        "file_type": document.file_type,
                        "chunk_index": chunk.chunk_index,
                    },
                )
                for chunk, embedding in zip(chunks, embeddings, strict=True)
            ]
            self.qdrant_service.upsert_chunks(points)
            self.db.commit()
            self.db.refresh(document)
            return document
        except Exception:
            self.db.rollback()
            stored_path.unlink(missing_ok=True)
            logger.exception("Document ingestion failed")
            raise

    def list_documents(self) -> list[Document]:
        return list(self.db.scalars(select(Document).order_by(Document.created_at.desc())).all())

    def get_document(self, document_id: uuid.UUID) -> Document:
        document = self.db.get(Document, document_id)
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        return document

    def get_chunks(self, document_id: uuid.UUID) -> list[Chunk]:
        self.get_document(document_id)
        return list(
            self.db.scalars(
                select(Chunk).where(Chunk.document_id == document_id).order_by(Chunk.chunk_index)
            ).all()
        )

    def delete_document(self, document_id: uuid.UUID) -> None:
        document = self.get_document(document_id)
        file_path = Path(document.file_path)
        self.qdrant_service.delete_document_vectors(document_id)
        self.db.delete(document)
        self.db.commit()
        file_path.unlink(missing_ok=True)

    def _save_upload(self, source: BinaryIO, file_type: str) -> tuple[Path, int, str]:
        self.settings.upload_dir.mkdir(parents=True, exist_ok=True)
        stored_filename = f"{uuid.uuid4()}.{file_type}"
        destination = self.settings.upload_dir / stored_filename
        size = 0
        with destination.open("wb") as buffer:
            while chunk := source.read(1024 * 1024):
                size += len(chunk)
                if size > self.settings.max_upload_size_bytes:
                    buffer.close()
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Maximum upload size is {self.settings.max_upload_size_mb} MB",
                    )
                buffer.write(chunk)

        if size == 0:
            destination.unlink(missing_ok=True)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
        return destination, size, stored_filename

    @staticmethod
    def _file_type(filename: str) -> str:
        return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
