import { Eye, FileText, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentListItem } from "../types/document";
import { formatBytes, formatDate } from "../utils/format";

interface DocumentCardProps {
  document: DocumentListItem;
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

export default function DocumentCard({ document, deletingId, onDelete }: DocumentCardProps) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-teal-50 p-2 text-brand">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{document.original_filename}</h3>
          <p className="mt-1 text-xs uppercase text-slate-500">{document.file_type}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Size</dt>
          <dd className="font-medium text-ink">{formatBytes(document.file_size)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Chunks</dt>
          <dd className="font-medium text-ink">{document.total_chunks}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-slate-500">Uploaded</dt>
          <dd className="font-medium text-ink">{formatDate(document.created_at)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex gap-2">
        <Link
          to={`/documents/${document.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </Link>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onDelete(document.id)}
          disabled={deletingId === document.id}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete
        </button>
      </div>
    </div>
  );
}
