"use client";

import React, { useState, useEffect } from "react";
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
import { IconTrophy, IconTarget, IconAlertCircle } from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { z } from "zod";

// Division schema for validation
export const divisionLevelEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);
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

// Standing schema from API
const standingSchema = z.object({
  id: z.string(),
  rank: z.number(),
  userId: z.string(),
  wins: z.number(),
  losses: z.number(),
  matchesPlayed: z.number(),
  totalPoints: z.number(),
  setsWon: z.number().optional(),
  setsLost: z.number().optional(),
  gamesWon: z.number().optional(),
  gamesLost: z.number().optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }).optional(),
}).passthrough();

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

interface SeasonLeaderboardCardProps {
  seasonId: string;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getPositionBadge = (position: number) => {
  switch (position) {
    case 1:
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 font-bold">
          #1
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white border-0 font-bold">
          #2
        </Badge>
      );
    case 3:
      return (
        <Badge className="bg-gradient-to-r from-amber-600 to-amber-800 text-white border-0 font-bold">
          #3
        </Badge>
      );
    default:
      return (
        <span className="text-muted-foreground font-medium">#{position}</span>
      );
  }
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function SeasonLeaderboardCard({
  seasonId,
}: SeasonLeaderboardCardProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [standings, setStandings] = useState<LeaderboardPlayer[]>([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  // Fetch divisions on mount
  useEffect(() => {
    const fetchDivisions = async () => {
      setIsLoadingDivisions(true);
      try {
        const response = await axiosInstance.get(
          `${endpoints.division.getAll}?seasonId=${seasonId}`
        );
        if (!response.data || !Array.isArray(response.data)) {
          setDivisions([]);
          return;
        }
        const parsed = z.array(divisionSchema).parse(response.data);
        setDivisions(parsed);

        // Set first division as selected if available
        if (parsed.length > 0) {
          setSelectedDivisionId(parsed[0].id);
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

  // Fetch standings when division changes
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedDivisionId) {
        setStandings([]);
        return;
      }

      setIsLoadingStandings(true);
      try {
        const response = await axiosInstance.get(
          `/api/standings/division/${selectedDivisionId}`
        );

        if (!response.data?.data || !Array.isArray(response.data.data)) {
          setStandings([]);
          return;
        }

        // Parse and transform standings to LeaderboardPlayer format
        const parsedStandings = z.array(standingSchema).parse(response.data.data);

        const players: LeaderboardPlayer[] = parsedStandings.map((standing) => ({
          id: standing.userId,
          name: standing.user?.name || "Unknown Player",
          avatarUrl: standing.user?.image || null,
          matchesPlayed: standing.matchesPlayed,
          wins: standing.wins,
          losses: standing.losses,
          points: standing.totalPoints,
          winRate: standing.matchesPlayed > 0
            ? Math.round((standing.wins / standing.matchesPlayed) * 100)
            : 0,
        }));

        // Sort by points (descending), then by win rate
        players.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.winRate - a.winRate;
        });

        setStandings(players);
      } catch (err) {
        console.error("Failed to fetch standings:", err);
        setStandings([]);
        // Don't show error for empty standings - it's expected for new divisions
      } finally {
        setIsLoadingStandings(false);
      }
    };

    fetchStandings();
  }, [selectedDivisionId]);

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);

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
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <IconTrophy className="size-12 opacity-50" />
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <IconTrophy className="size-5" />
          Leaderboard
        </CardTitle>
        <Select
          value={selectedDivisionId}
          onValueChange={setSelectedDivisionId}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Choose a division">
              {selectedDivision && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <IconTarget className="size-3 text-primary" />
                  </div>
                  <div className="font-medium text-sm">
                    {selectedDivision.name}{" "}
                    <span className="text-xs text-muted-foreground capitalize">
                      ({selectedDivision.divisionLevel} •{" "}
                      {selectedDivision.gameType})
                    </span>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconTarget className="size-4 text-primary" />
                  </div>
                  <div className="font-medium text-sm">
                    {division.name}{" "}
                    <span className="text-xs text-muted-foreground capitalize">
                      ({division.divisionLevel} • {division.gameType})
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Leaderboard Table */}
        {selectedDivision && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{selectedDivision.name}</h3>
              <Badge variant="outline" className="text-xs capitalize">
                {selectedDivision.gameType} • {selectedDivision.divisionLevel}
              </Badge>
            </div>

            {isLoadingStandings ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : standings.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <IconAlertCircle className="size-10 opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No standings yet</p>
                    <p className="text-xs">Matches need to be played to generate standings</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">#</TableHead>
                        <TableHead className="w-[200px]">Player</TableHead>
                        <TableHead className="w-[60px] text-center">P</TableHead>
                        <TableHead className="w-[60px] text-center">W</TableHead>
                        <TableHead className="w-[60px] text-center">L</TableHead>
                        <TableHead className="w-[80px] text-center">Pts</TableHead>
                        <TableHead className="w-[100px] text-center">
                          Win Rate
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((player, index) => (
                        <TableRow key={player.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {getPositionBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage src={player.avatarUrl || undefined} />
                                <AvatarFallback
                                  className={`text-white text-sm font-semibold ${getAvatarColor(
                                    player.name
                                  )}`}
                                >
                                  {getInitials(player.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">
                                  {player.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {player.matchesPlayed}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-semibold">
                              {player.wins}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-red-600 font-semibold">
                              {player.losses}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-bold">
                              {player.points}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="text-sm">
                              <div className="font-medium">{player.winRate}%</div>
                              <div className="text-xs text-muted-foreground">
                                {player.wins}/{player.matchesPlayed}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {standings.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Players
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {standings.reduce((sum, p) => sum + p.wins, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {standings.length > 0
                        ? Math.round(
                            standings.reduce((sum, p) => sum + p.winRate, 0) /
                              standings.length
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Win Rate
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
