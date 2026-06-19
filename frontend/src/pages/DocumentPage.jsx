import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";


function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


export default function DocumentPage() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDocument() {
      try {
        setLoading(true);
        setError("");
        const [documentResponse, textResponse] = await Promise.all([
          api.get(`/api/documents/${id}`),
          api.get(`/api/documents/${id}/extract`),
        ]);

        if (active) {
          setDocument(documentResponse.data);
          setText(textResponse.data.text || "");
        }
      } catch (requestError) {
        console.error(requestError);
        if (active) setError(getApiErrorMessage(requestError, "Could not load document"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDocument();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8" aria-label="Loading document">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-sage-100" />
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
        <h1 className="text-2xl font-bold text-ink-950">Document unavailable</h1>
        <p className="mt-3 text-ink-500">{error || "This document could not be found."}</p>
        <Link to="/documents" className="mt-6 inline-flex rounded-xl bg-ink-950 px-5 py-3 text-sm font-bold text-white">Back to documents</Link>
      </div>
    );
  }

  return (
    <div className="px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link to="/documents" className="inline-flex items-center gap-2 text-sm font-bold text-ink-500 transition hover:text-sage-600">
          <span aria-hidden="true">&larr;</span>
          Back to documents
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
          <aside>
            <div className="grid size-14 place-items-center rounded-2xl bg-sage-100 text-sage-700">
              <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
                <path d="M7 3.75h7l3 3V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M14 3.75v3h3M9.75 11h4.5M9.75 14.25h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="mt-5 break-words text-2xl font-bold leading-tight tracking-[-0.03em] text-ink-950">{document.filename}</h1>

            <dl className="mt-7 divide-y divide-[#dfe3dc] border-y border-[#dfe3dc] text-sm">
              <div className="flex items-center justify-between py-3">
                <dt className="text-ink-500">Type</dt>
                <dd className="font-bold uppercase text-ink-700">{document.file_type.replace(".", "")}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-ink-500">Chunks</dt>
                <dd className="font-bold text-ink-700">{document.total_chunks}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-ink-500">Size</dt>
                <dd className="font-bold text-ink-700">{formatFileSize(document.file_size)}</dd>
              </div>
            </dl>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-[#dfe3dc] bg-white/80 shadow-[0_18px_60px_rgba(44,61,49,0.08)]">
            <div className="flex items-center justify-between border-b border-[#e7e9e4] px-6 py-4">
              <div>
                <p className="text-sm font-bold text-ink-950">Extracted text</p>
                <p className="mt-0.5 text-xs text-ink-500">Document content</p>
              </div>
              <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">Ready</span>
            </div>
            <div className="max-h-[65vh] overflow-auto px-6 py-7 sm:px-8">
              <div className="whitespace-pre-wrap text-[15px] leading-7 text-ink-700">{text || "No extracted text is available for this document."}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
