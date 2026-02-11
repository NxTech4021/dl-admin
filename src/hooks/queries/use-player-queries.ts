import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { playerSchema, Player } from "@/constants/zod/player-schema";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players.list(),
    queryFn: async (): Promise<Player[]> => {
      const response = await apiClient.get("/api/player/");
      return z.array(playerSchema).parse(response.data.data);
    },
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(id),
    queryFn: async (): Promise<Player> => {
      const response = await apiClient.get(`/api/player/${id}`);
      return playerSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function usePlayerStats() {
  return useQuery({
    queryKey: queryKeys.players.stats(),
    queryFn: async () => {
      const response = await apiClient.get("/api/player/stats");
      return response.data.data;
    },
  });
}
