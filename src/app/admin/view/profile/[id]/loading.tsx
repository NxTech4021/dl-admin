import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function AdminProfileLoading() {
  return (
    <PageLoadingSkeleton
      showBackButton={true}
      statCards={0}
      contentCards={2}
      showTabs={false}
      showTable={false}
    />
  );
}
