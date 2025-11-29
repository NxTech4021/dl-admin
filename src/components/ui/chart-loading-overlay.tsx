interface ChartLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function ChartLoadingOverlay({
  isLoading,
  message = "Updating charts...",
}: ChartLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}
