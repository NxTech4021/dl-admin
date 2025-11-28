import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatsGrid - Responsive grid container for statistics cards
 *
 * Design System Standards:
 * - Grid: Mobile-first responsive (2 cols mobile → up to 5 cols desktop)
 * - Spacing: Consistent 4-unit gap (1rem / 16px)
 * - Breakpoints: Follows Tailwind defaults (md: 768px, lg: 1024px)
 *
 * Usage:
 * <StatsGrid columns={4}>
 *   <StatsCard ... />
 *   <StatsCard ... />
 * </StatsGrid>
 */

export interface StatsGridProps {
  /** Grid content - typically StatsCard components */
  children: React.ReactNode;
  /** Number of columns at desktop breakpoint (lg and above) */
  columns?: 2 | 3 | 4 | 5;
  /** Additional className for customization */
  className?: string;
}

const GRID_COLUMNS = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-2 lg:grid-cols-5",
} as const;

export function StatsGrid({
  children,
  columns = 4,
  className,
}: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-2",
        GRID_COLUMNS[columns],
        className
      )}
    >
      {children}
    </div>
  );
}
