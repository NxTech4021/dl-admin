import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { playerSchema, Player } from "@/constants/zod/player-schema";
import { leagueSchema, League } from "@/constants/zod/league-schema";
import { seasonSchema, Season } from "@/constants/zod/season-schema";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { adminSchema, Admin } from "@/constants/zod/admin-schema";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_URL,
  withCredentials: true,
  timeout: 30000,
});

// Query Keys
export const queryKeys = {
  players: {
    all: ["players"] as const,
    list: () => [...queryKeys.players.all, "list"] as const,
    detail: (id: string) => [...queryKeys.players.all, "detail", id] as const,
    stats: () => [...queryKeys.players.all, "stats"] as const,
  },
  leagues: {
    all: ["leagues"] as const,
    list: () => [...queryKeys.leagues.all, "list"] as const,
    detail: (id: string) => [...queryKeys.leagues.all, "detail", id] as const,
  },
  seasons: {
    all: ["seasons"] as const,
    list: () => [...queryKeys.seasons.all, "list"] as const,
    detail: (id: string) => [...queryKeys.seasons.all, "detail", id] as const,
  },
  divisions: {
    all: ["divisions"] as const,
    list: () => [...queryKeys.divisions.all, "list"] as const,
    detail: (id: string) => [...queryKeys.divisions.all, "detail", id] as const,
  },
  admins: {
    all: ["admins"] as const,
    list: () => [...queryKeys.admins.all, "list"] as const,
    detail: (id: string) => [...queryKeys.admins.all, "detail", id] as const,
    session: () => [...queryKeys.admins.all, "session"] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: () => [...queryKeys.categories.all, "list"] as const,
  },
  sponsors: {
    all: ["sponsors"] as const,
    list: () => [...queryKeys.sponsors.all, "list"] as const,
  },
};

// ============================================
// PLAYERS
// ============================================

export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.players.list(),
    queryFn: async (): Promise<Player[]> => {
      const response = await axiosInstance.get("/api/player/");
      const result = response.data;
      return z.array(playerSchema).parse(result.data);
    },
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(id),
    queryFn: async (): Promise<Player> => {
      const response = await axiosInstance.get(`/api/player/${id}`);
      return playerSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function usePlayerStats() {
  return useQuery({
    queryKey: queryKeys.players.stats(),
    queryFn: async () => {
      const response = await axiosInstance.get("/api/player/stats");
      return response.data.data;
    },
  });
}

// ============================================
// LEAGUES
// ============================================

export function useLeagues() {
  return useQuery({
    queryKey: queryKeys.leagues.list(),
    queryFn: async (): Promise<League[]> => {
      const response = await axiosInstance.get("/api/league/");
      const result = response.data;
      return z.array(leagueSchema).parse(result.data);
    },
  });
}

export function useLeague(id: string) {
  return useQuery({
    queryKey: queryKeys.leagues.detail(id),
    queryFn: async (): Promise<League> => {
      const response = await axiosInstance.get(`/api/league/${id}`);
      return leagueSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useCreateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<League>) => {
      const response = await axiosInstance.post("/api/league/create", data);
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
      const response = await axiosInstance.put(`/api/league/${id}`, data);
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
      const response = await axiosInstance.delete(`/api/league/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all });
    },
  });
}

// ============================================
// SEASONS
// ============================================

export function useSeasons() {
  return useQuery({
    queryKey: queryKeys.seasons.list(),
    queryFn: async (): Promise<Season[]> => {
      const response = await axiosInstance.get("/api/season/");
      const result = response.data;
      return z.array(seasonSchema).parse(result.data);
    },
  });
}

export function useSeason(id: string) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(id),
    queryFn: async (): Promise<Season> => {
      const response = await axiosInstance.get(`/api/season/${id}`);
      return seasonSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useCreateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Season>) => {
      const response = await axiosInstance.post("/api/season/", data);
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
      const response = await axiosInstance.delete(`/api/season/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
  });
}

// ============================================
// DIVISIONS
// ============================================

export function useDivisions() {
  return useQuery({
    queryKey: queryKeys.divisions.list(),
    queryFn: async (): Promise<Division[]> => {
      const response = await axiosInstance.get("/api/division/");
      const result = response.data;
      return z.array(divisionSchema).parse(result.data);
    },
  });
}

export function useDivision(id: string) {
  return useQuery({
    queryKey: queryKeys.divisions.detail(id),
    queryFn: async (): Promise<Division> => {
      const response = await axiosInstance.get(`/api/division/${id}`);
      return divisionSchema.parse(response.data.data);
    },
    enabled: !!id,
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/division/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
    },
  });
}

// ============================================
// ADMINS
// ============================================

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.list(),
    queryFn: async (): Promise<Admin[]> => {
      const response = await axiosInstance.get("/api/admin/getadmins");
      const result = response.data;
      return z.array(adminSchema).parse(result.data.getAllAdmins);
    },
  });
}

export function useAdminSession() {
  return useQuery({
    queryKey: queryKeys.admins.session(),
    queryFn: async () => {
      const response = await axiosInstance.get("/api/admin/session");
      return response.data.data;
    },
    retry: false,
    staleTime: Infinity,
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidatePlayers: () => queryClient.invalidateQueries({ queryKey: queryKeys.players.all }),
    invalidateLeagues: () => queryClient.invalidateQueries({ queryKey: queryKeys.leagues.all }),
    invalidateSeasons: () => queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all }),
    invalidateDivisions: () => queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all }),
    invalidateAdmins: () => queryClient.invalidateQueries({ queryKey: queryKeys.admins.all }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
