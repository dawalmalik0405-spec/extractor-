import uuid

from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database.postgres import get_db
from app.embeddings.embedding_service import EmbeddingService
from app.schemas.document import ChunkRead, DocumentDetail, DocumentListItem, UploadResponse
from app.services.ingestion_service import IngestionService
from app.vectordb.qdrant_service import QdrantService

router = APIRouter(prefix="/documents", tags=["documents"])


def get_embedding_service(settings: Settings = Depends(get_settings)) -> EmbeddingService:
    return EmbeddingService(settings.embedding_model_name)


def get_qdrant_service(settings: Settings = Depends(get_settings)) -> QdrantService:
    return QdrantService(settings.qdrant_url, settings.qdrant_collection)


def get_ingestion_service(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    qdrant_service: QdrantService = Depends(get_qdrant_service),
) -> IngestionService:
    return IngestionService(db, settings, embedding_service, qdrant_service)


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    service: IngestionService = Depends(get_ingestion_service),
) -> UploadResponse:
    document = service.ingest(file)
    return UploadResponse(document_id=document.id, status="success")


@router.get("", response_model=list[DocumentListItem])
def list_documents(service: IngestionService = Depends(get_ingestion_service)) -> list[DocumentListItem]:
    return service.list_documents()


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: uuid.UUID,
    service: IngestionService = Depends(get_ingestion_service),
) -> DocumentDetail:
    return service.get_document(document_id)


@router.get("/{document_id}/chunks", response_model=list[ChunkRead])
def get_document_chunks(
    document_id: uuid.UUID,
    service: IngestionService = Depends(get_ingestion_service),
) -> list[ChunkRead]:
    return service.get_chunks(document_id)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: uuid.UUID,
    service: IngestionService = Depends(get_ingestion_service),
) -> Response:
    service.delete_document(document_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
