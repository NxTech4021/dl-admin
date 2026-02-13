import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { leagueSchema, League } from "@/constants/zod/league-schema";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useLeagues() {
  return useQuery({
    queryKey: queryKeys.leagues.list(),
    queryFn: async (): Promise<League[]> => {
      const response = await apiClient.get("/api/league/");
      const result = response.data;
      // API returns { data: { leagues: [...] } } structure
      const leaguesData = result.data?.leagues || result.data || [];
      return z.array(leagueSchema).parse(leaguesData);
    },
  });
}

export function useLeague(id: string) {
  return useQuery({
    queryKey: queryKeys.leagues.detail(id),
    queryFn: async (): Promise<League> => {
      const response = await apiClient.get(`/api/league/${id}`);
      return leagueSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useCreateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<League>) => {
      const response = await apiClient.post("/api/league/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
    },
  });
}

export function useUpdateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<League> }) => {
      const response = await apiClient.put(`/api/league/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.list() });
    },
  });
}

export function useDeleteLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/league/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
    },
  });
}
