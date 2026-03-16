import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

const CrashReportsDashboard = lazy(
  () => import("@/components/crash-reports/CrashReportsDashboard")
);

export const Route = createFileRoute("/_authenticated/crash-reports/")({
  component: CrashReportsPage,
});

function CrashReportsPage() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse bg-muted rounded-lg" />
            }
          >
            <CrashReportsDashboard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
