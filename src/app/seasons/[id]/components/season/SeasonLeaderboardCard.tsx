"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconTrophy,
  IconTarget,
  IconAlertCircle,
  IconChevronDown,
  IconList,
  IconCalendar,
  IconMapPin,
  IconMessage,
  IconCrown,
  IconMedal,
  IconAward,
} from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// schemas & types

export const divisionLevelEnum = z.enum(["beginner", "intermediate", "advanced"]);
export const gameTypeEnum = z.enum(["singles", "doubles"]);
export const genderCategoryEnum = z.enum(["male", "female", "mixed"]);

export const divisionSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  threshold: z.number().int().nullable().optional(),
  divisionLevel: divisionLevelEnum,
  gameType: gameTypeEnum,
  genderCategory: genderCategoryEnum,
  maxSingles: z.number().int().nullable().optional(),
  maxDoublesTeams: z.number().int().nullable().optional(),
  currentSinglesCount: z.number().int().nullable().optional(),
  currentDoublesCount: z.number().int().nullable().optional(),
  autoAssignmentEnabled: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
  prizePoolTotal: z.number().nullable().optional(),
  sponsoredDivisionName: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Division = z.infer<typeof divisionSchema>;

// API returns standings with odlayer* fields (from standingsCalculationService)
const standingSchema = z
  .object({
    odlayerId: z.string(),
    odlayerName: z.string(),
    odlayerImage: z.string().nullable().optional(),
    rank: z.number(),
    wins: z.number(),
    losses: z.number(),
    matchesPlayed: z.number(),
    matchesRemaining: z.number().optional(),
    totalPoints: z.number(),
    winPoints: z.number().optional(),
    setPoints: z.number().optional(),
    completionBonus: z.number().optional(),
    setsWon: z.number().optional(),
    setsLost: z.number().optional(),
    setDifferential: z.number().optional(),
    previousRank: z.number().optional(),
    rankChange: z.number().optional(),
  })
  .passthrough();

interface LeaderboardPlayer {
  id: string;
  name: string;
  avatarUrl?: string | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  winRate: number;
}

interface StandingsTeam {
  rank: number;
  players: LeaderboardPlayer[];
  played: number;
  wins: number;
  losses: number;
  points: number;
}

interface SetScore {
  setNumber: number;
  team1Games: number;
  team2Games: number;
  team1Tiebreak?: number | null;
  team2Tiebreak?: number | null;
  hasTiebreak: boolean;
}

interface GameScore {
  gameNumber: number;
  team1Points: number;
  team2Points: number;
}

interface MatchPlayer {
  id: string;
  name: string;
  username?: string;
  image?: string | null;
}

