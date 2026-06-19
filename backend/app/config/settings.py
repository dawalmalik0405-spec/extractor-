import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent

load_dotenv(BACKEND_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL") or (
    f"sqlite:///{(BACKEND_DIR / 'extractor.db').as_posix()}"
)
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "BAAI/bge-small-en-v1.5",
)
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR") or BACKEND_DIR / "uploads").resolve()
QDRANT_PATH = Path(os.getenv("QDRANT_PATH") or BACKEND_DIR / "qdrant_data").resolve()
FRONTEND_DIST_DIR = (PROJECT_DIR / "frontend" / "dist").resolve()
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 25 * 1024 * 1024))
