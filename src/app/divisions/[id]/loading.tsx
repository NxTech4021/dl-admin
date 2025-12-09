import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function DivisionDetailLoading() {
  return (
    <PageLoadingSkeleton
      showBackButton={true}
      statCards={4}
      contentCards={0}
      showTabs={true}
      showTable={true}
    />
  );
}
