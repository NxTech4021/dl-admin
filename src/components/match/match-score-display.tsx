import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCrown } from "@tabler/icons-react";
import { getInitials, getStatusBadgeColor } from "@/components/data-table/constants";
import { cn } from "@/lib/utils";
import { getDisplayName } from "@/lib/utils/format";
import type { Match } from "@/constants/zod/match-schema";

/** Get sport-specific styling */
export const getSportStyles = (sport: string | null | undefined) => {
  switch (sport?.toLowerCase()) {
    case "tennis":
      return {
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        accent: "bg-emerald-500",
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
      };
    case "badminton":
      return {
        badge: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        accent: "bg-rose-500",
        bg: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20",
      };
    case "pickleball":
      return {
        badge: "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
        accent: "bg-violet-500",
        bg: "bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20",
      };
    case "padel":
      return {
        badge: "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
        accent: "bg-sky-500",
        bg: "bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20",
      };
    default:
      return {
        badge: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700",
        accent: "bg-slate-500",
        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/20",
      };
  }
};

export type SportStyles = ReturnType<typeof getSportStyles>;

/** Info Card Component */
export function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

/** Singles VS Display */
export function SinglesDisplay({
  participants,
  isDraft,
  score,
  winningSide
}: {
  participants: Match["participants"];
  isDraft: boolean;
  score: { team1: number; team2: number } | null;
  winningSide: "team1" | "team2" | null;
}) {
  const player1 = participants?.[0];
  const player2 = participants?.[1];

  return (
    <div className="flex items-center gap-3">
      {/* Player 1 */}
      <div className="flex-1 flex items-center gap-3">
        <div className="relative">
          {winningSide === "team1" && (
            <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm" />
          )}
          <Avatar className={cn(
            "size-14 ring-2 ring-background shadow-sm",
            winningSide === "team1" && "ring-amber-400 ring-4"
          )}>
            <AvatarImage src={player1?.user?.image || undefined} />
            <AvatarFallback className="text-base font-medium bg-muted">
              {getInitials(getDisplayName(player1?.user))}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold truncate", winningSide === "team1" && "text-amber-600 dark:text-amber-400")}>
            {getDisplayName(player1?.user)}
          </p>
          {isDraft && player1?.invitationStatus && (
            <Badge
              variant="outline"
              className={cn("text-[10px] mt-0.5", getStatusBadgeColor("INVITATION", player1.invitationStatus))}
            >
              {player1.invitationStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* VS / Score */}
      <div className="flex-shrink-0 text-center px-2">
        {score ? (
          <div className="space-y-0.5">
            <div className="font-mono text-2xl font-bold tracking-tight">
              <span className={winningSide === "team1" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team1}</span>
              <span className="text-muted-foreground mx-1">-</span>
              <span className={winningSide === "team2" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team2}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final</div>
          </div>
        ) : (
          <div className="text-xl font-bold text-muted-foreground/50">VS</div>
        )}
      </div>

      {/* Player 2 */}
      <div className="flex-1 flex items-center gap-3 justify-end text-right">
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold truncate", winningSide === "team2" && "text-amber-600 dark:text-amber-400")}>
            {player2 ? getDisplayName(player2?.user) : "TBD"}
          </p>
          {isDraft && player2?.invitationStatus && (
            <Badge
              variant="outline"
              className={cn("text-[10px] mt-0.5", getStatusBadgeColor("INVITATION", player2.invitationStatus))}
            >
              {player2.invitationStatus}
            </Badge>
          )}
        </div>
        <div className="relative">
          {winningSide === "team2" && (
            <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm" />
          )}
          <Avatar className={cn(
            "size-14 ring-2 ring-background shadow-sm",
            winningSide === "team2" && "ring-amber-400 ring-4"
          )}>
            <AvatarImage src={player2?.user?.image || undefined} />
            <AvatarFallback className="text-base font-medium bg-muted">
              {player2 ? getInitials(getDisplayName(player2?.user)) : "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

/** Doubles VS Display */
export function DoublesDisplay({
  participants,
  isDraft,
  score,
  winningSide
}: {
  participants: Match["participants"];
  isDraft: boolean;
  score: { team1: number; team2: number } | null;
  winningSide: "team1" | "team2" | null;
}) {
  const team1 = participants?.filter(p => p.team === "team1") || [];
  const team2 = participants?.filter(p => p.team === "team2") || [];

  const getTeamStatus = (team: typeof team1) => {
    if (!isDraft) return null;
    const declined = team.some(p => p.invitationStatus === "DECLINED");
    const expired = team.some(p => p.invitationStatus === "EXPIRED");
    const pending = team.some(p => p.invitationStatus === "PENDING");

    if (declined) return { status: "DECLINED", color: getStatusBadgeColor("INVITATION", "DECLINED") };
    if (expired) return { status: "EXPIRED", color: getStatusBadgeColor("INVITATION", "EXPIRED") };
    if (pending) return { status: "PENDING", color: getStatusBadgeColor("INVITATION", "PENDING") };
    return null;
  };

  const team1Status = getTeamStatus(team1);
  const team2Status = getTeamStatus(team2);

  return (
    <div className="flex items-center gap-3">
      {/* Team 1 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            {winningSide === "team1" && (
              <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm z-10" />
            )}
            <div className={cn(
              "flex -space-x-2 rounded-full",
              winningSide === "team1" && "ring-4 ring-amber-400"
            )}>
              {team1.slice(0, 2).map((player) => (
                <Avatar key={player.id} className="size-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={player.user?.image || undefined} />
                  <AvatarFallback className="text-xs font-medium bg-muted">
                    {getInitials(getDisplayName(player.user))}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team1.length === 0 && (
                <Avatar className="size-10 ring-2 ring-background">
                  <AvatarFallback className="text-xs">?</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-semibold text-sm truncate",
              winningSide === "team1" && "text-amber-600 dark:text-amber-400"
            )}>
              {team1.length > 0
                ? team1.map(p => getDisplayName(p.user).split(' ')[0]).join(' & ')
                : "TBD"
              }
            </p>
            {team1Status && (
              <Badge variant="outline" className={cn("text-[10px] mt-0.5", team1Status.color)}>
                {team1Status.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* VS / Score */}
      <div className="flex-shrink-0 text-center px-2">
        {score ? (
          <div className="space-y-0.5">
            <div className="font-mono text-2xl font-bold tracking-tight">
              <span className={winningSide === "team1" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team1}</span>
              <span className="text-muted-foreground mx-1">-</span>
              <span className={winningSide === "team2" ? "text-amber-600 dark:text-amber-400" : ""}>{score.team2}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final</div>
          </div>
        ) : (
          <div className="text-xl font-bold text-muted-foreground/50">VS</div>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex-1">
        <div className="flex items-center gap-2 justify-end text-right">
          <div className="min-w-0 flex-1">
            <p className={cn(
              "font-semibold text-sm truncate",
              winningSide === "team2" && "text-amber-600 dark:text-amber-400"
            )}>
              {team2.length > 0
                ? team2.map(p => getDisplayName(p.user).split(' ')[0]).join(' & ')
                : "TBD"
              }
            </p>
            {team2Status && (
              <Badge variant="outline" className={cn("text-[10px] mt-0.5", team2Status.color)}>
                {team2Status.status}
              </Badge>
            )}
          </div>
          <div className="relative">
            {winningSide === "team2" && (
              <IconCrown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-500 fill-amber-400 drop-shadow-sm z-10" />
            )}
            <div className={cn(
              "flex -space-x-2 rounded-full",
              winningSide === "team2" && "ring-4 ring-amber-400"
            )}>
              {team2.slice(0, 2).map((player) => (
                <Avatar key={player.id} className="size-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={player.user?.image || undefined} />
                  <AvatarFallback className="text-xs font-medium bg-muted">
                    {getInitials(getDisplayName(player.user))}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team2.length === 0 && (
                <Avatar className="size-10 ring-2 ring-background">
                  <AvatarFallback className="text-xs">?</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Parse and normalize set scores from various backend formats */
interface NormalizedSetScore {
  setNumber: number;
  team1Score: number;
  team2Score: number;
  team1Tiebreak?: number;
  team2Tiebreak?: number;
  hasTiebreak?: boolean;
}

function parseSetScores(setScores: unknown, _sport?: string | null): NormalizedSetScore[] {
  if (!setScores) return [];

  try {
    // Parse if it's a JSON string
    const parsed = typeof setScores === 'string' ? JSON.parse(setScores) : setScores;

    // Handle array format (most common): [{ setNumber, team1Games, team2Games }, ...]
    if (Array.isArray(parsed)) {
      return parsed.map((set, idx) => ({
        setNumber: set.setNumber ?? idx + 1,
        team1Score: set.team1Games ?? set.player1Games ?? set.player1 ?? set.team1Points ?? set.player1Points ?? 0,
        team2Score: set.team2Games ?? set.player2Games ?? set.player2 ?? set.team2Points ?? set.player2Points ?? 0,
        team1Tiebreak: set.team1Tiebreak ?? set.player1Tiebreak,
        team2Tiebreak: set.team2Tiebreak ?? set.player2Tiebreak,
        hasTiebreak: set.hasTiebreak ?? (set.team1Tiebreak !== undefined || set.player1Tiebreak !== undefined),
      }));
    }

    // Handle object with sets array: { sets: [{ player1, player2 }, ...] }
    if (parsed.sets && Array.isArray(parsed.sets)) {
      return parsed.sets.map((set: Record<string, unknown>, idx: number) => ({
        setNumber: idx + 1,
        team1Score: (set.player1 ?? set.team1 ?? 0) as number,
        team2Score: (set.player2 ?? set.team2 ?? 0) as number,
      }));
    }

    // Handle object with games array (pickleball): { games: [{ player1, player2 }, ...] }
    if (parsed.games && Array.isArray(parsed.games)) {
      return parsed.games.map((game: Record<string, unknown>, idx: number) => ({
        setNumber: idx + 1,
        team1Score: (game.player1 ?? game.team1 ?? game.player1Points ?? game.team1Points ?? 0) as number,
        team2Score: (game.player2 ?? game.team2 ?? game.player2Points ?? game.team2Points ?? 0) as number,
      }));
    }

    return [];
  } catch {
    return [];
  }
}

/** Set Scores Display Component */
export function SetScoresDisplay({ setScores, sport }: { setScores: unknown; sport?: string | null }) {
  const normalizedScores = parseSetScores(setScores, sport);

  if (normalizedScores.length === 0) return null;

  const isPickleball = sport?.toLowerCase() === 'pickleball';
  const setLabel = isPickleball ? 'Game' : 'Set';

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center justify-center gap-4">
        {normalizedScores.map((set) => (
          <div key={set.setNumber} className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              {setLabel} {set.setNumber}
            </div>
            <div className="font-mono text-sm font-semibold">
              {set.team1Score}-{set.team2Score}
              {set.hasTiebreak && set.team1Tiebreak !== undefined && set.team2Tiebreak !== undefined && (
                <span className="text-xs text-muted-foreground ml-0.5">
                  ({set.team1Tiebreak}-{set.team2Tiebreak})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
