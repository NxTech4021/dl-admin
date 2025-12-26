"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageLoadingSkeletonProps {
  /** Show a back button skeleton */
  showBackButton?: boolean;
  /** Number of stat cards to show */
  statCards?: number;
  /** Number of content cards to show */
  contentCards?: number;
  /** Show tabs skeleton */
  showTabs?: boolean;
  /** Show data table skeleton */
  showTable?: boolean;
}

/**
 * Page loading skeleton - renders only the page content.
 * The sidebar is already provided by the authenticated layout (_authenticated/route.tsx).
 */
export function PageLoadingSkeleton({
  showBackButton = true,
  statCards = 4,
  contentCards = 1,
  showTabs = false,
  showTable = false,
}: PageLoadingSkeletonProps) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {/* Back button */}
            {showBackButton && (
              <Skeleton className="h-9 w-24" />
            )}

            {/* Page header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            {/* Stat cards */}
            {statCards > 0 && (
              <div className={`grid gap-4 ${statCards === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : statCards === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {Array.from({ length: statCards }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Tabs */}
            {showTabs && (
              <div className="flex gap-2 border-b pb-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            )}

            {/* Content cards */}
            {contentCards > 0 && (
              <div className="grid gap-4">
                {Array.from({ length: contentCards }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Data table */}
            {showTable && (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Table header */}
                    <div className="flex gap-4 pb-2 border-b">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    {/* Table rows */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-4 py-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/** Simple detail page skeleton without sidebar (for nested routes) */
export function DetailLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 animate-pulse">
      {/* Back button */}
      <Skeleton className="h-9 w-24" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
