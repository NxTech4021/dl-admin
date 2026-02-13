import * as React from "react";
import axios from "axios";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import type { LeagueHistoryData } from "../league-history-card";
import type { SeasonHistoryData } from "../season-history-card";
import type { MatchData } from "../match-history-card";
import { logger } from "@/lib/logger";

export interface PlayerProfileData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string;
  displayUsername: string | null;
  role: string;
  dateOfBirth: string | null;
  gender: string | null;
  area: string | null;
  bio: string | null;
  phoneNumber: string | null;
  completedOnboarding: boolean;
  lastActivityCheck: string | null;
  lastLogin: string | null;
  status: string;
  registeredDate: string;
  questionnaires: {
    sport: string;
    qVersion: number;
    qHash: string;
    completedAt: string | null;
    startedAt: string;
    answersJson: Record<string, unknown>;
    result: {
      rating: number;
      confidence: string;
      rd: number;
      singles?: number;
      doubles?: number;
      source?: string;
      detail?: Record<string, unknown>;
    } | null;
  }[];
  skillRatings: Record<
    string,
    { rating: number; confidence: string; rd: number }
  > | null;
  accounts: { providerId: string; createdAt: string }[];
  sessions: {
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: string;
    createdAt: string;
  }[];
  // Note: matches and achievements are loaded separately on-demand
}

interface HistoryLoadingState {
  leagues: boolean;
  seasons: boolean;
  matches: boolean;
}

interface HistoryErrorState {
  leagues: string | null;
  seasons: string | null;
  matches: string | null;
}

interface FetchInProgressState {
  profile: boolean;
  leagues: boolean;
  seasons: boolean;
  matches: boolean;
}

export interface UsePlayerDataReturn {
  // Profile state
  profile: PlayerProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<PlayerProfileData | null>>;
  isLoading: boolean;
  profileError: string | null;

  // Tab state
  activeTab: string;
  handleTabChange: (value: string) => void;

  // History data
  leagueHistory: LeagueHistoryData[] | null;
  seasonHistory: SeasonHistoryData[] | null;
  matchHistory: MatchData[] | null;
  historyLoading: HistoryLoadingState;
  historyError: HistoryErrorState;

  // Actions
  retryProfile: () => void;
  fetchLeagueHistory: () => Promise<void>;
  fetchSeasonHistory: () => Promise<void>;
  fetchMatchHistory: () => Promise<void>;
  setHistoryError: React.Dispatch<React.SetStateAction<HistoryErrorState>>;
  setLeagueHistory: React.Dispatch<React.SetStateAction<LeagueHistoryData[] | null>>;
  setSeasonHistory: React.Dispatch<React.SetStateAction<SeasonHistoryData[] | null>>;
  setMatchHistory: React.Dispatch<React.SetStateAction<MatchData[] | null>>;
}

