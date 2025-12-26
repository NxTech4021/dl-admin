import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

const BugDashboard = lazy(() => import("@/components/bug-report/BugDashboard"));

export const Route = createFileRoute("/_authenticated/bugs/")({
  component: BugsPage,
});

function BugsPage() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
            <BugDashboard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
