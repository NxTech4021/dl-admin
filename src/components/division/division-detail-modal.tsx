

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Division } from "@/constants/zod/division-schema";
import { formatTableDate, formatCurrency } from "@/components/data-table/constants";
import {
  IconCategory,
  IconHash,
  IconChevronRight,
  IconUsers,
  IconUser,
  IconTrophy,
  IconSettings,
  IconCalendar,
  IconGenderBigender,
  IconEdit,
  IconExternalLink,
  IconChartBar,
  IconCrown,
  IconSparkles,
} from "@tabler/icons-react";
import { cn, formatDivisionLevel } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";

/** Get level-specific styling */
const getLevelStyles = (level: string | null | undefined) => {
  switch (level?.toLowerCase()) {
    case "beginner":
      return {
        badge: "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
        accent: "bg-sky-500",
        bg: "bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20",
        ring: "ring-sky-400",
      };
    case "intermediate":
    case "upper_intermediate":
      return {
        badge: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        accent: "bg-amber-500",
        bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
        ring: "ring-amber-400",
      };
    case "advanced":
      return {
        badge: "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
        accent: "bg-violet-500",
        bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20",
        ring: "ring-violet-400",
      };
    default:
      return {
        badge: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
        accent: "bg-slate-500",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20",
        ring: "ring-slate-400",
      };
  }
};

