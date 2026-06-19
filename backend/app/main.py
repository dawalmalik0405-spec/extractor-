import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.documents import router as documents_router
from app.config import get_settings
from app.database.postgres import init_db
from app.vectordb.qdrant_service import QdrantService

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(title="Document Ingestion Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    init_db()
    QdrantService(settings.qdrant_url, settings.qdrant_collection).ensure_collection()
    logger.info("Application startup complete")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
