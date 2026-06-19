import { useEffect, useState } from "react";
import DocumentCard from "../components/DocumentCard";
import DocumentTable from "../components/DocumentTable";
import LoadingState from "../components/LoadingState";
import { apiErrorMessage, deleteDocument, listDocuments } from "../services/api";
import type { DocumentListItem } from "../types/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadDocuments() {
    setError(null);
    try {
      setDocuments(await listDocuments());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteDocument(id);
      setDocuments((current) => current.filter((document) => document.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) return <LoadingState label="Loading documents" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Documents</h2>
        <p className="mt-1 text-sm text-slate-500">Uploaded files and ingestion metadata.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 md:hidden">
        {documents.length === 0 ? (
          <div className="rounded-md border border-line bg-white p-8 text-center">
            <h2 className="text-base font-semibold text-ink">No documents uploaded</h2>
            <p className="mt-1 text-sm text-slate-500">Uploaded files will appear here after ingestion.</p>
          </div>
        ) : (
          documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <div className="hidden md:block">
        <DocumentTable documents={documents} deletingId={deletingId} onDelete={handleDelete} />
      </div>
    </div>
  );
}
