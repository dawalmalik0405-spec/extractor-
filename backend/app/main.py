from fastapi import FastAPI

from app.database.postgres import create_tables
from app.api.documents import router as document_router



app = FastAPI(
    title="Document Ingestion API"
)

app.include_router(document_router)


@app.on_event("startup")
def startup():
    create_tables()


@app.get("/")
def root():
    return {
        "message": "Document Ingestion API Running"
    }




