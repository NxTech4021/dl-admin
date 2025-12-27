"use client";

import { StatsCard } from "@/components/ui/stats-card";
import { IconAlertCircle, IconEye, IconCheck, IconX } from "@tabler/icons-react";
import { useDisputes } from "@/hooks/use-queries";
import { AnimatedStatsGrid, AnimatedStatsCard } from "@/components/ui/animated-container";

export function DisputeStatsCards() {
  // Get dispute counts by status
  const { data: openData, isLoading: openLoading } = useDisputes({ status: "OPEN", limit: 1 });
  const { data: reviewData, isLoading: reviewLoading } = useDisputes({ status: "UNDER_REVIEW", limit: 1 });
  const { data: resolvedData, isLoading: resolvedLoading } = useDisputes({ status: "RESOLVED", limit: 1 });
  const { data: rejectedData, isLoading: rejectedLoading } = useDisputes({ status: "REJECTED", limit: 1 });

  const isLoading = openLoading || reviewLoading || resolvedLoading || rejectedLoading;

  return (
    <AnimatedStatsGrid className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <AnimatedStatsCard>
        <StatsCard
          title="Open Disputes"
          value={openData?.total || 0}
          description="Awaiting review"
          icon={IconAlertCircle}
          iconColor="text-yellow-500"
          loading={isLoading}
        />
      </AnimatedStatsCard>
      <AnimatedStatsCard>
        <StatsCard
          title="Under Review"
          value={reviewData?.total || 0}
          description="Being investigated"
          icon={IconEye}
          iconColor="text-blue-500"
          loading={isLoading}
        />
      </AnimatedStatsCard>
      <AnimatedStatsCard>
        <StatsCard
          title="Resolved"
          value={resolvedData?.total || 0}
          description="Successfully closed"
          icon={IconCheck}
          iconColor="text-green-500"
          loading={isLoading}
        />
      </AnimatedStatsCard>
      <AnimatedStatsCard>
        <StatsCard
          title="Rejected"
          value={rejectedData?.total || 0}
          description="Dismissed disputes"
          icon={IconX}
          iconColor="text-slate-500"
          loading={isLoading}
        />
      </AnimatedStatsCard>
    </AnimatedStatsGrid>
  );
}
