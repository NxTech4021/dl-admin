"use client";

import { Badge } from "@/components/ui/badge";
import { DisputePriority, getPriorityColor } from "@/constants/zod/dispute-schema";
import { IconFlame, IconArrowUp, IconMinus, IconArrowDown } from "@tabler/icons-react";

interface DisputePriorityBadgeProps {
  priority: DisputePriority;
  className?: string;
  showIcon?: boolean;
}

export function DisputePriorityBadge({ priority, className, showIcon = true }: DisputePriorityBadgeProps) {
  const priorityLabels: Record<DisputePriority, string> = {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
    URGENT: "Urgent",
  };

  const PriorityIcon = {
    LOW: IconArrowDown,
    NORMAL: IconMinus,
    HIGH: IconArrowUp,
    URGENT: IconFlame,
  }[priority];

  return (
    <Badge className={`${getPriorityColor(priority)} ${className || ""}`}>
      {showIcon && <PriorityIcon className="size-3 mr-1" />}
      {priorityLabels[priority]}
    </Badge>
  );
}
