export function FileCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="flex space-x-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FileListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}