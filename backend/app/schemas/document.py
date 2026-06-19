from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UploadResponse(BaseModel):
    document_id: UUID
    status: str


class DocumentListItem(BaseModel):
    id: UUID
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    total_chunks: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentDetail(DocumentListItem):
    file_path: str
    extracted_text: str


class ChunkRead(BaseModel):
    id: UUID
    document_id: UUID
    chunk_index: int
    chunk_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
