import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { queryKeys } from "./query-keys";

export function useDivisions() {
  return useQuery({
    queryKey: queryKeys.divisions.list(),
    queryFn: async (): Promise<Division[]> => {
      const response = await apiClient.get("/api/division/");
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(divisionSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Failed to parse divisions:", parseResult.error.issues);
        return Array.isArray(payload) ? payload : [];
      }
      return parseResult.data;
    },
  });
}

export function useDivision(id: string) {
  return useQuery({
    queryKey: queryKeys.divisions.detail(id),
    queryFn: async (): Promise<Division> => {
      const response = await apiClient.get(`/api/division/${id}`);
      const payload = response.data?.data ?? response.data;
      const parseResult = divisionSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Failed to parse division:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
    enabled: !!id,
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/division/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
    },
  });
}

export interface DivisionStats {
  total: number;
  active: number;
  inactive: number;
  byLevel: { beginner: number; intermediate: number; advanced: number };
  byGameType: { singles: number; doubles: number };
}

export function useDivisionsStats(seasonId?: string) {
  return useQuery({
    queryKey: [...queryKeys.divisions.all, "stats", seasonId],
    queryFn: async (): Promise<DivisionStats> => {
      // Fetch divisions and compute stats client-side
      const url = seasonId
        ? `/api/division/season/${seasonId}`
        : "/api/division/";
      const response = await apiClient.get(url);
      const divisions = response.data?.data || response.data?.divisions || response.data || [];
      const divisionsArray: Division[] = Array.isArray(divisions) ? divisions : [];

      return {
        total: divisionsArray.length,
        active: divisionsArray.filter((d) => d.isActive).length,
        inactive: divisionsArray.filter((d) => !d.isActive).length,
        byLevel: {
          beginner: divisionsArray.filter((d) => d.divisionLevel === "beginner").length,
          intermediate: divisionsArray.filter((d) => d.divisionLevel === "intermediate").length,
          advanced: divisionsArray.filter((d) => d.divisionLevel === "advanced").length,
        },
        byGameType: {
          singles: divisionsArray.filter((d) => d.gameType === "singles").length,
          doubles: divisionsArray.filter((d) => d.gameType === "doubles").length,
        },
      };
    },
  });
}
