export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-4 w-16 rounded bg-slate-200" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-6 w-14 rounded bg-slate-200" />
        <div className="h-px flex-1 bg-slate-200" />
        <div className="h-6 w-14 rounded bg-slate-200" />
      </div>
      <div className="mt-3 h-3 w-32 rounded bg-slate-200" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-8 w-24 rounded bg-slate-200" />
      </div>
    </div>
  );
}
