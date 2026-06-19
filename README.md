# Extractor

Extractor is a full-stack document ingestion application that uploads documents, extracts their text, splits the text into overlapping chunks, generates vector embeddings, and stores document metadata and vectors for later use.

The React frontend is built as static files and served by the FastAPI backend. The complete application therefore runs from one Uvicorn server and is opened at `http://localhost:8000`.

## Features

- Upload PDF, DOCX, PNG, JPG, and JPEG files
- Extract embedded text from PDFs and paragraphs from DOCX files
- Run EasyOCR on images and scanned PDF pages
- Split extracted text into reusable overlapping chunks
- Generate normalized embeddings with Sentence Transformers
- Store document metadata in SQLite or PostgreSQL
- Store embeddings in an embedded local Qdrant database
- Browse documents and view their extracted text
- Delete documents together with their file, chunks, and vectors
- Serve the frontend and API from the same Uvicorn process
- Validate upload type and enforce a configurable file-size limit

## Technology stack

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite or PostgreSQL
- PyMuPDF
- python-docx
- EasyOCR and OpenCV
- Sentence Transformers
- Qdrant Client in embedded mode
- LangChain text splitters

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

## How ingestion works

```text
Upload
  -> validate extension and size
  -> save the file
  -> extract text or run OCR
  -> split text into chunks
  -> generate embeddings
  -> store vectors in Qdrant
  -> store metadata and chunks in SQL
```

Uploads are processed synchronously. Large scanned PDFs can take significantly longer because each page must be rendered and passed through OCR. Progress is written to the backend terminal.

## Project structure

```text
extractor/
|-- backend/
|   |-- app/
|   |   |-- api/                 # FastAPI document endpoints
|   |   |-- chunkers/            # Text splitting
|   |   |-- config/              # Paths and environment settings
|   |   |-- database/            # SQLAlchemy engine and models
|   |   |-- embeddings/          # Embedding provider and service
|   |   |-- extractor/           # PDF, DOCX, image, and OCR extraction
|   |   |-- vector_db/           # Embedded Qdrant integration
|   |   `-- main.py              # FastAPI application and SPA serving
|   |-- .env.example
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- services/
|   |-- package.json
|   `-- vite.config.js
`-- README.md
```

## Requirements

- Python 3.10 or newer
- Node.js `20.19+` or `22.12+`
- npm
- Windows, Linux, or macOS
- PostgreSQL only if PostgreSQL is selected instead of the default SQLite database

The first document upload may take longer because Sentence Transformers and EasyOCR can initialize or download their model files.

## Installation

Clone the repository and enter its directory:

```powershell
git clone <repository-url>
cd extractor
```

### 1. Create the backend environment

From the project root on Windows PowerShell:

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell prevents activation, the environment can be used without activating it:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

On Linux or macOS:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 2. Configure the backend

Configuration is optional because the application has local defaults. To create a local configuration file on Windows:

```powershell
Copy-Item .env.example .env
```

On Linux or macOS:

```bash
cp .env.example .env
```

Available variables:

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | Local `backend/extractor.db` | SQLAlchemy database connection URL |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` | Sentence Transformer model |
| `MAX_UPLOAD_SIZE` | `26214400` | Maximum upload size in bytes, currently 25 MB |
| `UPLOAD_DIR` | `backend/uploads` | Directory for uploaded source files |
| `QDRANT_PATH` | `backend/qdrant_data` | Embedded Qdrant storage directory |

Blank values in `.env` use the documented local defaults.

#### SQLite configuration

No database installation is required. Leave `DATABASE_URL` blank or do not create `.env`. The database file is created automatically as `backend/extractor.db`.

#### PostgreSQL configuration

Create the database first, then set a PostgreSQL URL in `backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/document_ingestion
```

Database tables are created automatically when FastAPI starts. Schema changes to an existing database should be handled with a migration tool before production deployment.

### 3. Install and build the frontend

Return to the project root and enter `frontend`:

```powershell
cd ..\frontend
npm.cmd install
npm.cmd run build
```

Use `npm` instead of `npm.cmd` on Linux or macOS:

```bash
cd ../frontend
npm install
npm run build
```

The build is written to `frontend/dist`. Build the frontend before starting Uvicorn because FastAPI detects and registers the frontend files during application startup.

## Run with Uvicorn

Run Uvicorn directly from the `backend` directory.

### Windows PowerShell

```powershell
cd ..\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If the virtual environment is already active:

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Linux or macOS

```bash
cd ../backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open these URLs:

- Application: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/api/health`

`0.0.0.0` is the server bind address. Use `http://localhost:8000` in the browser.

Stop the server with `Ctrl+C`.

## Frontend development mode

For frontend hot module replacement, keep Uvicorn running on port `8000` and start Vite in another terminal:

