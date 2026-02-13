import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

// Types for bug report settings
export interface BugReportSettings {
  id: string;
  appId: string;
  syncEnabled: boolean;
  googleSheetId: string | null;
  googleSheetName: string | null;
  enableScreenshots: boolean;
  enableAutoCapture: boolean;
  enableConsoleCapture: boolean;
  enableNetworkCapture: boolean;
  maxScreenshots: number;
  maxFileSize: number;
  notifyEmails: string[] | null;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
  notifyOnNew: boolean;
  notifyOnStatusChange: boolean;
  defaultPriority: string;
  updatedAt: string;
  createdAt: string;
}

export interface BugReportSettingsInput {
  syncEnabled?: boolean;
  googleSheetId?: string;
  googleSheetName?: string;
  enableScreenshots?: boolean;
  enableAutoCapture?: boolean;
  enableConsoleCapture?: boolean;
  enableNetworkCapture?: boolean;
  maxScreenshots?: number;
  maxFileSize?: number;
  notifyEmails?: string[];
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  notifyOnNew?: boolean;
  notifyOnStatusChange?: boolean;
  defaultPriority?: string;
}

/**
 * Initialize the DLA app and get its ID
 */
export function useBugAppInit() {
  return useQuery({
    queryKey: queryKeys.bug.app("dla"),
    queryFn: async (): Promise<{ appId: string; name: string }> => {
      const response = await apiClient.get(endpoints.bug.init);
      const payload = response.data?.data ?? response.data;
      return { appId: payload.appId, name: payload.name || "DLA" };
    },
    staleTime: Infinity, // App ID won't change
  });
}

/**
 * Get bug report settings for an app
 */
export function useBugReportSettings(appId: string | null) {
  return useQuery({
    queryKey: queryKeys.bug.settings(appId || ""),
    queryFn: async (): Promise<BugReportSettings | null> => {
      if (!appId) return null;
      const response = await apiClient.get(endpoints.bug.getSettings(appId));
      const payload = response.data?.data ?? response.data;
      return payload as BugReportSettings | null;
    },
    enabled: !!appId,
  });
}

/**
 * Update bug report settings for an app
 */
export function useUpdateBugReportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, data }: { appId: string; data: BugReportSettingsInput }) => {
      const response = await apiClient.put(endpoints.bug.updateSettings(appId), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bug.settings(variables.appId) });
    },
    onError: (error) => {
      logger.error("Failed to update bug report settings:", getErrorMessage(error, "Unknown error"));
    },
  });
}
