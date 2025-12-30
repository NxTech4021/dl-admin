"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  IconTrophy,
  IconMapPin,
  IconMessage,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const dateGroupVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const commentExpandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Type definitions (matching SeasonLeaderboardCard)
interface SetScore {
  setNumber: number;
  team1Games: number;
  team2Games: number;
  team1Tiebreak?: number | null;
  team2Tiebreak?: number | null;
  hasTiebreak: boolean;
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
  team1Players: MatchPlayer[];
  team2Players: MatchPlayer[];
  isWalkover: boolean;
  resultComment?: string;
  comments?: MatchResultComment[];
  venue?: string;
}

interface MatchResultsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  divisionName: string;
  results: MatchResult[];
  isLoading?: boolean;
}

// Utility functions
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

const formatPlayerName = (name: string, maxLength = 16): string => {
  if (name.length <= maxLength) return name;
  const parts = name.split(" ");
  if (parts.length === 1) return name.slice(0, maxLength) + "...";
  return `${parts[0]} ${parts.slice(1).map((p) => p[0]).join("")}.`;
};

// Sort set scores by set number
function getSortedSetScores(setScores: SetScore[]): SetScore[] {
  if (!setScores || setScores.length === 0) return [];
  return [...setScores].sort((a, b) => a.setNumber - b.setNumber);
}

// Player Avatar component
const PlayerAvatar = ({ player, size = "md" }: { player: MatchPlayer; size?: "sm" | "md" }) => {
  const sizeClasses = size === "sm" ? "size-8" : "size-10";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Avatar className={cn(sizeClasses, "ring-2 ring-background")}>
      <AvatarImage src={player.image || undefined} />
      <AvatarFallback className={cn("text-white font-semibold", textSize, getAvatarColor(player.name))}>
        {getInitials(player.name)}
      </AvatarFallback>
    </Avatar>
  );
};

