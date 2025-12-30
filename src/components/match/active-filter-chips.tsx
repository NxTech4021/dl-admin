"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { MatchStatus } from "@/constants/zod/match-schema";
import type { Sport, MatchFlagType } from "./match-filter-drawer";

interface FilterChip {
  key: string;
  label: string;
  value: string;
  colorClass?: string;
}

interface ActiveFilterChipsProps {
  // Filter values
  selectedSport?: Sport;
  selectedLeague?: string;
  selectedSeason?: string;
  selectedDivision?: string;
  selectedStatus?: MatchStatus;
  selectedFlag?: MatchFlagType;
  // Display names (for better UX)
  leagueName?: string;
  seasonName?: string;
  divisionName?: string;
  // Remove handlers
  onRemoveSport: () => void;
  onRemoveLeague: () => void;
  onRemoveSeason: () => void;
  onRemoveDivision: () => void;
  onRemoveStatus: () => void;
  onRemoveFlag: () => void;
  // Clear all
  onClearAll: () => void;
  className?: string;
}

const SPORT_LABELS: Record<Sport, { label: string; color: string }> = {
  TENNIS: { label: "Tennis", color: "bg-[#518516]/10 text-[#518516] border-[#518516]/30" },
  PICKLEBALL: { label: "Pickleball", color: "bg-[#8e41e6]/10 text-[#8e41e6] border-[#8e41e6]/30" },
  PADEL: { label: "Padel", color: "bg-[#3880c0]/10 text-[#3880c0] border-[#3880c0]/30" },
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  UNFINISHED: "Unfinished",
  CANCELLED: "Cancelled",
  VOID: "Void",
};

const FLAG_LABELS: Record<MatchFlagType, string> = {
  disputed: "Disputed",
  lateCancellation: "Late Cancellation",
  walkover: "Walkover",
  requiresReview: "Requires Review",
};

function FilterChipItem({
  label,
  value,
  onRemove,
  colorClass,
}: {
  label: string;
  value: string;
  onRemove: () => void;
  colorClass?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
        colorClass || "bg-muted text-foreground border-border"
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <IconX className="size-3" />
      </button>
    </span>
  );
}

export function ActiveFilterChips({
  selectedSport,
  selectedLeague,
  selectedSeason,
  selectedDivision,
  selectedStatus,
  selectedFlag,
  leagueName,
  seasonName,
  divisionName,
  onRemoveSport,
  onRemoveLeague,
  onRemoveSeason,
  onRemoveDivision,
  onRemoveStatus,
  onRemoveFlag,
  onClearAll,
  className,
}: ActiveFilterChipsProps) {
  const chips: FilterChip[] = [];

  if (selectedSport) {
    const sportInfo = SPORT_LABELS[selectedSport];
    chips.push({
      key: "sport",
      label: "Sport",
      value: sportInfo.label,
      colorClass: sportInfo.color,
    });
  }

  if (selectedLeague) {
    chips.push({
      key: "league",
      label: "League",
      value: leagueName || "Selected",
    });
  }

  if (selectedSeason) {
    chips.push({
      key: "season",
      label: "Season",
      value: seasonName || "Selected",
    });
  }

  if (selectedDivision) {
    chips.push({
      key: "division",
      label: "Division",
      value: divisionName || "Selected",
    });
  }

  if (selectedStatus) {
    chips.push({
      key: "status",
      label: "Status",
      value: STATUS_LABELS[selectedStatus],
    });
  }

  if (selectedFlag) {
    chips.push({
      key: "flag",
      label: "Flag",
      value: FLAG_LABELS[selectedFlag],
    });
  }

  if (chips.length === 0) {
    return null;
  }

  const handleRemove = (key: string) => {
    switch (key) {
      case "sport":
        onRemoveSport();
        break;
      case "league":
        onRemoveLeague();
        break;
      case "season":
        onRemoveSeason();
        break;
      case "division":
        onRemoveDivision();
        break;
      case "status":
        onRemoveStatus();
        break;
      case "flag":
        onRemoveFlag();
        break;
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <FilterChipItem
          key={chip.key}
          label={chip.label}
          value={chip.value}
          onRemove={() => handleRemove(chip.key)}
          colorClass={chip.colorClass}
        />
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
