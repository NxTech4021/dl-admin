import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageHeader - Standardized page header component
 *
 * Design System Standards:
 * - Typography: h1 at text-3xl (30px) with tight tracking
 * - Spacing: Follows 8px grid (gap-3, gap-6, py-6)
 * - Layout: Flexbox with responsive stacking (mobile → desktop)
 * - Visual: Border-bottom with backdrop blur for depth
 * - Accessibility: Semantic HTML5 header element
 *
 * Industry Standards Applied:
 * - Heading hierarchy: h1 for page title
 * - Icon size: 32px (size-8) for visual balance
 * - Description: text-muted-foreground for hierarchy
 * - Actions: Right-aligned on desktop, stacked on mobile
 * - Responsive padding: px-4 mobile → px-6 desktop
 *
 * Based on:
 * - shadcn/ui design patterns
 * - Tailwind UI component library
 * - Vercel design system
 */

export interface PageHeaderProps {
  /** Optional icon component - displayed at 32px (size-8) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Page title - rendered as h1 */
  title: string;
  /** Optional description/subtitle */
  description?: string;
  /** Action buttons (Export, Create, etc.) */
  actions?: React.ReactNode;
  /** Additional content (stats cards, filters, etc.) */
  children?: React.ReactNode;
  /** Additional className for border/background customization */
  className?: string;
  /** Container className for inner padding control */
  containerClassName?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
  containerClassName,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className={cn("px-4 lg:px-6 py-6", containerClassName)}>
        <div className="flex flex-col gap-6">
          {/* Title and Actions Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* Title Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {Icon && <Icon className="size-8 text-primary" aria-hidden="true" />}
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              </div>
              {description && (
                <p className="text-sm text-muted-foreground max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {/* Actions Section */}
            {actions && (
              <div className="flex items-center gap-2 flex-wrap">
                {actions}
              </div>
            )}
          </div>

          {/* Additional Content (Stats, Filters, etc.) */}
          {children}
        </div>
      </div>
    </header>
  );
}

/**
 * PageHeaderSkeleton - Loading state for PageHeader
 */
export function PageHeaderSkeleton() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 lg:px-6 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted animate-pulse" />
                <div className="h-9 w-48 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
              <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
