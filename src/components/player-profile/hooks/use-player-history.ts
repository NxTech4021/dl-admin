import * as React from "react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { LeagueHistory, SeasonHistory } from "../types";

export function usePlayerHistory(playerId: string) {
  const [leagueHistory, setLeagueHistory] = React.useState<LeagueHistory[] | null>(null);
  const [seasonHistory, setSeasonHistory] = React.useState<SeasonHistory[] | null>(null);
  const [historyLoading, setHistoryLoading] = React.useState({
    leagues: false,
    seasons: false,
  });

  const fetchLeagueHistory = React.useCallback(async () => {
    if (leagueHistory) return; // Already loaded

    setHistoryLoading((prev) => ({ ...prev, leagues: true }));
    try {
      const response = await axiosInstance.get(
        endpoints.player.getLeagueHistory(playerId)
      );
      if (response.status === 200) {
        setLeagueHistory(response.data.data.leagues);
      }
    } catch (error) {
      console.error("Failed to load league history:", error);
    } finally {
      setHistoryLoading((prev) => ({ ...prev, leagues: false }));
    }
  }, [playerId, leagueHistory]);

  const fetchSeasonHistory = React.useCallback(async () => {
    if (seasonHistory) return; // Already loaded

    setHistoryLoading((prev) => ({ ...prev, seasons: true }));
    try {
      const response = await axiosInstance.get(
        endpoints.player.getSeasonHistory(playerId)
      );
      if (response.status === 200) {
        setSeasonHistory(response.data.data.seasons);
      }
    } catch (error) {
      console.error("Failed to load season history:", error);
    } finally {
      setHistoryLoading((prev) => ({ ...prev, seasons: false }));
    }
  }, [playerId, seasonHistory]);

  return {
    leagueHistory,
    seasonHistory,
    historyLoading,
    fetchLeagueHistory,
    fetchSeasonHistory,
  };
}

