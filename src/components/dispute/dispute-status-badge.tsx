"use client";

import { Badge } from "@/components/ui/badge";
import { DisputeStatus, getStatusColor } from "@/constants/zod/dispute-schema";

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  className?: string;
}

export function DisputeStatusBadge({ status, className }: DisputeStatusBadgeProps) {
  const statusLabels: Record<DisputeStatus, string> = {
    OPEN: "Open",
    UNDER_REVIEW: "Under Review",
    RESOLVED: "Resolved",
    REJECTED: "Rejected",
  };

  return (
    <Badge className={`${getStatusColor(status)} ${className || ""}`}>
      {statusLabels[status]}
    </Badge>
  );
}
