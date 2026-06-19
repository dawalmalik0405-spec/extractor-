import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";


function fetchDocuments() {
  return api.get("/api/documents");
}


export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchDocuments();
      setDocuments(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError(getApiErrorMessage(requestError, "Could not load documents"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    fetchDocuments()
      .then((response) => {
        if (active) setDocuments(response.data);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError(getApiErrorMessage(requestError, "Could not load documents"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const deleteDocument = async (document) => {
    if (!window.confirm(`Delete "${document.filename}"? This cannot be undone.`)) return;

    try {
      setDeletingId(document.id);
      setError("");
      await api.delete(`/api/documents/${document.id}`);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
    } catch (requestError) {
      console.error(requestError);
      setError(getApiErrorMessage(requestError, "Failed to delete document"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 border-b border-[#dfe3dc] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-sage-600">Your library</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-ink-950 sm:text-5xl">Documents</h1>
            <p className="mt-3 text-ink-500">Review your uploaded and extracted files.</p>
          </div>
          <Link to="/" className="inline-flex w-fit items-center gap-2 rounded-xl bg-ink-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-ink-950/10 transition hover:-translate-y-0.5 hover:bg-sage-700">
            <span className="text-lg leading-none">+</span>
            New document
          </Link>
        </div>

        {error && (
          <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <span>{error}</span>
            <button onClick={loadDocuments} className="shrink-0 font-bold underline underline-offset-2">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading documents">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#dfe3dc] bg-white/60" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <article key={doc.id} className="group rounded-2xl border border-[#dfe3dc] bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:border-sage-500 hover:shadow-[0_16px_40px_rgba(44,61,49,0.1)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                      <path d="M7 3.75h7l3 3V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                      <path d="M14 3.75v3h3M9.75 11h4.5M9.75 14.25h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteDocument(doc)}
                    disabled={deletingId === doc.id}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-transparent px-3 text-xs font-bold text-ink-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:border-red-100 disabled:bg-red-50 disabled:text-red-400"
                    aria-label={`Delete ${doc.filename}`}
                  >
                    {deletingId === doc.id ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-red-200 border-t-red-500" aria-hidden="true" />
                        Deleting
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
                          <path d="M4.75 7.25h14.5M9.25 3.75h5.5l.75 3.5h-7l.75-3.5ZM7.25 7.25l.75 13h8l.75-13M10 11v5.5M14 11v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
                <Link to={`/documents/${doc.id}`} className="mt-5 block focus:outline-none">
                  <span className="flex items-center justify-between gap-3">
                    <h2 className="truncate text-base font-bold text-ink-950" title={doc.filename}>{doc.filename}</h2>
                    <span className="text-ink-500 transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink-500">
                    <span className="rounded-full bg-cream-100 px-2.5 py-1 uppercase">{doc.file_type.replace(".", "")}</span>
                    <span>{doc.total_chunks} chunks</span>
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#cbd5cc] bg-white/50 px-6 py-16 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-sage-100 text-xl text-sage-700">+</div>
            <h2 className="mt-4 text-lg font-bold text-ink-950">No documents yet</h2>
            <p className="mt-2 text-sm text-ink-500">Upload your first file to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
