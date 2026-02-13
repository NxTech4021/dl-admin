import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inactivitySettingsSchema, inactivityStatsSchema, InactivitySettings, InactivityStats, InactivitySettingsInput } from "@/constants/zod/inactivity-settings-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

/**
 * Get inactivity settings (global, league-specific, or season-specific)
 */
export function useInactivitySettings(params?: { leagueId?: string; seasonId?: string }) {
  return useQuery({
    queryKey: queryKeys.inactivity.settings(params),
    queryFn: async (): Promise<InactivitySettings | null> => {
      const queryParams = new URLSearchParams();
      if (params?.leagueId) queryParams.append("leagueId", params.leagueId);
      if (params?.seasonId) queryParams.append("seasonId", params.seasonId);

      const url = queryParams.toString()
        ? `${endpoints.admin.inactivity.getSettings}?${queryParams.toString()}`
        : endpoints.admin.inactivity.getSettings;

      const response = await apiClient.get(url);

      // Backend may return null if no settings exist
      if (!response.data || !response.data.data) {
        return null;
      }

      const payload = response.data.data;
      const parseResult = inactivitySettingsSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Failed to parse inactivity settings:", parseResult.error.issues);
        return null;
      }
      return parseResult.data;
    },
  });
}

/**
 * Get all inactivity settings across all scopes
 */
export function useAllInactivitySettings() {
  return useQuery({
    queryKey: queryKeys.inactivity.allSettings(),
    queryFn: async (): Promise<InactivitySettings[]> => {
      const response = await apiClient.get(endpoints.admin.inactivity.getAllSettings);
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(inactivitySettingsSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Failed to parse all inactivity settings:", parseResult.error.issues);
        return Array.isArray(payload) ? payload : [];
      }
      return parseResult.data;
    },
  });
}

/**
 * Get inactivity statistics
 */
export function useInactivityStats() {
  return useQuery({
    queryKey: queryKeys.inactivity.stats(),
    queryFn: async (): Promise<InactivityStats> => {
      const response = await apiClient.get(endpoints.admin.inactivity.getStats);
      const payload = response.data?.data ?? response.data;
      const parseResult = inactivityStatsSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Failed to parse inactivity stats:", parseResult.error.issues);
        return payload;
      }
      return parseResult.data;
    },
  });
}

/**
 * Update inactivity settings
 */
export function useUpdateInactivitySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InactivitySettingsInput) => {
      const response = await apiClient.put(
        endpoints.admin.inactivity.updateSettings,
        input
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inactivity.all });
    },
    onError: (error) => {
      logger.error("Failed to update inactivity settings:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Delete inactivity settings (revert to defaults)
 */
export function useDeleteInactivitySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsId: string) => {
      const response = await apiClient.delete(
        endpoints.admin.inactivity.deleteSettings(settingsId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inactivity.all });
    },
    onError: (error) => {
      logger.error("Failed to delete inactivity settings:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Manually trigger inactivity check
 */
export function useTriggerInactivityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(endpoints.admin.inactivity.triggerCheck);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inactivity.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all });
    },
    onError: (error) => {
      logger.error("Failed to trigger inactivity check:", getErrorMessage(error, "Unknown error"));
    },
  });
}