export function usePlayerData(playerId: string): UsePlayerDataReturn {
  const [profile, setProfile] = React.useState<PlayerProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");

  // History data states
  const [leagueHistory, setLeagueHistory] = React.useState<LeagueHistoryData[] | null>(null);
  const [seasonHistory, setSeasonHistory] = React.useState<SeasonHistoryData[] | null>(null);
  const [matchHistory, setMatchHistory] = React.useState<MatchData[] | null>(null);
  const [historyLoading, setHistoryLoading] = React.useState<HistoryLoadingState>({
    leagues: false,
    seasons: false,
    matches: false,
  });

  // Error states for user feedback
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileRetryCount, setProfileRetryCount] = React.useState(0);
  const [historyError, setHistoryError] = React.useState<HistoryErrorState>({
    leagues: null,
    seasons: null,
    matches: null,
  });

  // Refs for race condition prevention and cleanup
  const isMountedRef = React.useRef(true);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const fetchInProgressRef = React.useRef<FetchInProgressState>({
    profile: false,
    leagues: false,
    seasons: false,
    matches: false,
  });

  // Reset history state when playerId changes to prevent stale data
  React.useEffect(() => {
    setLeagueHistory(null);
    setSeasonHistory(null);
    setMatchHistory(null);
    setHistoryError({ leagues: null, seasons: null, matches: null });
    setHistoryLoading({ leagues: false, seasons: false, matches: false });
    fetchInProgressRef.current = {
      profile: false,
      leagues: false,
      seasons: false,
      matches: false,
    };
  }, [playerId]);

  // Cleanup on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  React.useEffect(() => {
    if (!playerId) return;

    // Abort any previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchProfile = async () => {
      // Guard against concurrent requests
      if (fetchInProgressRef.current.profile) return;
      fetchInProgressRef.current.profile = true;

      setIsLoading(true);
      setProfileError(null);
      try {
        const response = await axiosInstance.get(
          endpoints.player.getById(playerId),
          { signal: controller.signal }
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch profile");
        }
        const result = response.data;
        if (isMountedRef.current) {
          setProfile(result.data);
        }
      } catch (error) {
        // Ignore abort errors (axios.isCancel works across axios versions)
        if (axios.isCancel(error)) {
          return;
        }
        logger.error("Error fetching player profile:", error);
        if (isMountedRef.current) {
          setProfileError(
            error instanceof Error ? error.message : "Failed to load profile"
          );
        }
      } finally {
        fetchInProgressRef.current.profile = false;
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      controller.abort();
    };
  }, [playerId, profileRetryCount]);

  // Data fetching functions for history tabs
  const fetchLeagueHistory = React.useCallback(async () => {
    // Already loaded or fetch in progress
    if (leagueHistory || fetchInProgressRef.current.leagues) return;
    fetchInProgressRef.current.leagues = true;

    setHistoryLoading((prev) => ({ ...prev, leagues: true }));
    setHistoryError((prev) => ({ ...prev, leagues: null }));
    try {
      const response = await axiosInstance.get(
        endpoints.player.getLeagueHistory(playerId)
      );
      if (response.status === 200 && isMountedRef.current) {
        setLeagueHistory(response.data.data.leagues);
      }
    } catch (error) {
      logger.error("Failed to load league history:", error);
      if (isMountedRef.current) {
        setHistoryError((prev) => ({
          ...prev,
          leagues: "Failed to load league history. Please try again.",
        }));
      }
    } finally {
      fetchInProgressRef.current.leagues = false;
      if (isMountedRef.current) {
        setHistoryLoading((prev) => ({ ...prev, leagues: false }));
      }
    }
  }, [playerId, leagueHistory]);

  const fetchSeasonHistory = React.useCallback(async () => {
    // Already loaded or fetch in progress
    if (seasonHistory || fetchInProgressRef.current.seasons) return;
    fetchInProgressRef.current.seasons = true;

    setHistoryLoading((prev) => ({ ...prev, seasons: true }));
    setHistoryError((prev) => ({ ...prev, seasons: null }));
    try {
      const response = await axiosInstance.get(
        endpoints.player.getSeasonHistory(playerId)
      );
      if (response.status === 200 && isMountedRef.current) {
        setSeasonHistory(response.data.data.seasons);
      }
    } catch (error) {
      logger.error("Failed to load season history:", error);
      if (isMountedRef.current) {
        setHistoryError((prev) => ({
          ...prev,
          seasons: "Failed to load season history. Please try again.",
        }));
      }
    } finally {
      fetchInProgressRef.current.seasons = false;
      if (isMountedRef.current) {
        setHistoryLoading((prev) => ({ ...prev, seasons: false }));
      }
    }
  }, [playerId, seasonHistory]);

  const fetchMatchHistory = React.useCallback(async () => {
    // Already loaded or fetch in progress
    if (matchHistory || fetchInProgressRef.current.matches) return;
    fetchInProgressRef.current.matches = true;

    setHistoryLoading((prev) => ({ ...prev, matches: true }));
    setHistoryError((prev) => ({ ...prev, matches: null }));
    try {
      const response = await axiosInstance.get(
        endpoints.player.getMatchHistoryAdmin(playerId)
      );
      if (response.status === 200 && isMountedRef.current) {
        // Transform match data to player-specific format
        interface RawMatchOpponent {
          id: string;
          name: string;
          username?: string;
          image?: string;
          team?: string;
          role?: string;
        }
        interface RawSetScore {
          player: number;
          opponent: number;
          tiebreak?: { player: number; opponent: number };
        }
        interface RawGameScore {
          player: number;
          opponent: number;
        }
        interface RawMatchData {
          id: string;
          sport?: string;
          matchType?: string;
          playerScore: number | null;
          opponentScore: number | null;
          status: string;
          matchDate: string;
          location: string | null;
          venue: string | null;
          notes: string | null;
          duration?: number | null;
          isFriendly?: boolean;
          isWalkover?: boolean;
          isDisputed?: boolean;
          requiresAdminReview?: boolean;
          isReportedForAbuse?: boolean;
          opponents?: RawMatchOpponent[];
          setScores?: RawSetScore[];
          pickleballScores?: RawGameScore[];
          division?: {
            id: string;
            name: string;
            league?: {
              id: string;
              name: string;
            };
          };
        }

        const matches: RawMatchData[] = response.data.data.matches || [];
        const transformedMatches: MatchData[] = matches.map((match) => {
          // Use the pre-calculated scores from the backend
          const playerScore = match.playerScore;
          const opponentScore = match.opponentScore;

          // Calculate outcome
          let outcome: "win" | "loss" | "draw" | null = null;
          if (match.status === "COMPLETED" && playerScore !== null && opponentScore !== null) {
            if (playerScore > opponentScore) outcome = "win";
            else if (playerScore < opponentScore) outcome = "loss";
            else outcome = "draw";
          }

          // Format opponents info
          const opponents = match.opponents || [];
          const opponentNames = opponents.map((opp) => opp.name).filter(Boolean);

          // Format set scores for display (e.g., "6-4, 7-5")
          let formattedScore: string | null = null;
          if (match.setScores && match.setScores.length > 0) {
            formattedScore = match.setScores
              .map((set) => {
                let score = `${set.player}-${set.opponent}`;
                if (set.tiebreak) {
                  score += `(${set.tiebreak.player}-${set.tiebreak.opponent})`;
                }
                return score;
              })
              .join(", ");
          } else if (match.pickleballScores && match.pickleballScores.length > 0) {
            formattedScore = match.pickleballScores
              .map((game) => `${game.player}-${game.opponent}`)
              .join(", ");
          }

          return {
            id: match.id,
            sport: match.sport?.toLowerCase() || "unknown",
            matchType: match.matchType?.toLowerCase() || "singles",
            playerScore,
            opponentScore,
            formattedScore,
            outcome,
            matchDate: match.matchDate,
            location: match.location,
            venue: match.venue,
            notes: match.notes,
            duration: match.duration || null,
            status: match.status,
            isFriendly: match.isFriendly,
            isWalkover: match.isWalkover,
            isDisputed: match.isDisputed,
            requiresAdminReview: match.requiresAdminReview,
            isReportedForAbuse: match.isReportedForAbuse,
            // Opponent info
            opponents: opponents,
            opponentName: opponentNames.length > 0 ? opponentNames.join(" & ") : null,
            // Division info
            division: match.division ? {
              id: match.division.id,
              name: match.division.name,
              league: match.division.league ? {
                id: match.division.league.id,
                name: match.division.league.name,
              } : undefined,
            } : undefined,
          };
        });
        setMatchHistory(transformedMatches);
      }
    } catch (error) {
      logger.error("Failed to load match history:", error);
      if (isMountedRef.current) {
        setHistoryError((prev) => ({
          ...prev,
          matches: "Failed to load match history. Please try again.",
        }));
      }
    } finally {
      fetchInProgressRef.current.matches = false;
      if (isMountedRef.current) {
        setHistoryLoading((prev) => ({ ...prev, matches: false }));
      }
    }
  }, [playerId, matchHistory]);

  const retryProfile = React.useCallback(() => {
    setProfileError(null);
    fetchInProgressRef.current.profile = false;
    setProfileRetryCount((c) => c + 1);
  }, []);

  // Handle tab change and trigger data fetching
  const handleTabChange = React.useCallback((value: string) => {
    setActiveTab(value);
    if (value === "matches") {
      fetchMatchHistory();
    }
    if (value === "league_history") {
      fetchLeagueHistory();
    }
    if (value === "season_history") {
      fetchSeasonHistory();
    }
  }, [fetchMatchHistory, fetchLeagueHistory, fetchSeasonHistory]);

  return {
    // Profile state
    profile,
    setProfile,
    isLoading,
    profileError,

    // Tab state
    activeTab,
    handleTabChange,

    // History data
    leagueHistory,
    seasonHistory,
    matchHistory,
    historyLoading,
    historyError,

    // Actions
    retryProfile,
    fetchLeagueHistory,
    fetchSeasonHistory,
    fetchMatchHistory,
    setHistoryError,
    setLeagueHistory,
    setSeasonHistory,
    setMatchHistory,
  };
}
