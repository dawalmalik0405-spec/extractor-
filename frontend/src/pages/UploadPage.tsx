import { useState } from "react";
import { Link } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import UploadProgress from "../components/UploadProgress";
import { apiErrorMessage, uploadDocument } from "../services/api";

export default function UploadPage() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setIsUploading(true);
    setError(null);
    setUploadedId(null);
    setProgress(0);
    try {
      const response = await uploadDocument(file, setProgress);
      setUploadedId(response.document_id);
      setProgress(100);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Upload Document</h2>
        <p className="mt-1 text-sm text-slate-500">
          Files are extracted, chunked, embedded, and persisted to PostgreSQL and Qdrant.
        </p>
      </div>

      <FileUploader disabled={isUploading} onUpload={handleUpload} />

      {isUploading && <UploadProgress progress={progress} />}

      {uploadedId && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Ingestion completed.{" "}
          <Link className="font-semibold underline" to={`/documents/${uploadedId}`}>
            View document details
          </Link>
        </div>
      )}

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    </div>
  );
}
