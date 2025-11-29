import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * StatsCard - Industry-standard statistics card component
 *
 * Design System Standards:
 * - Typography: Uses Tailwind's type scale (text-sm, text-2xl, text-xs)
 * - Spacing: Follows 8px grid system (gap-2, gap-4, pb-2)
 * - Colors: Uses semantic color tokens (text-muted-foreground, etc.)
 * - Responsive: Mobile-first with consistent sizing
 * - Accessibility: Proper heading hierarchy and ARIA labels
 *
 * Based on shadcn/ui Card component architecture
 */

export interface StatsCardProps {
  /** Card title - displayed in uppercase small text */
  title: string;
  /** Primary value - large, bold number or text */
  value: string | number;
  /** Optional description below value - small muted text */
  description?: string;
  /** Optional icon component (from @tabler/icons-react or lucide-react) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Icon color class - defaults to text-muted-foreground */
  iconColor?: string;
  /** Loading state - shows skeleton */
  loading?: boolean;
  /** Error state - shows error message */
  error?: string | boolean | null;
  /** Optional trend indicator */
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  /** Additional className for customization */
  className?: string;
  /** Optional retry callback for error state */
  onRetry?: () => void;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-muted-foreground",
  loading = false,
  error,
  trend,
  className,
  onRetry,
}: StatsCardProps) {
  // Loading state
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="size-4 rounded-full" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-16 mb-2" />
          {description && <Skeleton className="h-3 w-32" />}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("overflow-hidden border-destructive/50", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && <Icon className={cn("size-4 text-destructive/50")} />}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-destructive">
            {typeof error === "string" ? error : "Failed to load"}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
            >
              Retry
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("size-4", iconColor)} />}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.direction === "up"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-none">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * StatsCardSkeleton - Loading state for StatsCard
 * Exported separately for granular loading control
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}
