import { useState } from "react";
import { Link } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";


const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.docx,.png,.jpg,.jpeg";


export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setResult(null);

    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("The selected file exceeds the 25 MB limit.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      const response = await api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError(getApiErrorMessage(requestError, "Upload failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage-100 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sage-700 shadow-sm">
            <span className="size-1.5 rounded-full bg-sage-500" />
            Document intelligence
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-0.05em] text-ink-950 sm:text-6xl">
            Turn documents into <span className="text-sage-600">useful text.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink-500">
            Upload a document and extract clean, structured content in seconds. Simple, private, and ready to use.
          </p>
          <Link to="/documents" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-ink-950 transition-colors hover:text-sage-600">
            Browse extracted documents <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>

        <section className="rounded-[2rem] border border-[#dfe3dc] bg-white/80 p-3 shadow-[0_24px_80px_rgba(44,61,49,0.12)] backdrop-blur-sm">
          <div className="rounded-[1.45rem] border border-dashed border-[#cbd5cc] bg-cream-50 px-6 py-10 text-center sm:px-10">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-sage-100 text-sage-700">
              <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4.25A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-bold tracking-[-0.02em] text-ink-950">Select a document</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">Choose a file from your device to begin extraction.</p>

            <label className="mt-7 flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe3dc] bg-white px-4 py-3 text-left shadow-sm transition hover:border-sage-500">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cream-100 text-ink-700">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                  <path d="M7 3.75h7l3 3V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M14 3.75v3h3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-700">{file ? file.name : "Choose a file"}</span>
              <span className="text-xs font-bold text-sage-600">Browse</span>
              <input type="file" accept={ACCEPTED_FILE_TYPES} className="sr-only" onChange={handleFileChange} />
            </label>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-ink-950/10 transition hover:-translate-y-0.5 hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {loading ? "Extracting document..." : "Extract document"}
              {!loading && <span aria-hidden="true">&rarr;</span>}
            </button>
            <p className="mt-3 text-xs text-ink-500">PDF, DOCX, PNG, or JPG up to 25 MB</p>

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700">{error}</div>
            )}
          </div>

          {result && (
            <div className="m-2 mt-5 rounded-2xl bg-sage-100/70 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-sage-700">
                <span className="grid size-5 place-items-center rounded-full bg-sage-600 text-xs text-white">&#10003;</span>
                Extraction complete
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-500">Filename</dt>
                  <dd className="mt-0.5 truncate font-semibold text-ink-950">{result.filename}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Chunks created</dt>
                  <dd className="mt-0.5 font-semibold text-ink-950">{result.chunks_created}</dd>
                </div>
              </dl>
              <Link to={`/documents/${result.document_id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sage-700 hover:text-ink-950">
                View extracted text <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
