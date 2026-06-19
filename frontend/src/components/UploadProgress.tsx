export default function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">Upload progress</span>
        <span className="text-slate-500">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
