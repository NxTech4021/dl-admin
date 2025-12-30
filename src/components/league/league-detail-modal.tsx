

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { League } from "@/constants/zod/league-schema";
import { formatTableDate, formatLocation } from "@/components/data-table/constants";
import {
  IconTrophy,
  IconHash,
  IconUsers,
  IconCalendar,
  IconMapPin,
  IconEdit,
  IconExternalLink,
  IconCategory,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { getSportIcon, getSportColor, getSportLabel } from "@/constants/sports";

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
    case "ONGOING":
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
    case "SUSPENDED":
      return {
        badge: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
        bg: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20",
      };
    case "INACTIVE":
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

/** Get sport-specific background style */
const getSportBgClass = (sportType: string | null | undefined): string => {
  const sport = sportType?.toUpperCase();
  switch (sport) {
    case "TENNIS":
      return "bg-emerald-100 dark:bg-emerald-900/40";
    case "PICKLEBALL":
      return "bg-violet-100 dark:bg-violet-900/40";
    case "PADEL":
      return "bg-sky-100 dark:bg-sky-900/40";
    default:
      return "bg-primary/10";
  }
};

interface LeagueDetailModalProps {
  league: League | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (league: League) => void;
}

export function LeagueDetailModal({
  league,
  open,
  onOpenChange,
  onEdit,
}: LeagueDetailModalProps) {
  const navigate = useNavigate();

  if (!league) return null;

  const statusStyles = getStatusStyles(league.status);
  const sportColor = getSportColor(league.sportType);
  const sportLabel = getSportLabel(league.sportType);
  const sportIcon = getSportIcon(league.sportType, 20);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-4">
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs font-medium border", statusStyles.badge)}>
              {formatStatus(league.status)}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-medium border"
              style={{
                color: sportColor,
                borderColor: sportColor + "40",
                backgroundColor: sportColor + "10",
              }}
            >
              {sportLabel}
            </Badge>
          </div>

          {/* Title & Context */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl shadow-sm border border-border/50",
                getSportBgClass(league.sportType)
              )}>
                {sportIcon || <IconTrophy className="size-5 text-foreground/80" />}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {league.name}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <IconHash className="size-3" />
                  <code className="font-mono text-[11px] select-all">{league.id}</code>
                </div>
              </div>
            </div>

            {/* Location */}
            {league.location && (
              <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border", statusStyles.bg, "border-border/50")}>
                <IconMapPin className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatLocation(league.location)}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Members Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <IconUsers className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Players</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold">{league.memberCount || 0}</span>
                <p className="text-xs text-muted-foreground">total members</p>
              </div>
            </div>

            {/* Seasons Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Seasons</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold">{league.seasonCount || 0}</span>
                <p className="text-xs text-muted-foreground">created</p>
              </div>
            </div>

            {/* Divisions Card */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <IconCategory className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Divisions</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold">{league.divisionCount || 0}</span>
                <p className="text-xs text-muted-foreground">active</p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconTrophy className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Details</span>
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/50">
              <DetailRow
                label="Created"
                value={league.createdAt ? formatTableDate(league.createdAt) : "—"}
                icon={<IconCalendar className="size-4" />}
              />
            </div>
          </div>

          {/* Description */}
          {league.description && (
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</span>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
                {league.description}
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
              onClick={() => { navigate({ to: `/seasons?leagueId=${league.id}` }); onOpenChange(false); }}
            >
              <IconCalendar className="size-4 mr-1.5" />
              Seasons
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigate({ to: `/divisions?leagueId=${league.id}` }); onOpenChange(false); }}
            >
              <IconCategory className="size-4 mr-1.5" />
              Divisions
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigate({ to: `/league/view/${league.id}` }); onOpenChange(false); }}
            >
              <IconExternalLink className="size-4 mr-1.5" />
              Full Page
            </Button>

            {onEdit && (
              <Button
                variant="default"
                size="sm"
                onClick={() => { onEdit(league); onOpenChange(false); }}
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

/** Detail Row Component */
function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
