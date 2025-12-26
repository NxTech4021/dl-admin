import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SponsorsContent = lazy(() => import("@/app/utilities/sponsors/page").then(mod => ({
  default: mod.default,
})));

export const Route = createFileRoute("/_authenticated/utilities/sponsors/")({
  component: SponsorsPage,
});

function SponsorsPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
      <SponsorsContent />
    </Suspense>
  );
}
