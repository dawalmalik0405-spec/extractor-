import { Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentListItem } from "../types/document";
import { formatBytes, formatDate } from "../utils/format";

interface DocumentTableProps {
  documents: DocumentListItem[];
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

export default function DocumentTable({ documents, deletingId, onDelete }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-md border border-line bg-white p-10 text-center">
        <h2 className="text-base font-semibold text-ink">No documents uploaded</h2>
        <p className="mt-1 text-sm text-slate-500">Uploaded files will appear here after ingestion.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Filename</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Uploaded</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Chunks</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {documents.map((document) => (
              <tr key={document.id} className="hover:bg-slate-50">
                <td className="max-w-xs truncate px-4 py-3 text-sm font-medium text-ink">
                  {document.original_filename}
                </td>
                <td className="px-4 py-3 text-sm uppercase text-slate-600">{document.file_type}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatBytes(document.file_size)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(document.created_at)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{document.total_chunks}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/documents/${document.id}`}
                      className="rounded-md border border-line p-2 text-slate-500 hover:bg-white hover:text-brand"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className="rounded-md border border-line p-2 text-slate-500 hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onDelete(document.id)}
                      disabled={deletingId === document.id}
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
