import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { seasonSchema, Season } from "@/constants/zod/season-schema";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useSeasons() {
  return useQuery({
    queryKey: queryKeys.seasons.list(),
    queryFn: async (): Promise<Season[]> => {
      const response = await apiClient.get("/api/season/");
      // Backend wraps in ApiResponse: { success, status, data: { data: [...], pagination }, message }
      const seasons = response.data?.data?.data ?? response.data?.data ?? response.data;
      return z.array(seasonSchema).parse(seasons);
    },
  });
}

export function useSeason(id: string) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(id),
    queryFn: async (): Promise<Season> => {
      const response = await apiClient.get(`/api/season/${id}`);
      // getSeasonById returns raw JSON (no ApiResponse wrapper)
      return seasonSchema.parse(response.data);
    },
    enabled: !!id,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Season>) => {
      const response = await apiClient.post("/api/season/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
  });
}

export function useDeleteSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/season/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
  });
}
