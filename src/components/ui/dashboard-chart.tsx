import { Suspense } from "react";
import { ChartErrorBoundary } from "@/components/ui/chart-error-boundary";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { cn } from "@/lib/utils";

interface DashboardChartProps {
  name: string;
  height?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardChart({
  name,
  height = "h-[400px]",
  children,
  className
}: DashboardChartProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <ChartErrorBoundary chartName={name}>
        <Suspense fallback={<ChartSkeleton height={height} name={name} />}>
          {children}
        </Suspense>
      </ChartErrorBoundary>
    </div>
  );
}
