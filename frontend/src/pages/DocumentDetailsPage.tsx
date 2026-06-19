import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LoadingState from "../components/LoadingState";
import { apiErrorMessage, getDocument, getDocumentChunks } from "../services/api";
import type { DocumentChunk, DocumentDetail } from "../types/document";
import { formatBytes, formatDate } from "../utils/format";

export default function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setError(null);
      try {
        const [documentData, chunkData] = await Promise.all([getDocument(id), getDocumentChunks(id)]);
        setDocument(documentData);
        setChunks(chunkData);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [id]);

  if (isLoading) return <LoadingState label="Loading document details" />;

  if (error || !document) {
    return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/documents" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-teal-800">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to documents
      </Link>

      <div>
        <h2 className="break-words text-2xl font-semibold text-ink">{document.original_filename}</h2>
        <p className="mt-1 text-sm text-slate-500">Stored as {document.filename}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Type", document.file_type.toUpperCase()],
          ["Size", formatBytes(document.file_size)],
          ["Chunks", String(document.total_chunks)],
          ["Uploaded", formatDate(document.created_at)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-line bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="mt-2 break-words text-sm font-semibold text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Extracted Text Preview</h3>
          <span className="text-xs text-slate-500">{document.extracted_text.length} characters</span>
        </div>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {document.extracted_text || "No text extracted."}
        </pre>
      </section>

      <section className="rounded-md border border-line bg-white shadow-soft">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold text-ink">Chunks</h3>
        </div>
        <div className="divide-y divide-line">
          {chunks.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No chunks were generated.</p>
          ) : (
            chunks.map((chunk) => (
              <article key={chunk.id} className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-ink">Chunk {chunk.chunk_index + 1}</h4>
                  <span className="text-xs text-slate-500">{chunk.chunk_text.length} characters</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{chunk.chunk_text}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