// Team display (1 or 2 players)
const TeamDisplay = ({
  players,
  isWinner,
  side,
}: {
  players: MatchPlayer[];
  isWinner: boolean;
  side: "left" | "right";
}) => {
  const isDoubles = players.length === 2;

  return (
    <div className={cn("flex-1", side === "right" && "text-right")}>
      <div className={cn("flex items-center gap-3", side === "right" && "flex-row-reverse")}>
        {/* Avatars */}
        <div className="flex items-center shrink-0">
          {isDoubles ? (
            <div className="flex items-center">
              <PlayerAvatar player={players[0]} size="sm" />
              <PlayerAvatar player={players[1]} size="sm" />
            </div>
          ) : (
            <PlayerAvatar player={players[0]} size="md" />
          )}
        </div>

        {/* Names */}
        <div className={cn("min-w-0", side === "right" && "text-right")}>
          {players.map((player, idx) => (
            <div
              key={player.id}
              className={cn(
                "text-sm font-medium truncate",
                isWinner && "text-emerald-600"
              )}
            >
              {formatPlayerName(player.name)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Score Badge component - works for both Tennis/Padel sets and Pickleball games
const SetScoreBadge = ({ set, index }: { set: SetScore; index: number }) => {
  const team1Won = set.team1Games > set.team2Games;
  const team2Won = set.team2Games > set.team1Games;

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-muted-foreground font-medium mb-1">
        {set.setNumber || index + 1}
      </span>
      <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            team1Won ? "text-emerald-600" : "text-foreground"
          )}
        >
          {set.team1Games}
        </span>
        <span className="text-xs text-muted-foreground">-</span>
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            team2Won ? "text-emerald-600" : "text-foreground"
          )}
        >
          {set.team2Games}
        </span>
      </div>
      {set.hasTiebreak && set.team1Tiebreak != null && set.team2Tiebreak != null && (
        <span className="text-[10px] text-muted-foreground mt-0.5">
          ({set.team1Tiebreak}-{set.team2Tiebreak})
        </span>
      )}
    </div>
  );
};

// Individual match card in drawer
const MatchCardInDrawer = ({
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
  const commentsExpanded = expandedComments.has(match.id);
  const sortedSetScores = getSortedSetScores(match.setScores);
  const hasSetScores = sortedSetScores.length > 0;
  const hasComments = match.comments && match.comments.length > 0;
  const visibleComments = commentsExpanded ? match.comments : match.comments?.slice(0, 2);

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Match content */}
      <div className="p-4">
        {/* Teams and Score Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 */}
          <TeamDisplay players={match.team1Players} isWinner={isTeam1Winner} side="left" />

          {/* Center: Score */}
          <div className="flex flex-col items-center shrink-0 px-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  isTeam1Winner ? "text-emerald-600" : "text-foreground"
                )}
              >
                {match.team1Score}
              </span>
              <span className="text-lg text-muted-foreground font-light">-</span>
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
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">
                Walkover
              </Badge>
            )}
          </div>

          {/* Team 2 */}
          <TeamDisplay players={match.team2Players} isWinner={isTeam2Winner} side="right" />
        </div>

        {/* Set Scores - individual set breakdown */}
        {hasSetScores && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-center gap-3">
              {sortedSetScores.map((set, index) => (
                <SetScoreBadge key={set.setNumber || index} set={set} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Venue */}
        {match.venue && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <IconMapPin className="size-3.5" />
            <span>{match.venue}</span>
          </div>
        )}

        {/* Comments Section */}
        {hasComments && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <IconMessage className="size-3.5" />
              <span className="font-medium">
                {match.comments?.length ?? 0} Comment{(match.comments?.length ?? 0) > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="sync">
                {visibleComments?.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="flex items-start gap-2"
                  >
                    <Avatar className="size-6 ring-1 ring-border shrink-0">
                      <AvatarImage src={comment.user.image || undefined} />
                      <AvatarFallback
                        className={cn(
                          "text-[9px] text-white font-semibold",
                          getAvatarColor(comment.user.name)
                        )}
                      >
                        {getInitials(comment.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold text-foreground">
                          {comment.user.name.split(" ")[0]}:
                        </span>{" "}
                        <span className="text-muted-foreground">{comment.comment}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(match.comments?.length ?? 0) > 2 && (
                <motion.button
                  onClick={() => onToggleComments(match.id)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-1 cursor-pointer"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    animate={{ rotate: commentsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {commentsExpanded ? (
                      <IconChevronUp className="size-3" />
                    ) : (
                      <IconChevronDown className="size-3" />
                    )}
                  </motion.span>
                  {commentsExpanded ? "Show less" : `View ${(match.comments?.length ?? 0) - 2} more`}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Legacy result comment fallback */}
        {!hasComments && match.resultComment && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-sm text-muted-foreground italic">{match.resultComment}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function MatchResultsDrawer({
  open,
  onOpenChange,
  divisionName,
  results,
  isLoading = false,
}: MatchResultsDrawerProps) {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Clear expanded comments when drawer closes
  useEffect(() => {
    if (!open) {
      setExpandedComments(new Set());
    }
  }, [open]);

  const handleToggleComments = (matchId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) {
        next.delete(matchId);
      } else {
        next.add(matchId);
      }
      return next;
    });
  };

  // Group matches by date - with fallback for invalid dates
  const dateGroups = useMemo(() => {
    if (!results || results.length === 0) return [];

    const groups = new Map<string, MatchResult[]>();

    // Sort results, handling missing/invalid dates
    const sortedResults = [...results].sort((a, b) => {
      const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
      const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    sortedResults.forEach((match) => {
      let dateKey = "Unknown Date";
      try {
        if (match.matchDate) {
          const date = new Date(match.matchDate);
          if (!isNaN(date.getTime())) {
            dateKey = format(date, "MMMM d, yyyy");
          }
        }
      } catch {
        // Keep default "Unknown Date"
      }
      const existing = groups.get(dateKey) || [];
      groups.set(dateKey, [...existing, match]);
    });

    return Array.from(groups.entries());
  }, [results]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b bg-background">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <IconTrophy className="size-5 text-primary" />
            Match Results
          </SheetTitle>
          <SheetDescription className="text-sm">
            {divisionName} &middot; {results.length} match{results.length !== 1 ? "es" : ""}
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-36 w-full rounded-lg" />
                  </div>
                ))}
              </motion.div>
            ) : dateGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="text-center py-12"
              >
                <IconTrophy className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No completed matches yet</p>
              </motion.div>
            ) : (
              <motion.div
                key={`results-${results.length}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {dateGroups.map(([dateKey, matches]) => (
                  <motion.div
                    key={dateKey}
                    variants={dateGroupVariants}
                  >
                    {/* Date Header */}
                    <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 mb-3">
                      <h3 className="text-sm font-semibold text-foreground">{dateKey}</h3>
                    </div>

                    {/* Matches for this date */}
                    <motion.div className="space-y-3">
                      {matches.map((match) => (
                        <motion.div
                          key={match.id}
                          variants={cardVariants}
                          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                        >
                          <MatchCardInDrawer
                            match={match}
                            expandedComments={expandedComments}
                            onToggleComments={handleToggleComments}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
