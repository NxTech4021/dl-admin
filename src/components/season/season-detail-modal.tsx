"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Season } from "@/constants/zod/season-schema";
import { formatTableDate, formatCurrency } from "@/components/data-table/constants";
import {
  IconCalendar,
  IconHash,
  IconChevronRight,
  IconUsers,
  IconCategory,
  IconCurrencyDollar,
  IconSettings,
  IconEdit,
  IconExternalLink,
  IconClock,
  IconCheck,
  IconX,
  IconTicket,
  IconCreditCard,
  IconLogout,
  IconTrophy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

/** Format status to Title Case (e.g., "ACTIVE" -> "Active") */
const formatStatus = (status: string | undefined): string => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

/** Get status-specific styling */
const getStatusStyles = (status: string | undefined) => {
  switch (status) {
    case "UPCOMING":
      return {
        badge: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
      };
    case "ACTIVE":
      return {
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      };
    case "FINISHED":
      return {
        badge: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20",
      };
    case "CANCELLED":
      return {
        badge: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
        bg: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20",
      };
    case "WAITLISTED":
      return {
        badge: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
      };
    default:
      return {
        badge: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20",
      };
  }
};

/** Get sport-specific styling */
const getSportStyles = (sport: string | null | undefined) => {
  switch (sport?.toLowerCase()) {
    case "tennis":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "badminton":
      return "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
    case "pickleball":
      return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
    case "padel":
      return "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

/** Format category display */
const formatCategory = (category: Season["category"]): string => {
  if (!category) return "Open";
  const gender = category.genderRestriction || category.genderCategory || category.gender_category;
  const format = category.matchFormat || category.gameType || category.game_type;

  const genderLabel = gender?.toLowerCase() === "male" ? "Men's"
    : gender?.toLowerCase() === "female" ? "Women's"
    : gender?.toLowerCase() === "mixed" ? "Mixed"
    : "";

  const formatLabel = format?.toLowerCase() === "singles" ? "Singles"
    : format?.toLowerCase() === "doubles" ? "Doubles"
    : format || "";

  return [genderLabel, formatLabel].filter(Boolean).join(" ") || "Open";
};

interface SeasonDetailModalProps {
  season: Season | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (season: Season) => void;
  onManagePlayers?: (season: Season) => void;
}

export function SeasonDetailModal({
  season,
  open,
  onOpenChange,
  onEdit,
  onManagePlayers,
}: SeasonDetailModalProps) {
  const router = useRouter();

  if (!season) return null;

  const statusStyles = getStatusStyles(season.status);
  const sportStyles = getSportStyles(season.sportType);
  const leagues = season.leagues || [];
  const divisions = season.divisions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs font-medium border", statusStyles.badge)}>
              {formatStatus(season.status)}
            </Badge>
            {season.sportType && (
              <Badge variant="outline" className={cn("text-xs font-medium border", sportStyles)}>
                {season.sportType}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-medium bg-muted/50">
              {formatCategory(season.category)}
            </Badge>
            {season.isActive && (
              <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                Live
              </Badge>
            )}
          </div>

          {/* Title & Context */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl shadow-sm",
                statusStyles.bg,
                "border border-border/50"
              )}>
                <IconTrophy className="size-5 text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {season.name}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <IconHash className="size-3" />
                  <code className="font-mono text-[11px] select-all">{season.id}</code>
                </div>
              </div>
            </div>

            {/* Leagues Context */}
            {leagues.length > 0 && (
              <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border", statusStyles.bg, "border-border/50")}>
                <IconTrophy className="size-4 text-muted-foreground" />
                {leagues.slice(0, 2).map((league, idx) => (
                  <React.Fragment key={league.id}>
                    {idx > 0 && <IconChevronRight className="size-3 text-muted-foreground/50" />}
                    <span className="text-sm font-medium">{league.name}</span>
                  </React.Fragment>
                ))}
                {leagues.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{leagues.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Entry Fee Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <IconCurrencyDollar className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Entry Fee</span>
              </div>
              <div className="space-y-1">
                {season.entryFee && season.entryFee > 0 ? (
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(season.entryFee, "MYR")}
                  </span>
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">Free</span>
                )}
              </div>
            </div>

            {/* Players Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <IconUsers className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Players</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold">{season.registeredUserCount || 0}</span>
                <p className="text-xs text-muted-foreground">registered</p>
              </div>
            </div>

            {/* Divisions Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <IconCategory className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Divisions</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold">{divisions.length}</span>
                <p className="text-xs text-muted-foreground">created</p>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconCalendar className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Timeline</span>
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/50">
              <TimelineRow
                label="Registration Deadline"
                value={season.regiDeadline ? formatTableDate(season.regiDeadline) : "Not set"}
                icon={<IconClock className="size-4" />}
                highlight={season.status === "UPCOMING"}
              />
              <TimelineRow
                label="Start Date"
                value={season.startDate ? formatTableDate(season.startDate) : "Not set"}
                icon={<IconCalendar className="size-4" />}
              />
              <TimelineRow
                label="End Date"
                value={season.endDate ? formatTableDate(season.endDate) : "Not set"}
                icon={<IconCalendar className="size-4" />}
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconSettings className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Settings</span>
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/50">
              <SettingRow
                label="Payment Required"
                enabled={season.paymentRequired}
                icon={<IconCreditCard className="size-4" />}
              />
              <SettingRow
                label="Promo Codes"
                enabled={season.promoCodeSupported}
                icon={<IconTicket className="size-4" />}
              />
              <SettingRow
                label="Withdrawals"
                enabled={season.withdrawalEnabled}
                icon={<IconLogout className="size-4" />}
              />
            </div>
          </div>

          {/* Description */}
          {season.description && (
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</span>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
                {season.description}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-border/50">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { router.push(`/divisions?seasonId=${season.id}`); onOpenChange(false); }}
            >
              <IconCategory className="size-4 mr-1.5" />
              Divisions
            </Button>

            {onManagePlayers && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { onManagePlayers(season); onOpenChange(false); }}
              >
                <IconUsers className="size-4 mr-1.5" />
                Players
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => { router.push(`/seasons/${season.id}`); onOpenChange(false); }}
            >
              <IconExternalLink className="size-4 mr-1.5" />
              Full Page
            </Button>

            {onEdit && (
              <Button
                variant="default"
                size="sm"
                onClick={() => { onEdit(season); onOpenChange(false); }}
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

/** Timeline Row Component */
function TimelineRow({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3",
      highlight && "bg-blue-50/50 dark:bg-blue-950/20"
    )}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn(
        "text-sm font-medium",
        highlight && "text-blue-600 dark:text-blue-400"
      )}>
        {value}
      </span>
    </div>
  );
}

/** Setting Row Component */
function SettingRow({
  label,
  enabled,
  icon,
}: {
  label: string;
  enabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {enabled ? (
        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          <IconCheck className="size-3 mr-1" />
          Enabled
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 dark:bg-slate-900/30 dark:text-slate-400">
          <IconX className="size-3 mr-1" />
          Disabled
        </Badge>
      )}
    </div>
  );
}
