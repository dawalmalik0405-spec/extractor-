export default function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-md border border-line bg-white">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  );
}
