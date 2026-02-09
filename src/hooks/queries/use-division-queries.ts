import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useDivisions() {
  return useQuery({
    queryKey: queryKeys.divisions.list(),
    queryFn: async (): Promise<Division[]> => {
      const response = await apiClient.get("/api/division/");
      const result = response.data;
      return z.array(divisionSchema).parse(result.data);
    },
  });
}

export function useDivision(id: string) {
  return useQuery({
    queryKey: queryKeys.divisions.detail(id),
    queryFn: async (): Promise<Division> => {
      const response = await apiClient.get(`/api/division/${id}`);
      return divisionSchema.parse(response.data.data);
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
      const divisionsArray = Array.isArray(divisions) ? divisions : [];

      return {
        total: divisionsArray.length,
        active: divisionsArray.filter((d: any) => d.isActive).length,
        inactive: divisionsArray.filter((d: any) => !d.isActive).length,
        byLevel: {
          beginner: divisionsArray.filter((d: any) => d.divisionLevel === "beginner").length,
          intermediate: divisionsArray.filter((d: any) => d.divisionLevel === "intermediate").length,
          advanced: divisionsArray.filter((d: any) => d.divisionLevel === "advanced").length,
        },
        byGameType: {
          singles: divisionsArray.filter((d: any) => d.gameType === "singles").length,
          doubles: divisionsArray.filter((d: any) => d.gameType === "doubles").length,
        },
      };
    },
  });
}
