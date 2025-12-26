import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const CategoriesContent = lazy(() => import("@/app/utilities/categories/page").then(mod => ({
  default: mod.default,
})));

export const Route = createFileRoute("/_authenticated/utilities/categories/")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
      <CategoriesContent />
    </Suspense>
  );
}
