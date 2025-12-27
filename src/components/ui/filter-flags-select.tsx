"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconClock, IconWalk, IconEye } from "@tabler/icons-react";

export type MatchFlag = "disputed" | "lateCancellation" | "walkover" | "requiresReview";

interface FlagOption {
  value: MatchFlag;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const FLAG_OPTIONS: FlagOption[] = [
  {
    value: "disputed",
    label: "Disputed",
    icon: IconAlertTriangle,
    colorClass: "text-red-500",
  },
  {
    value: "lateCancellation",
    label: "Late Cancel",
    icon: IconClock,
    colorClass: "text-orange-500",
  },
  {
    value: "walkover",
    label: "Walkover",
    icon: IconWalk,
    colorClass: "text-amber-600",
  },
  {
    value: "requiresReview",
    label: "Needs Review",
    icon: IconEye,
    colorClass: "text-blue-500",
  },
];

interface FilterFlagsSelectProps {
  value: MatchFlag | undefined;
  onChange: (value: MatchFlag | undefined) => void;
  className?: string;
  triggerClassName?: string;
}

export function FilterFlagsSelect({
  value,
  onChange,
  className,
  triggerClassName,
}: FilterFlagsSelectProps) {
  const selectedOption = value ? FLAG_OPTIONS.find((o) => o.value === value) : null;

  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? undefined : (newValue as MatchFlag));
  };

  return (
    <Select value={value || "all"} onValueChange={handleChange}>
      <SelectTrigger className={cn("w-[140px]", triggerClassName, className)}>
        <SelectValue>
          {selectedOption ? (
            <span className="flex items-center gap-1.5">
              <selectedOption.icon className={cn("size-4", selectedOption.colorClass)} />
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            "All Flags"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Flags</SelectItem>
        {FLAG_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <Icon className={cn("size-4", option.colorClass)} />
                <span>{option.label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