interface MatchResultComment {
  id: string;
  userId: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface MatchResult {
  id: string;
  matchType: string;
  matchDate: string;
  team1Score: number;
  team2Score: number;
  outcome: string;
  setScores: SetScore[];
  gameScores?: GameScore[];
  team1Players: MatchPlayer[];
  team2Players: MatchPlayer[];
  isWalkover: boolean;
  resultComment?: string;
  comments?: MatchResultComment[];
  venue?: string;
}

interface DivisionData {
  division: Division;
  standings: LeaderboardPlayer[];
  groupedStandings: StandingsTeam[];
  results: MatchResult[];
  isLoadingStandings: boolean;
  isLoadingResults: boolean;
  showResults: boolean;
}

interface SeasonLeaderboardCardProps {
  seasonId: string;
}

// utility functions

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-slate-600",
    "bg-zinc-600",
    "bg-stone-600",
    "bg-neutral-600",
    "bg-gray-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-sky-600",
    "bg-indigo-600",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const formatPlayerName = (name: string, abbreviated = false): string => {
  if (!abbreviated) return name;
  const parts = name.split(" ");
  if (parts.length === 1) return name;
  return `${parts[0]} ${parts.slice(1).map((p) => p[0]).join("")}.`;
};

const groupPlayersByTeam = (players: LeaderboardPlayer[]): StandingsTeam[] => {
  if (players.length === 0) return [];

  const groups = new Map<string, LeaderboardPlayer[]>();

  players.forEach((player) => {
    const key = `${player.points}-${player.wins}-${player.losses}-${player.matchesPlayed}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(player);
  });

  const teams: StandingsTeam[] = [];
  groups.forEach((teamPlayers) => {
    const sortedPlayers = teamPlayers.sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < sortedPlayers.length; i += 2) {
      const pair = sortedPlayers.slice(i, i + 2);
      teams.push({
        rank: 0,
        players: pair,
        played: pair[0].matchesPlayed,
        wins: pair[0].wins,
        losses: pair[0].losses,
        points: pair[0].points,
      });
    }
  });

  teams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aWinRate = a.played > 0 ? a.wins / a.played : 0;
    const bWinRate = b.played > 0 ? b.wins / b.played : 0;
    return bWinRate - aWinRate;
  });

  teams.forEach((team, index) => {
    team.rank = index + 1;
  });

  return teams;
};

// sub-components

const PositionBadge = ({ position }: { position: number }) => {
  if (position === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-sm">
        <IconCrown className="size-4 text-amber-900" />
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400 shadow-sm">
        <IconMedal className="size-4 text-slate-700" />
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 via-amber-400 to-orange-500 shadow-sm">
        <IconAward className="size-4 text-orange-900" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
      <span className="text-sm font-semibold text-muted-foreground">{position}</span>
    </div>
  );
};

// Helper to get avatar URL from either LeaderboardPlayer or MatchPlayer
const getPlayerAvatarUrl = (player: LeaderboardPlayer | MatchPlayer): string | null | undefined => {
  if ("avatarUrl" in player) {
    return (player as LeaderboardPlayer).avatarUrl;
  }
  return (player as MatchPlayer).image;
};

const TeamAvatars = ({
  players,
  size = "md",
}: {
  players: LeaderboardPlayer[] | MatchPlayer[];
  size?: "sm" | "md";
}) => {
  const sizeClasses = size === "sm" ? "size-7" : "size-9";
  const overlapClasses = size === "sm" ? "-ml-2" : "-ml-3";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  if (players.length === 1) {
    const player = players[0];
    const avatarUrl = getPlayerAvatarUrl(player);
    return (
      <Avatar className={cn(sizeClasses, "ring-2 ring-background")}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback
          className={cn("text-white font-semibold", textSize, getAvatarColor(player.name))}
        >
          {getInitials(player.name)}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="flex items-center">
      {players.slice(0, 2).map((player, idx) => {
        const avatarUrl = getPlayerAvatarUrl(player);
        return (
          <Avatar
            key={player.id || idx}
            className={cn(
              sizeClasses,
              "ring-2 ring-background",
              idx > 0 && overlapClasses
            )}
            style={{ zIndex: 2 - idx }}
          >
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback
              className={cn("text-white font-semibold", textSize, getAvatarColor(player.name))}
            >
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
        );
      })}
    </div>
  );
};

const MatchResultCard = ({
  match,
  expandedComments,
  onToggleComments,
}: {
  match: MatchResult;
  expandedComments: Set<string>;
  onToggleComments: (matchId: string) => void;
}) => {
  const isTeam1Winner = match.outcome === "team1";
  const isTeam2Winner = match.outcome === "team2";
  const isPickleball = match.matchType?.toLowerCase().includes("pickleball");
  const scores = isPickleball ? match.gameScores : match.setScores;
  const commentsExpanded = expandedComments.has(match.id);
  const visibleComments = commentsExpanded
    ? match.comments
    : match.comments?.slice(0, 2);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header with venue and date */}
      <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconMapPin className="size-3.5" />
          <span className="font-medium">{match.venue || "Venue TBD"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="size-3.5" />
          <span>{format(new Date(match.matchDate), "d MMM yyyy")}</span>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 */}
          <div className="flex-1 text-center space-y-2">
            <div className="flex justify-center">
              <TeamAvatars players={match.team1Players} size="md" />
            </div>
            <div
              className={cn(
                "text-sm font-medium leading-tight",
                isTeam1Winner && "text-emerald-600"
              )}
            >
              {match.team1Players.map((p) => formatPlayerName(p.name, true)).join(" & ")}
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  isTeam1Winner ? "text-emerald-600" : "text-foreground"
                )}
              >
                {match.team1Score}
              </span>
              <span className="text-xl text-muted-foreground font-light">-</span>
              <span
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  isTeam2Winner ? "text-emerald-600" : "text-foreground"
                )}
              >
                {match.team2Score}
              </span>
            </div>
            {match.isWalkover && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Walkover
              </Badge>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-center space-y-2">
            <div className="flex justify-center">
              <TeamAvatars players={match.team2Players} size="md" />
            </div>
            <div
              className={cn(
                "text-sm font-medium leading-tight",
                isTeam2Winner && "text-emerald-600"
              )}
            >
              {match.team2Players.map((p) => formatPlayerName(p.name, true)).join(" & ")}
            </div>
          </div>
        </div>

        {/* Set/Game Scores */}
        {scores && scores.length > 0 && (
          <div className="mt-4 rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold py-2 w-[120px]">
                    Player
                  </TableHead>
                  {scores.map((_, idx) => (
                    <TableHead
                      key={idx}
                      className="text-xs font-semibold text-center py-2 w-12"
                    >
                      {isPickleball ? `G${idx + 1}` : `S${idx + 1}`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-2 text-xs font-medium">
                    {formatPlayerName(match.team1Players[0]?.name || "", true)}
                  </TableCell>
                  {isPickleball
                    ? (match.gameScores || []).map((game, idx) => {
                        const isWinning = game.team1Points > game.team2Points;
                        return (
                          <TableCell
                            key={idx}
                            className={cn(
                              "py-2 text-center text-sm tabular-nums",
                              isWinning
                                ? "text-emerald-600 font-bold"
                                : "text-muted-foreground"
                            )}
                          >
                            {game.team1Points}
                          </TableCell>
                        );
                      })
                    : match.setScores.map((set, idx) => {
                        const isWinning = set.team1Games > set.team2Games;
                        return (
                          <TableCell
                            key={idx}
                            className={cn(
                              "py-2 text-center text-sm tabular-nums",
                              isWinning
                                ? "text-emerald-600 font-bold"
                                : "text-muted-foreground"
                            )}
                          >
                            {set.team1Games}
                            {set.hasTiebreak && set.team1Tiebreak != null && (
                              <sup className="text-[10px] ml-0.5">
                                ({set.team1Tiebreak})
                              </sup>
                            )}
                          </TableCell>
                        );
                      })}
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-2 text-xs font-medium">
                    {formatPlayerName(match.team2Players[0]?.name || "", true)}
                  </TableCell>
                  {isPickleball
                    ? (match.gameScores || []).map((game, idx) => {
                        const isWinning = game.team2Points > game.team1Points;
                        return (
                          <TableCell
                            key={idx}
                            className={cn(
                              "py-2 text-center text-sm tabular-nums",
                              isWinning
                                ? "text-emerald-600 font-bold"
                                : "text-muted-foreground"
                            )}
                          >
                            {game.team2Points}
                          </TableCell>
                        );
                      })
                    : match.setScores.map((set, idx) => {
                        const isWinning = set.team2Games > set.team1Games;
                        return (
                          <TableCell
                            key={idx}
                            className={cn(
                              "py-2 text-center text-sm tabular-nums",
                              isWinning
                                ? "text-emerald-600 font-bold"
                                : "text-muted-foreground"
                            )}
                          >
                            {set.team2Games}
                            {set.hasTiebreak && set.team2Tiebreak != null && (
                              <sup className="text-[10px] ml-0.5">
                                ({set.team2Tiebreak})
                              </sup>
                            )}
                          </TableCell>
                        );
                      })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Comments */}
        {match.comments && match.comments.length > 0 && (
          <div className="mt-4 pt-3 border-t space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconMessage className="size-3.5" />
              <span className="font-medium">
                {match.comments.length} Comment{match.comments.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {visibleComments?.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="size-6 ring-1 ring-border">
                    <AvatarImage src={comment.user.image || undefined} />
                    <AvatarFallback
                      className={cn(
                        "text-[10px] text-white font-semibold",
                        getAvatarColor(comment.user.name)
                      )}
                    >
                      {getInitials(comment.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">
                      <span className="font-semibold text-foreground">
                        {comment.user.name.split(" ")[0]}:
                      </span>{" "}
                      <span className="text-muted-foreground">{comment.comment}</span>
                    </p>
                  </div>
                </div>
              ))}
              {match.comments.length > 2 && (
                <button
                  onClick={() => onToggleComments(match.id)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {commentsExpanded
                    ? "Show less"
                    : `View ${match.comments.length - 2} more`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Legacy result comment fallback */}
        {(!match.comments || match.comments.length === 0) && match.resultComment && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground italic">
              {match.resultComment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// main component

export default function SeasonLeaderboardCard({
  seasonId,
}: SeasonLeaderboardCardProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [divisionDataMap, setDivisionDataMap] = useState<Map<string, DivisionData>>(
    new Map()
  );
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("all");
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Fetch divisions on mount
  useEffect(() => {
    const fetchDivisions = async () => {
      setIsLoadingDivisions(true);
      try {
        const response = await axiosInstance.get(
          endpoints.division.getBySeasonId(seasonId)
        );
        // API returns { success: true, data: [...] }
        const divisionsData = response.data?.data;
        if (!divisionsData || !Array.isArray(divisionsData)) {
          setDivisions([]);
          return;
        }
        const parsed = z.array(divisionSchema).parse(divisionsData);
        setDivisions(parsed);

        // Initialize division data map
        const newMap = new Map<string, DivisionData>();
        parsed.forEach((div) => {
          newMap.set(div.id, {
            division: div,
            standings: [],
            groupedStandings: [],
            results: [],
            isLoadingStandings: false,
            isLoadingResults: false,
            showResults: false,
          });
        });
        setDivisionDataMap(newMap);

        // Expand first division by default
        if (parsed.length > 0) {
          setExpandedDivisions(new Set([parsed[0].id]));
        }
      } catch (err) {
        console.error("Failed to fetch divisions:", err);
        setDivisions([]);
      } finally {
        setIsLoadingDivisions(false);
      }
    };

    if (seasonId) {
      fetchDivisions();
    }
  }, [seasonId]);

  // Fetch standings when a division is expanded or selected
  const fetchStandings = useCallback(
    async (divisionId: string) => {
      const existing = divisionDataMap.get(divisionId);
      if (!existing || existing.standings.length > 0 || existing.isLoadingStandings) {
        return;
      }

      setDivisionDataMap((prev) => {
        const data = prev.get(divisionId);
        if (data) {
          return new Map(prev).set(divisionId, { ...data, isLoadingStandings: true });
        }
        return prev;
      });

      try {
        const response = await axiosInstance.get(
          `/api/standings/division/${divisionId}`
        );

        if (!response.data?.data || !Array.isArray(response.data.data)) {
          setDivisionDataMap((prev) => {
            const data = prev.get(divisionId);
            if (data) {
              return new Map(prev).set(divisionId, {
                ...data,
                isLoadingStandings: false,
              });
            }
            return prev;
          });
          return;
        }

        const parsedStandings = z.array(standingSchema).parse(response.data.data);

        // Transform from API format (odlayer*) to component format
        const players: LeaderboardPlayer[] = parsedStandings.map((standing) => ({
          id: standing.odlayerId,
          name: standing.odlayerName || "Unknown Player",
          avatarUrl: standing.odlayerImage || null,
          matchesPlayed: standing.matchesPlayed,
          wins: standing.wins,
          losses: standing.losses,
          points: standing.totalPoints,
          winRate:
            standing.matchesPlayed > 0
              ? Math.round((standing.wins / standing.matchesPlayed) * 100)
              : 0,
        }));

        players.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.winRate - a.winRate;
        });

        const division = divisions.find((d) => d.id === divisionId);
        const isDoubles = division?.gameType === "doubles";
        const groupedStandings = isDoubles ? groupPlayersByTeam(players) : [];

        setDivisionDataMap((prev) => {
          const data = prev.get(divisionId);
          if (data) {
            return new Map(prev).set(divisionId, {
              ...data,
              standings: players,
              groupedStandings,
              isLoadingStandings: false,
            });
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to fetch standings:", err);
        setDivisionDataMap((prev) => {
          const data = prev.get(divisionId);
          if (data) {
            return new Map(prev).set(divisionId, { ...data, isLoadingStandings: false });
          }
          return prev;
        });
      }
    },
    [divisionDataMap, divisions]
  );

  // Fetch results for a division
  const fetchResults = useCallback(
    async (divisionId: string) => {
      const existing = divisionDataMap.get(divisionId);
      if (!existing || existing.results.length > 0 || existing.isLoadingResults) {
        return;
      }

      setDivisionDataMap((prev) => {
        const data = prev.get(divisionId);
        if (data) {
          return new Map(prev).set(divisionId, { ...data, isLoadingResults: true });
        }
        return prev;
      });

      try {
        const response = await axiosInstance.get(
          endpoints.match.getDivisionResults(divisionId),
          { params: { limit: 20 } }
        );

        const matchesData = response.data.matches || response.data.data || [];

        setDivisionDataMap((prev) => {
          const data = prev.get(divisionId);
          if (data) {
            return new Map(prev).set(divisionId, {
              ...data,
              results: matchesData,
              isLoadingResults: false,
            });
          }
          return prev;
        });
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setDivisionDataMap((prev) => {
          const data = prev.get(divisionId);
          if (data) {
            return new Map(prev).set(divisionId, {
              ...data,
              results: [],
              isLoadingResults: false,
            });
          }
          return prev;
        });
      }
    },
    [divisionDataMap]
  );

  // Handle division expansion
  const handleDivisionExpand = useCallback(
    (divisionId: string) => {
      setExpandedDivisions((prev) => {
        const next = new Set(prev);
        if (next.has(divisionId)) {
          next.delete(divisionId);
        } else {
          next.add(divisionId);
          fetchStandings(divisionId);
        }
        return next;
      });
    },
    [fetchStandings]
  );

  // Handle results toggle
  const handleResultsToggle = useCallback(
    (divisionId: string) => {
      setDivisionDataMap((prev) => {
        const data = prev.get(divisionId);
        if (data) {
          const newShowResults = !data.showResults;
          if (newShowResults && data.results.length === 0 && !data.isLoadingResults) {
            fetchResults(divisionId);
          }
          return new Map(prev).set(divisionId, { ...data, showResults: newShowResults });
        }
        return prev;
      });
    },
    [fetchResults]
  );

  // Handle comment expansion toggle
  const handleToggleComments = useCallback((matchId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) {
        next.delete(matchId);
      } else {
        next.add(matchId);
      }
      return next;
    });
  }, []);

  // Handle division selection change
  const handleDivisionChange = useCallback(
    (value: string) => {
      setSelectedDivisionId(value);
      if (value !== "all") {
        setExpandedDivisions(new Set([value]));
        fetchStandings(value);
      }
    },
    [fetchStandings]
  );

  // Effect to load standings for expanded divisions
  useEffect(() => {
    expandedDivisions.forEach((divId) => {
      fetchStandings(divId);
    });
  }, [expandedDivisions, fetchStandings]);

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);
  const visibleDivisions =
    selectedDivisionId === "all"
      ? divisions
      : divisions.filter((d) => d.id === selectedDivisionId);

  // render helpers

  const renderDivisionCard = (division: Division, isExpanded: boolean) => {
    const data = divisionDataMap.get(division.id);
    const isDoubles = division.gameType === "doubles";
    const standings = isDoubles
      ? data?.groupedStandings || []
      : data?.standings || [];
    const results = data?.results || [];

    return (
      <div
        key={division.id}
        className="rounded-xl border bg-card overflow-hidden"
      >
        <Collapsible open={isExpanded} onOpenChange={() => handleDivisionExpand(division.id)}>
          {/* Division Header */}
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <IconTarget className="size-4 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm">{division.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {division.gameType}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {division.divisionLevel}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {division.genderCategory}
                    </Badge>
                  </div>
                </div>
              </div>
              <IconChevronDown
                className={cn(
                  "size-5 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t">
              {/* Standings Table */}
              <div className="p-4">
                {data?.isLoadingStandings ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : standings.length === 0 ? (
                  <div className="text-center py-8">
                    <IconAlertCircle className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No standings yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Matches need to be played to generate standings
                    </p>
                  </div>
                ) : isDoubles ? (
                  // Doubles standings table
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-14 text-center">#</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="w-12 text-center">P</TableHead>
                          <TableHead className="w-12 text-center">W</TableHead>
                          <TableHead className="w-12 text-center">L</TableHead>
                          <TableHead className="w-16 text-center">Pts</TableHead>
                          <TableHead className="w-20 text-center">Win %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(standings as StandingsTeam[]).map((team) => {
                          const winRate =
                            team.played > 0
                              ? Math.round((team.wins / team.played) * 100)
                              : 0;
                          return (
                            <TableRow key={`team-${team.rank}`} className="hover:bg-muted/30">
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <PositionBadge position={team.rank} />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <TeamAvatars players={team.players} size="sm" />
                                  <span className="text-sm font-medium">
                                    {team.players
                                      .map((p) => formatPlayerName(p.name, true))
                                      .join(" & ")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-sm font-medium">
                                {team.played}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-semibold text-emerald-600">
                                  {team.wins}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-semibold text-red-500">
                                  {team.losses}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="font-bold">
                                  {team.points}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-medium">{winRate}%</span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  // Singles standings table
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-14 text-center">#</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead className="w-12 text-center">P</TableHead>
                          <TableHead className="w-12 text-center">W</TableHead>
                          <TableHead className="w-12 text-center">L</TableHead>
                          <TableHead className="w-16 text-center">Pts</TableHead>
                          <TableHead className="w-20 text-center">Win %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(standings as LeaderboardPlayer[]).map((player, index) => (
                          <TableRow key={player.id} className="hover:bg-muted/30">
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <PositionBadge position={index + 1} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <TeamAvatars players={[player]} size="sm" />
                                <span className="text-sm font-medium">{player.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-sm font-medium">
                              {player.matchesPlayed}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm font-semibold text-emerald-600">
                                {player.wins}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm font-semibold text-red-500">
                                {player.losses}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-bold">
                                {player.points}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm font-medium">{player.winRate}%</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Stats Summary */}
                {!data?.isLoadingStandings && standings.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">
                        {isDoubles
                          ? (standings as StandingsTeam[]).length
                          : data?.standings.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {isDoubles ? "Teams" : "Players"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-emerald-600">
                        {isDoubles
                          ? (standings as StandingsTeam[]).reduce((sum, t) => sum + t.wins, 0)
                          : (standings as LeaderboardPlayer[]).reduce(
                              (sum, p) => sum + p.wins,
                              0
                            )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Total Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-sky-600">
                        {isDoubles
                          ? Math.round(
                              (standings as StandingsTeam[]).reduce(
                                (sum, t) =>
                                  sum + (t.played > 0 ? (t.wins / t.played) * 100 : 0),
                                0
                              ) / standings.length
                            )
                          : Math.round(
                              (standings as LeaderboardPlayer[]).reduce(
                                (sum, p) => sum + p.winRate,
                                0
                              ) / standings.length
                            )}
                        %
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Avg Win Rate</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Section */}
              <Collapsible
                open={data?.showResults}
                onOpenChange={() => handleResultsToggle(division.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-primary">View Match Results</span>
                    <IconChevronDown
                      className={cn(
                        "size-4 text-primary transition-transform duration-200",
                        data?.showResults && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 border-t bg-muted/20">
                    {data?.isLoadingResults ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-32 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : results.length === 0 ? (
                      <div className="text-center py-8">
                        <IconTrophy className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No completed matches yet
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px] pr-3">
                        <div className="space-y-3">
                          {results
                            .sort(
                              (a, b) =>
                                new Date(b.matchDate).getTime() -
                                new Date(a.matchDate).getTime()
                            )
                            .map((match) => (
                              <MatchResultCard
                                key={match.id}
                                match={match}
                                expandedComments={expandedComments}
                                onToggleComments={handleToggleComments}
                              />
                            ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingDivisions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-[300px]" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // empty state

  if (divisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <IconTrophy className="size-8 opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">No divisions found</p>
                <p className="text-sm">Create a division to see leaderboards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // main render

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <IconTrophy className="size-5" />
          Leaderboard
        </CardTitle>
        <Select value={selectedDivisionId} onValueChange={handleDivisionChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue>
              {selectedDivisionId === "all" ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                    <IconList className="size-3.5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">All Divisions</span>
                </div>
              ) : (
                selectedDivision && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
                      <IconTarget className="size-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm truncate">
                      {selectedDivision.name}
                    </span>
                  </div>
                )
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-3 py-1">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                  <IconList className="size-4 text-primary" />
                </div>
                <span className="font-medium text-sm">All Divisions</span>
              </div>
            </SelectItem>
            <div className="my-1 mx-2 h-px bg-border" />
            {divisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <IconTarget className="size-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{division.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">
                      {division.gameType} &middot; {division.divisionLevel}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleDivisions.map((division) =>
            renderDivisionCard(
              division,
              selectedDivisionId === "all"
                ? expandedDivisions.has(division.id)
                : true
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
