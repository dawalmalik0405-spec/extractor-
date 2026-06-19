import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { FileUp, UploadCloud, X } from "lucide-react";

interface FileUploaderProps {
  disabled?: boolean;
  onUpload: (file: File) => void;
}

const allowedExtensions = [".pdf", ".docx", ".png", ".jpg", ".jpeg"];

export default function FileUploader({ disabled = false, onUpload }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileSummary = useMemo(() => {
    if (!selectedFile) return null;
    return `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
  }, [selectedFile]);

  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  }

  return (
    <div className="rounded-md border border-line bg-white p-5 shadow-soft">
      <label
        className={[
          "flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition",
          isDragging ? "border-brand bg-teal-50" : "border-line bg-slate-50 hover:border-brand",
          disabled ? "pointer-events-none opacity-60" : ""
        ].join(" ")}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept={allowedExtensions.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={pickFile}
        />
        <UploadCloud className="h-10 w-10 text-brand" aria-hidden="true" />
        <span className="mt-4 text-base font-semibold text-ink">Drop a document here</span>
        <span className="mt-1 text-sm text-slate-500">PDF, DOCX, PNG, JPG, JPEG up to 50 MB</span>
      </label>

      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-line bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <FileUp className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
            <span className="truncate text-sm font-medium text-ink">{fileSummary}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-line p-2 text-slate-500 hover:bg-white hover:text-ink"
              onClick={() => setSelectedFile(null)}
              disabled={disabled}
              title="Clear file"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onUpload(selectedFile)}
              disabled={disabled}
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
