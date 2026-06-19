import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

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


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"], include_in_schema=False)
def api_not_found(path: str) -> None:
    raise HTTPException(status_code=404, detail="API endpoint not found")

FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"


@app.on_event("startup")
def startup() -> None:
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    try:
        init_db()
    except OperationalError:
        logger.error("Database is not reachable or could not be initialized.")
        logger.error("Expected database URL: %s", settings.database_url)
        raise

    try:
        QdrantService(
            collection_name=settings.qdrant_collection,
            url=settings.qdrant_url,
            path=settings.qdrant_path,
        ).ensure_collection()
    except Exception:
        logger.error("Qdrant vector storage could not be initialized.")
        logger.error("Qdrant URL: %s", settings.qdrant_url or "(embedded local mode)")
        logger.error("Qdrant path: %s", settings.qdrant_path)
        raise

    logger.info("Application startup complete")
    logger.info("Open the app at http://localhost:8000")
    logger.info("API docs are available at http://localhost:8000/docs")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def serve_frontend(path: str) -> FileResponse:
        requested_path = (FRONTEND_DIST / path).resolve()
        if requested_path.is_file() and FRONTEND_DIST in requested_path.parents:
            return FileResponse(requested_path)
        return FileResponse(FRONTEND_INDEX)
else:
    logger.warning("Frontend build directory not found at %s. Run `npm run build` in frontend.", FRONTEND_DIST)
