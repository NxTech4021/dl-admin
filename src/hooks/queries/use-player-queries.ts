import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { playerSchema, Player } from "@/constants/zod/player-schema";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { queryKeys } from "./query-keys";

export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players.list(),
    queryFn: async (): Promise<Player[]> => {
      const response = await apiClient.get("/api/player/");
      const data = response.data?.data ?? response.data;
      const parseResult = z.array(playerSchema).safeParse(data);
      if (!parseResult.success) {
        logger.error("Failed to parse players list:", parseResult.error.issues);
        return data;
      }
      return parseResult.data;
    },
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(id),
    queryFn: async (): Promise<Player> => {
      const response = await apiClient.get(`/api/player/${id}`);
      const data = response.data?.data ?? response.data;
      const parseResult = playerSchema.safeParse(data);
      if (!parseResult.success) {
        logger.error("Failed to parse player detail:", parseResult.error.issues);
        return data;
      }
      return parseResult.data;
    },
    enabled: !!id,
  });
}

export function usePlayerStats() {
  return useQuery({
    queryKey: queryKeys.players.stats(),
    queryFn: async () => {
      const response = await apiClient.get("/api/player/stats");
      return response.data?.data ?? response.data;
    },
  });
}