/** Get capacity status and styling */
const getCapacityStatus = (current: number, max: number | null | undefined) => {
  if (!max || max === 0) return { percentage: 0, color: "bg-slate-400", textColor: "text-slate-600", label: "No limit" };
  const percentage = Math.min((current / max) * 100, 100);
  if (percentage >= 100) return { percentage: 100, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400", label: "Full" };
  if (percentage >= 90) return { percentage, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400", label: "Almost full" };
  if (percentage >= 70) return { percentage, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", label: "Filling up" };
  return { percentage, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", label: "Available" };
};

/** Format game type label */
const formatGameType = (gameType: string | null | undefined): string => {
  if (!gameType) return "Unknown";
  return gameType.charAt(0).toUpperCase() + gameType.slice(1).toLowerCase();
};

/** Format gender category */
const formatGender = (gender: string | null | undefined): string => {
  if (!gender) return "Open";
  switch (gender.toLowerCase()) {
    case "male": return "Men's";
    case "female": return "Women's";
    case "mixed": return "Mixed";
    default: return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  }
};

interface DivisionDetailModalProps {
  division: Division | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (division: Division) => void;
  onManagePlayers?: (division: Division) => void;
}

export function DivisionDetailModal({
  division,
  open,
  onOpenChange,
  onEdit,
  onManagePlayers,
}: DivisionDetailModalProps) {
  const navigate = useNavigate();

  if (!division) return null;

  const levelStyles = getLevelStyles(division.divisionLevel);
  const season = (division as any).season;
  const league = season?.league || (division as any).league;

  // Calculate capacity based on game type
  const isDoubles = division.gameType?.toLowerCase() === "doubles";
  const currentCount = isDoubles ? (division.currentDoublesCount || 0) : (division.currentSinglesCount || 0);
  const maxCount = isDoubles ? division.maxDoublesTeams : division.maxSingles;
  const capacityStatus = getCapacityStatus(currentCount, maxCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs font-medium border", levelStyles.badge)}>
              {formatDivisionLevel(division.divisionLevel)}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium bg-muted/50">
              {isDoubles ? <IconUsers className="size-3 mr-1" /> : <IconUser className="size-3 mr-1" />}
              {formatGameType(division.gameType)}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium bg-muted/50">
              <IconGenderBigender className="size-3 mr-1" />
              {formatGender(division.genderCategory)}
            </Badge>
            <Badge
              variant={division.isActive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                division.isActive
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {division.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Title & Context */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl shadow-sm",
                levelStyles.bg,
                "border border-border/50"
              )}>
                <IconCategory className="size-5 text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {division.name}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <IconHash className="size-3" />
                  <code className="font-mono text-[11px] select-all">{division.id}</code>
                </div>
              </div>
            </div>

            {/* Breadcrumb: League > Season */}
            {(league || season) && (
              <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border", levelStyles.bg, "border-border/50")}>
                <IconTrophy className="size-4 text-muted-foreground" />
                {league && (
                  <span className="text-sm font-medium">{league.name}</span>
                )}
                {league && season && (
                  <IconChevronRight className="size-3 text-muted-foreground/50" />
                )}
                {season && (
                  <span className="text-sm text-muted-foreground">{season.name}</span>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Capacity & Threshold Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Capacity Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <IconUsers className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Capacity</span>
              </div>

              {maxCount ? (
                <>
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", capacityStatus.color)}
                        style={{ width: `${capacityStatus.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {currentCount}<span className="text-muted-foreground font-normal">/{maxCount}</span>
                      </span>
                      <span className={cn("text-xs font-medium", capacityStatus.textColor)}>
                        {capacityStatus.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isDoubles ? "teams" : "players"} registered
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <span className="text-lg font-semibold">{currentCount}</span>
                  <p className="text-xs text-muted-foreground">
                    {isDoubles ? "teams" : "players"} • No limit set
                  </p>
                </div>
              )}
            </div>

            {/* Rating Threshold Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <IconChartBar className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</span>
              </div>

              {division.threshold ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{division.threshold}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  <p className="text-xs text-muted-foreground">minimum threshold</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-lg font-medium text-muted-foreground">No threshold</span>
                  <p className="text-xs text-muted-foreground">Open to all ratings</p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconSettings className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Configuration</span>
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/50">
              <ConfigRow
                label="Auto Assignment"
                value={
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      division.autoAssignmentEnabled
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                    )}
                  >
                    {division.autoAssignmentEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                }
              />
              <ConfigRow
                label="Status"
                value={
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      division.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                    )}
                  >
                    {division.isActive ? "Active" : "Inactive"}
                  </Badge>
                }
              />
              <ConfigRow
                label="Created"
                value={<span className="text-sm">{formatTableDate(division.createdAt)}</span>}
              />
              <ConfigRow
                label="Last Updated"
                value={<span className="text-sm">{formatTableDate(division.updatedAt)}</span>}
              />
            </div>
          </div>

          {/* Sponsorship Section */}
          {(division.sponsoredDivisionName || division.prizePoolTotal) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconCrown className="size-4 text-amber-500" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sponsorship</span>
              </div>
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {division.sponsoredDivisionName && (
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        {division.sponsoredDivisionName}
                      </p>
                    )}
                    <p className="text-xs text-amber-700 dark:text-amber-300/70">Official Sponsor</p>
                  </div>
                  {division.prizePoolTotal && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                        <IconSparkles className="size-4" />
                        <span className="text-lg font-bold">
                          {formatCurrency(division.prizePoolTotal, "MYR")}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400/70">Prize Pool</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {division.description && (
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</span>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
                {division.description}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-border/50">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {onManagePlayers && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { onManagePlayers(division); onOpenChange(false); }}
              >
                <IconUsers className="size-4 mr-1.5" />
                Manage Players
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigate({ to: `/divisions/${division.id}?tab=standings` }); onOpenChange(false); }}
            >
              <IconChartBar className="size-4 mr-1.5" />
              Standings
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigate({ to: `/divisions/${division.id}` }); onOpenChange(false); }}
            >
              <IconExternalLink className="size-4 mr-1.5" />
              Full Page
            </Button>

            {onEdit && (
              <Button
                variant="default"
                size="sm"
                onClick={() => { onEdit(division); onOpenChange(false); }}
              >
                <IconEdit className="size-4 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Configuration Row Component */
function ConfigRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {value}
    </div>
  );
}
