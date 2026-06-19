# Document Ingestion Platform

A full-stack document ingestion application for upload, text extraction, OCR, chunking, embedding generation, PostgreSQL persistence, and Qdrant vector storage.

This project intentionally does not include chat, RAG, authentication, semantic search, Redis, Celery, or background workers.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, React Router
- Backend: FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL
- Extraction: PyMuPDF, python-docx, Pillow, PaddleOCR
- Embeddings: sentence-transformers with `BAAI/bge-small-en-v1.5`
- Vector DB: Qdrant
- Runtime: Docker Compose

## Quick Start

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Qdrant: http://localhost:6333

The first backend start downloads OCR and embedding models, so it can take several minutes.

## API

- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/{id}`
- `GET /api/documents/{id}/chunks`
- `DELETE /api/documents/{id}`

## Configuration

Backend environment variables are defined in `backend/.env.example`.
Frontend environment variables are defined in `frontend/.env.example`.

Uploaded files are stored in `backend/app/uploads` inside the backend container and persisted through a Docker volume.
