import { Suspense } from "react";
import { ChartErrorBoundary } from "@/components/ui/chart-error-boundary";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";

interface DashboardChartProps {
  name: string;
  height: string;
  children: React.ReactNode;
}

export function DashboardChart({ name, height, children }: DashboardChartProps) {
  return (
    <ChartErrorBoundary chartName={name}>
      <Suspense fallback={<ChartSkeleton height={height} name={name} />}>
        {children}
      </Suspense>
    </ChartErrorBoundary>
  );
}
