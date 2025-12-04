"use client";

import { Badge } from "@/components/ui/badge";
import { DisputeCategory, getCategoryLabel } from "@/constants/zod/dispute-schema";
import { IconAlertCircle, IconUserOff, IconMoodAngry, IconQuestionMark } from "@tabler/icons-react";

interface DisputeCategoryBadgeProps {
  category: DisputeCategory;
  className?: string;
  showIcon?: boolean;
}

export function DisputeCategoryBadge({ category, className, showIcon = true }: DisputeCategoryBadgeProps) {
  const categoryConfig: Record<DisputeCategory, { color: string; Icon: typeof IconAlertCircle }> = {
    WRONG_SCORE: {
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Icon: IconAlertCircle,
    },
    NO_SHOW: {
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      Icon: IconUserOff,
    },
    BEHAVIOR: {
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Icon: IconMoodAngry,
    },
    OTHER: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      Icon: IconQuestionMark,
    },
  };

  const config = categoryConfig[category];
  const Icon = config.Icon;

  return (
    <Badge className={`${config.color} ${className || ""}`}>
      {showIcon && <Icon className="size-3 mr-1" />}
      {getCategoryLabel(category)}
    </Badge>
  );
}
