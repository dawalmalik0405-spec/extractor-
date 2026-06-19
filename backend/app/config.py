from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(default="sqlite:///./local_ingestion.db")
    qdrant_url: str = Field(default="")
    qdrant_path: Path = Field(default=Path("local_qdrant"))
    qdrant_collection: str = Field(default="document_chunks")
    upload_dir: Path = Field(default=Path("app/uploads"))
    max_upload_size_mb: int = Field(default=50)
    cors_origins: str = Field(default="http://localhost:8000,http://127.0.0.1:8000")
    embedding_model_name: str = Field(default="BAAI/bge-small-en-v1.5")
    chunk_size: int = Field(default=1000)
    chunk_overlap: int = Field(default=100)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
