import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function PlayerDetailLoading() {
  return (
    <PageLoadingSkeleton
      showBackButton={true}
      statCards={3}
      contentCards={2}
      showTabs={false}
      showTable={false}
    />
  );
}
