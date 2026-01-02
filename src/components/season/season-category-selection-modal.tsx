import React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconUsers, IconChevronRight, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { GroupedSeason } from "@/constants/zod/season-schema";

interface SeasonCategorySelectionModalProps {
  group: GroupedSeason | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatTableDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || amount === 0) return "Free";
  return `RM ${Number(amount).toFixed(2)}`;
};

const getStatusBadgeClass = (status: string | undefined) => {
  switch (status) {
    case "UPCOMING":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "ACTIVE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "FINISHED":
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
    case "CANCELLED":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    case "WAITLISTED":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

const formatStatus = (status: string | undefined): string => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export function SeasonCategorySelectionModal({
  group,
  open,
  onOpenChange,
}: SeasonCategorySelectionModalProps) {
  const navigate = useNavigate();

  if (!group) return null;

  const handleSelectCategory = (seasonId: string) => {
    navigate({ to: "/seasons/$seasonId", params: { seasonId } });
    onOpenChange(false);
  };

  const dateRange =
    group.aggregated.dateRange.start && group.aggregated.dateRange.end
      ? `${formatTableDate(group.aggregated.dateRange.start)} - ${formatTableDate(group.aggregated.dateRange.end)}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{group.name}</DialogTitle>
          {dateRange && (
            <DialogDescription className="flex items-center gap-1">
              <IconClock className="size-3.5" />
              {dateRange}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-2 mt-2">
          <p className="text-sm text-muted-foreground mb-3">
            Select a category to view details:
          </p>

          {group.seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => handleSelectCategory(season.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border",
                "hover:bg-accent hover:border-primary/50 transition-colors",
                "text-left group cursor-pointer"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {season.category?.name || "No category"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border",
                      getStatusBadgeClass(season.status)
                    )}
                  >
                    {formatStatus(season.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconUsers className="size-3.5" />
                    {season.registeredUserCount || 0} players
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      season.entryFee && Number(season.entryFee) > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatCurrency(season.entryFee)}
                  </span>
                </div>
              </div>

              <IconChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
