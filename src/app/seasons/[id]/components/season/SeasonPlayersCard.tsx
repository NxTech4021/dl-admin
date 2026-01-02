"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FilterSelect } from "@/components/ui/filter-select";
import { Membership } from "@/constants/zod/season-schema";
import { Division } from "@/constants/zod/division-schema";
import {
  IconUser,
  IconSearch,
  IconX,
  IconUsers,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import AssignDivisionModal from "@/components/modal/assign-playerToDivision";
import { cn } from "@/lib/utils";

interface SeasonPlayersCardProps {
  memberships: Membership[];
  divisions: Division[];
  sportType?: string | null;
  seasonId: string;
  onMembershipUpdated?: () => Promise<void>;
  adminId?: string;
  season?: {
    leagues?: Array<{
      id: string;
      name: string;
      sportType?: string;
      gameType?: string;
    }>;
    category?: {
      id: string;
      name: string | null;
      genderRestriction?: string;
      genderCategory?: string;
      gameType?: string;
      matchFormat?: string | null;
    } | null;
    partnerships?: Array<{
      id: string;
      captainId: string;
      partnerId: string;
      seasonId: string;
      divisionId?: string | null;
      status: string;
      captain: {
        id: string;
        name: string | null;
        email?: string;
        username?: string;
        displayUsername?: string | null;
        image?: string | null;
      };
      partner: {
        id: string;
        name: string | null;
        email?: string;
        username?: string;
        displayUsername?: string | null;
        image?: string | null;
      };
    }>;
  };
}

/** Get status badge styling */
const getStatusBadgeClass = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "PENDING":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

/** Get rating badge styling based on value */
const getRatingBadgeClass = (rating: number) => {
  if (rating >= 4500) return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
  if (rating >= 4000) return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
  if (rating >= 3500) return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  if (rating >= 3000) return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
  return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
};

export default function SeasonPlayersCard({
  memberships,
  divisions = [],
  sportType,
  seasonId,
  onMembershipUpdated,
  adminId,
  season,
}: SeasonPlayersCardProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Membership[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<string | undefined>(undefined);
  const [ratingThreshold, setRatingThreshold] = useState<string>("");
  const [activeTab, setActiveTab] = useState("active");
  const [activeSortDirection, setActiveSortDirection] = useState<"asc" | "desc" | null>(null);
  const [waitlistSortDirection, setWaitlistSortDirection] = useState<"asc" | "desc" | null>(null);

  // Helper function to get initials from name
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get consistent avatar background color
  const getAvatarColor = (name: string | null | undefined): string => {
    const colors = [
      "bg-slate-600",
      "bg-emerald-600",
      "bg-sky-600",
      "bg-violet-600",
      "bg-amber-600",
      "bg-rose-600",
      "bg-teal-600",
      "bg-indigo-600",
    ];
    if (!name) return colors[0];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return "Unassigned";
    const division = divisions.find((d) => d.id === divisionId);
    return division ? division.name : "Unassigned";
  };

  const getUsername = (user: Membership["user"]) => {
    if (!user) return "unknown";
    return (user as any).displayUsername || user.username || user.email?.split("@")[0] || "unknown";
  };

  const getGameType = (): "SINGLES" | "DOUBLES" | null => {
    // Check category gameType (both camelCase and snake_case)
    const categoryGameType = season?.category?.gameType || (season?.category as any)?.game_type;
    if (categoryGameType) {
      const normalized = String(categoryGameType).toUpperCase().trim();
      if (normalized === "DOUBLES") return "DOUBLES";
      if (normalized === "SINGLES") return "SINGLES";
    }

    // Check league gameType as fallback
    const leagueGameType = season?.leagues?.[0]?.gameType;
    if (leagueGameType) {
      const normalized = String(leagueGameType).toUpperCase().trim();
      if (normalized === "DOUBLES") return "DOUBLES";
      if (normalized === "SINGLES") return "SINGLES";
    }

    // Check for partnerships (indicates doubles)
    if (season?.partnerships && season.partnerships.length > 0) {
      return "DOUBLES";
    }

    // Check divisions for game type
    if (divisions && divisions.length > 0) {
      const doublesDivision = divisions.find((div: any) => {
        const divGameType = div.gameType || (div as any).gameType;
        return divGameType && String(divGameType).toUpperCase().trim() === "DOUBLES";
      });
      if (doublesDivision) return "DOUBLES";

      const singlesDivision = divisions.find((div: any) => {
        const divGameType = div.gameType || (div as any).gameType;
        return divGameType && String(divGameType).toUpperCase().trim() === "SINGLES";
      });
      if (singlesDivision) return "SINGLES";
    }

    // Default to SINGLES if no game type can be determined
    // This ensures ratings are still shown even when divisions aren't set up yet
    return "SINGLES";
  };

  const getSportRating = (member: Membership) => {
    const leagueSportType = season?.leagues?.[0]?.sportType;
    const gameType = getGameType();

    if (!gameType) {
      return { display: "N/A", value: 0, color: "gray" };
    }

    // Try to find questionnaire response matching the league sport type
    let questionnaireResponse = member.user?.questionnaireResponses?.find(
      (response) =>
        leagueSportType &&
        response.sport &&
        response.sport.toLowerCase() === leagueSportType.toLowerCase() &&
        response.completedAt &&
        response.result
    );

    // If no match for league sport, try to find any completed questionnaire with a result
    if (!questionnaireResponse?.result) {
      questionnaireResponse = member.user?.questionnaireResponses?.find(
        (response) => response.completedAt && response.result
      );
    }

    if (!questionnaireResponse?.result) {
      return { display: "N/A", value: 0, color: "gray" };
    }

    const isDoubles = gameType === "DOUBLES";
    let rating: number | null | undefined;

    if (isDoubles) {
      rating = questionnaireResponse.result.doubles;
      // Fallback to singles if doubles not available
      if (!rating || rating === 0) {
        rating = questionnaireResponse.result.singles;
      }
    } else {
      rating = questionnaireResponse.result.singles;
      // Fallback to doubles if singles not available
      if (!rating || rating === 0) {
        rating = questionnaireResponse.result.doubles;
      }
    }

    // Final fallback to general rating
    if (!rating || rating === 0) {
      const generalRating = (questionnaireResponse.result as any).rating;
      if (generalRating && generalRating > 0) {
        rating = generalRating;
      }
    }

    if (!rating || rating === 0) {
      return { display: "N/A", value: 0, color: "gray" };
    }

    let color = "green";
    if (rating >= 4500) color = "purple";
    else if (rating >= 4000) color = "blue";
    else if (rating >= 3500) color = "green";
    else if (rating >= 3000) color = "yellow";
    else color = "gray";

    return { display: rating.toString(), value: rating, color };
  };

  // Find partnership for a given user ID
  const findPartnership = (userId: string) => {
    return season?.partnerships?.find(
      (p) => p.captainId === userId || p.partnerId === userId
    );
  };

  // Get membership for a user ID
  const getMembershipByUserId = (userId: string) => {
    return memberships.find((m) => m.userId === userId);
  };

  // Helper to check if a player has a division assigned
  const hasDivisionAssigned = (member: Membership): boolean => {
    if (member.divisionId !== null && member.divisionId !== undefined) {
      return true;
    }

    const partnership = season?.partnerships?.find(
      (p) => p.captainId === member.userId || p.partnerId === member.userId
    );
    if (partnership?.divisionId !== null && partnership?.divisionId !== undefined) {
      return true;
    }

    return false;
  };

  // Get division ID for a member (including partnership)
  const getMemberDivisionId = (member: Membership): string | null => {
    if (member.divisionId) return member.divisionId;
    const partnership = findPartnership(member.userId || "");
    return partnership?.divisionId || null;
  };

  // Filter memberships based on search query, division, and rating
  const filteredMemberships = useMemo(() => {
    let result = memberships;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const name = m.user?.name?.toLowerCase() || "";
        const username = m.user?.username?.toLowerCase() || "";
        const email = m.user?.email?.toLowerCase() || "";
        return name.includes(query) || username.includes(query) || email.includes(query);
      });
    }

    // Division filter
    if (divisionFilter) {
      result = result.filter((m) => {
        const divisionId = getMemberDivisionId(m);
        return divisionId === divisionFilter;
      });
    }

    // Rating threshold filter
    const threshold = parseInt(ratingThreshold);
    if (!isNaN(threshold) && threshold > 0) {
      result = result.filter((m) => {
        const rating = getSportRating(m);
        return rating.value >= threshold;
      });
    }

    return result;
  }, [memberships, searchQuery, divisionFilter, ratingThreshold]);

  // Players who are in a division (have been assigned)
  const activePlayers = filteredMemberships.filter((m) => {
    const isActiveOrPending = m.status === "ACTIVE" || m.status === "PENDING";
    return isActiveOrPending && hasDivisionAssigned(m);
  });

  // Players waiting for division assignment (no division yet)
  const waitlistedPlayers = filteredMemberships.filter((m) => {
    const isActiveOrPending = m.status === "ACTIVE" || m.status === "PENDING";
    return isActiveOrPending && !hasDivisionAssigned(m);
  });

  // Division options for filter
  const divisionOptions = divisions.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  // Check if any filters are active
  const hasActiveFilters = searchQuery || divisionFilter || ratingThreshold;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDivisionFilter(undefined);
    setRatingThreshold("");
  };

  // Group memberships by partnerships
  const groupMembershipsByPartnerships = (players: Membership[]) => {
    const processed = new Set<string>();
    const grouped: Array<{
      type: "partnership" | "individual";
      memberships: Membership[];
      partnership?: any;
    }> = [];

    for (const member of players) {
      if (processed.has(member.userId || "")) continue;

      const partnership = findPartnership(member.userId || "");
      if (partnership) {
        const partnerId =
          partnership.captainId === member.userId
            ? partnership.partnerId
            : partnership.captainId;
        const partnerMembership = getMembershipByUserId(partnerId);

        if (partnerMembership) {
          grouped.push({
            type: "partnership",
            memberships: [member, partnerMembership],
            partnership,
          });
          processed.add(member.userId || "");
          processed.add(partnerId);
        } else {
          grouped.push({
            type: "individual",
            memberships: [member],
          });
          processed.add(member.userId || "");
        }
      } else {
        grouped.push({
          type: "individual",
          memberships: [member],
        });
        processed.add(member.userId || "");
      }
    }

    return grouped;
  };

  const handleAssignToDivision = (
    member: Membership | Membership[],
    isTeam: boolean = false
  ) => {
    if (isTeam && Array.isArray(member)) {
      setSelectedMember(member[0]);
      setSelectedTeamMembers(member);
    } else {
      setSelectedMember(Array.isArray(member) ? member[0] : member);
      setSelectedTeamMembers(null);
    }
    setIsAssignModalOpen(true);
  };

  // Track animation state to prevent replay on modal open/close
  const hasAnimatedRef = useRef(false);
  const animationKey = `${activeTab}-${searchQuery}-${divisionFilter}-${ratingThreshold}`;
  const prevAnimationKeyRef = useRef(animationKey);

  // Only animate when key actually changes (filter changes), not on modal interactions
  if (animationKey !== prevAnimationKeyRef.current) {
    hasAnimatedRef.current = false;
    prevAnimationKeyRef.current = animationKey;
  }

  const PlayerTable = ({
    players,
    isWaitlistTab = false,
    sortDirection,
    onSortChange,
  }: {
    players: Membership[];
    isWaitlistTab?: boolean;
    sortDirection: "asc" | "desc" | null;
    onSortChange: (direction: "asc" | "desc" | null) => void;
  }) => {
    const groupedPlayers = groupMembershipsByPartnerships(players);
    const gameType = getGameType();
    const isDoublesMode = gameType === "DOUBLES";

    // Helper to get rating value for a group (partnership or individual)
    const getGroupRating = (group: typeof groupedPlayers[0]): number => {
      if (group.type === "partnership" && group.memberships.length === 2) {
        const [member1, member2] = group.memberships;
        const rating1 = getSportRating(member1);
        const rating2 = getSportRating(member2);
        return rating1.value > 0 && rating2.value > 0
          ? Math.round((rating1.value + rating2.value) / 2)
          : rating1.value > 0 ? rating1.value : rating2.value;
      } else {
        return getSportRating(group.memberships[0]).value;
      }
    };

    // Sort grouped players by rating if sort direction is set
    const sortedGroupedPlayers = sortDirection
      ? [...groupedPlayers].sort((a, b) => {
          const ratingA = getGroupRating(a);
          const ratingB = getGroupRating(b);
          return sortDirection === "desc" ? ratingB - ratingA : ratingA - ratingB;
        })
      : groupedPlayers;

    // Handle sort button click - cycle through: null -> desc -> asc -> null
    const handleSortClick = () => {
      if (sortDirection === null) {
        onSortChange("desc");
      } else if (sortDirection === "desc") {
        onSortChange("asc");
      } else {
        onSortChange(null);
      }
    };

    // Get sort icon based on current direction
    const SortIcon = sortDirection === "desc"
      ? IconSortDescending
      : sortDirection === "asc"
        ? IconSortAscending
        : IconArrowsSort;

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
              <TableHead className="py-2.5 font-medium text-xs min-w-[240px]">Player</TableHead>
              <TableHead className="w-[140px] py-2.5 font-medium text-xs">Division</TableHead>
              <TableHead className="w-[100px] py-2.5 font-medium text-xs">
                <button
                  onClick={handleSortClick}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Rating
                  <SortIcon className={cn("size-3.5", sortDirection ? "text-foreground" : "text-muted-foreground")} />
                </button>
              </TableHead>
              <TableHead className="w-[120px] py-2.5 font-medium text-xs">Joined</TableHead>
              <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
              <TableHead className="w-[140px] py-2.5 pr-4 font-medium text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            key={animationKey}
            initial={hasAnimatedRef.current ? false : "hidden"}
            animate="visible"
            variants={tableContainerVariants}
            onAnimationComplete={() => { hasAnimatedRef.current = true; }}
          >
            {sortedGroupedPlayers.length > 0 ? (
              sortedGroupedPlayers.map((group, index) => {
                if (group.type === "partnership" && group.memberships.length === 2) {
                  // Doubles team
                  const [member1, member2] = group.memberships;
                  const rating1 = getSportRating(member1);
                  const rating2 = getSportRating(member2);
                  const partnership = group.partnership;

                  // Calculate average rating for doubles
                  const avgRating = rating1.value > 0 && rating2.value > 0
                    ? Math.round((rating1.value + rating2.value) / 2)
                    : rating1.value > 0 ? rating1.value : rating2.value;

                  const divisionId = partnership?.divisionId || member1.divisionId || member2.divisionId || null;

                  return (
                    <motion.tr
                      key={`partnership-${partnership.id}`}
                      variants={tableRowVariants}
                      transition={fastTransition}
                      className="hover:bg-muted/30 border-b transition-colors"
                    >
                      {/* Row Number */}
                      <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* Player */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <Avatar className="size-8 ring-2 ring-background">
                              <AvatarImage src={member1.user?.image || undefined} />
                              <AvatarFallback className={`text-white font-semibold text-[10px] ${getAvatarColor(member1.user?.name)}`}>
                                {getInitials(member1.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="size-8 ring-2 ring-background">
                              <AvatarImage src={member2.user?.image || undefined} />
                              <AvatarFallback className={`text-white font-semibold text-[10px] ${getAvatarColor(member2.user?.name)}`}>
                                {getInitials(member2.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {member1.user?.name || "Unknown"} & {member2.user?.name || "Unknown"}
                              </p>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                                <IconUsers className="size-2.5 mr-0.5" />
                                Team
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              @{getUsername(member1.user)} & @{getUsername(member2.user)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Division */}
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {getDivisionName(divisionId)}
                        </Badge>
                      </TableCell>

                      {/* Rating with Tooltip */}
                      <TableCell className="py-3">
                        {avgRating > 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn("text-xs font-mono cursor-help border", getRatingBadgeClass(avgRating))}
                              >
                                {avgRating}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="space-y-1">
                                <div className="font-medium text-muted-foreground mb-1">Individual Ratings</div>
                                <div className="flex items-center justify-between gap-4">
                                  <span>{member1.user?.name?.split(" ")[0] || "Player 1"}:</span>
                                  <span className="font-mono font-medium">{rating1.display}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span>{member2.user?.name?.split(" ")[0] || "Player 2"}:</span>
                                  <span className="font-mono font-medium">{rating2.display}</span>
                                </div>
                                <div className="border-t pt-1 mt-1 flex items-center justify-between gap-4">
                                  <span className="font-medium">Average:</span>
                                  <span className="font-mono font-semibold">{avgRating}</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
                            N/A
                          </Badge>
                        )}
                      </TableCell>

                      {/* Joined */}
                      <TableCell className="py-3 text-sm text-muted-foreground">
                        {member1.joinedAt
                          ? new Date(member1.joinedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium border capitalize", getStatusBadgeClass(
                            member1.status === "ACTIVE" || member2.status === "ACTIVE" ? "ACTIVE" : member1.status
                          ))}
                        >
                          {member1.status === "ACTIVE" || member2.status === "ACTIVE"
                            ? "Active"
                            : member1.status?.toLowerCase() || "pending"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => handleAssignToDivision([member1, member2], true)}
                        >
                          {divisionId ? "Reassign" : "Assign"}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                } else {
                  // Individual player
                  const member = group.memberships[0];
                  const rating = getSportRating(member);

                  return (
                    <motion.tr
                      key={member.id}
                      variants={tableRowVariants}
                      transition={fastTransition}
                      className="hover:bg-muted/30 border-b transition-colors"
                    >
                      {/* Row Number */}
                      <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* Player */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 ring-2 ring-background">
                            <AvatarImage src={member.user?.image || undefined} />
                            <AvatarFallback className={`text-white font-semibold text-[10px] ${getAvatarColor(member.user?.name)}`}>
                              {getInitials(member.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {member.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{getUsername(member.user)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Division */}
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {getDivisionName(member.divisionId ?? null)}
                        </Badge>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-mono border",
                            rating.value > 0 ? getRatingBadgeClass(rating.value) : "text-muted-foreground"
                          )}
                        >
                          {rating.display}
                        </Badge>
                      </TableCell>

                      {/* Joined */}
                      <TableCell className="py-3 text-sm text-muted-foreground">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium border capitalize", getStatusBadgeClass(member.status))}
                        >
                          {member?.status?.toLowerCase() || "pending"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => handleAssignToDivision(member, false)}
                        >
                          {member.divisionId ? "Reassign" : "Assign"}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                }
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      <IconUser className="size-6 opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No players found</p>
                      <p className="text-xs">
                        {hasActiveFilters
                          ? "Try adjusting your filters"
                          : isWaitlistTab
                          ? "All players have been assigned to divisions"
                          : "Players will appear here once they are assigned to divisions"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </motion.tbody>
        </Table>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with Title, Search, and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            Season Players ({memberships.length})
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-9 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>

            {/* Division Filter */}
            {divisions.length > 0 && (
              <FilterSelect
                value={divisionFilter}
                onChange={setDivisionFilter}
                options={divisionOptions}
                placeholder="Division"
                allLabel="All Divisions"
                triggerClassName="w-[150px] h-9"
              />
            )}

            {/* Rating Threshold */}
            <Input
              type="number"
              placeholder="Min rating"
              value={ratingThreshold}
              onChange={(e) => setRatingThreshold(e.target.value)}
              className="w-28 h-9"
              min={0}
            />

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <IconX className="size-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" className="text-sm">
              In Division ({activePlayers.length})
            </TabsTrigger>
            <TabsTrigger value="waitlisted" className="text-sm">
              Awaiting Division ({waitlistedPlayers.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-0">
            <PlayerTable
              players={activePlayers}
              isWaitlistTab={false}
              sortDirection={activeSortDirection}
              onSortChange={setActiveSortDirection}
            />
          </TabsContent>
          <TabsContent value="waitlisted" className="mt-0">
            <PlayerTable
              players={waitlistedPlayers}
              isWaitlistTab={true}
              sortDirection={waitlistSortDirection}
              onSortChange={setWaitlistSortDirection}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AssignDivisionModal
        isOpen={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        member={selectedMember}
        teamMembers={selectedTeamMembers}
        divisions={divisions}
        seasonId={seasonId}
        onAssigned={onMembershipUpdated}
        adminId={adminId || ""}
        getSportRating={getSportRating}
        gameType={getGameType()}
      />
    </TooltipProvider>
  );
}
