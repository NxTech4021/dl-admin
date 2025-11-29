interface ChartSkeletonProps {
  height: string;
  name?: string;
}

export function ChartSkeleton({ height, name }: ChartSkeletonProps) {
  return (
    <div
      className={`${height} relative overflow-hidden rounded-lg border bg-card`}
      role="status"
      aria-label={name ? `Loading ${name}` : "Loading chart"}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-muted/50 to-transparent" />

      {/* Skeleton content */}
      <div className="flex h-full flex-col p-6">
        <div className="space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="mt-6 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 animate-pulse rounded bg-muted" />
            <div className="h-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-full min-h-[200px] animate-pulse rounded bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