```powershell
cd frontend
npm.cmd run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Uvicorn at `http://127.0.0.1:8000`.

Changes tested through the Uvicorn-served application require a new frontend production build:

```powershell
cd frontend
npm.cmd run build
```

## API endpoints

All API routes use the `/api` prefix so they do not conflict with React Router paths.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check whether the backend is running |
| `POST` | `/api/documents/upload` | Upload and process a document |
| `GET` | `/api/documents` | List stored documents |
| `GET` | `/api/documents/{document_id}` | Get document metadata |
| `GET` | `/api/documents/{document_id}/extract` | Get stored extracted text |
| `DELETE` | `/api/documents/{document_id}` | Delete a document, chunks, vectors, and source file |

### Upload example

PowerShell:

```powershell
curl.exe -X POST http://localhost:8000/api/documents/upload `
  -F "file=@C:\path\to\document.pdf"
```

Linux or macOS:

```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -F "file=@/path/to/document.pdf"
```

Example response:

```json
{
  "document_id": "f74b9270-28a2-47db-af21-e1d1a54e5ffc",
  "filename": "document.pdf",
  "chunks_created": 12
}
```

## Storage

### SQL database

The SQL database stores:

- Document identifier and filename
- File type, path, and size
- Full extracted text
- Chunk count and creation time
- Individual text chunks and their Qdrant vector identifiers

### Qdrant

Qdrant runs in embedded local mode and stores vectors under `backend/qdrant_data` by default. The collection is named `documents` and is created automatically when the first embedding is stored.

Do not start multiple backend processes against the same embedded Qdrant directory. Use one Uvicorn worker for this local configuration.

### Uploaded files

Source files are stored under `backend/uploads` by default. Files are separated into `pdfs`, `docx`, and `images` directories. Generated storage, uploaded documents, `.env`, and the local SQLite database are excluded from Git.

## Supported document types

| Extension | Extraction method |
| --- | --- |
| `.pdf` | Embedded PDF text, with OCR fallback for pages without text |
| `.docx` | Word document paragraphs |
| `.png` | EasyOCR |
| `.jpg` | EasyOCR |
| `.jpeg` | EasyOCR |

The default upload limit is 25 MB. Change `MAX_UPLOAD_SIZE` in `backend/.env` to use a different byte limit.

## Text chunking and embeddings

Extracted text is split with a recursive character splitter using:

- Chunk size: 1,000 characters
- Chunk overlap: 200 characters

The default embedding model is `BAAI/bge-small-en-v1.5`. Embeddings are normalized before they are stored with cosine distance in Qdrant.

Changing the embedding model can change the vector dimension. Use a new Qdrant directory or remove the existing collection before switching to a model with a different dimension.

## Validation

Run backend syntax validation from the project root:

```powershell
.\backend\venv\Scripts\python.exe -m compileall -q backend\app
```

Run frontend linting and a production build:

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
```

Check the running backend:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Expected response:

```text
status
------
ok
```

## Troubleshooting

### The application returns `Frontend build not found`

Build the frontend, then restart Uvicorn:

```powershell
cd frontend
npm.cmd install
npm.cmd run build
cd ..\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### PowerShell blocks `npm.ps1`

Use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run build
```

### PowerShell blocks virtual-environment activation

Call the environment's Python executable directly:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### PostgreSQL connection fails

- Confirm PostgreSQL is running.
- Confirm the database exists.
- Check the username, password, host, port, and database name in `DATABASE_URL`.
- Remove or blank `DATABASE_URL` to use local SQLite instead.

### A scanned PDF appears slow

Scanned pages require OCR and are substantially slower than embedded PDF text. Watch the Uvicorn terminal for page-level OCR progress. CPU-only OCR can take time for large or high-resolution documents.

### The first upload is slow

The embedding and OCR models are loaded lazily. Their first use can initialize model files and consume more time and memory than later uploads.

### Embedded Qdrant reports that storage is already in use

Stop other backend processes using the same `QDRANT_PATH`. Embedded Qdrant storage should be opened by only one running application process.

### A frontend change is not visible at port 8000

Rebuild `frontend/dist`:

```powershell
cd frontend
npm.cmd run build
```

Then refresh the browser. Restart Uvicorn if the frontend did not exist when the backend originally started.

## Production considerations

The current setup is designed primarily for local, single-process operation. Before production deployment, consider:

- Database migrations with Alembic
- A managed PostgreSQL database
- A standalone Qdrant server instead of embedded storage
- Authentication and authorization
- Reverse-proxy upload and request-size limits
- Background processing for large OCR workloads
- Structured logging and monitoring
- Automated backend and frontend tests
- Restrictive CORS and trusted-host configuration
- Malware scanning for uploaded files

These services are not required for local development.
