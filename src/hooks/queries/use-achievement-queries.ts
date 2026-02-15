import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { achievementSchema, Achievement } from "@/constants/zod/achievement-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

/**
 * Get all achievements with optional filters
 */
export function useAchievements(filters?: {
  category?: string;
  tier?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.achievements.list(filters),
    queryFn: async (): Promise<Achievement[]> => {
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.tier) params.append("tier", filters.tier);
      if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
      if (filters?.search) params.append("search", filters.search);

      const url = params.toString()
        ? `${endpoints.achievements.getAll}?${params.toString()}`
        : endpoints.achievements.getAll;

      const response = await apiClient.get(url);

      // Safe envelope unwrap
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(achievementSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Achievements schema validation failed:", parseResult.error.issues);
        return payload as Achievement[];
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get a single achievement by ID
 */
export function useAchievement(id: string) {
  return useQuery({
    queryKey: queryKeys.achievements.detail(id),
    queryFn: async (): Promise<Achievement> => {
      const response = await apiClient.get(endpoints.achievements.getById(id));

      // Safe envelope unwrap
      const payload = response.data?.data ?? response.data;
      const parseResult = achievementSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Achievement schema validation failed:", parseResult.error.issues);
        return payload as Achievement;
      }

      return parseResult.data;
    },
    enabled: !!id,
  });
}

/**
 * Get available evaluator keys
 */
export function useAchievementEvaluators() {
  return useQuery({
    queryKey: queryKeys.achievements.evaluators(),
    queryFn: async (): Promise<string[]> => {
      const response = await apiClient.get(endpoints.achievements.getEvaluators);

      // Safe envelope unwrap
      const payload = response.data?.data ?? response.data;
      const parseResult = z.array(z.string()).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Achievement evaluators schema validation failed:", parseResult.error.issues);
        return [];
      }

      return parseResult.data;
    },
    staleTime: 300000,
  });
}

/**
 * Create a new achievement
 */
export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Achievement>) => {
      const response = await apiClient.post(endpoints.achievements.create, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });
    },
    onError: (error) => {
      logger.error("Failed to create achievement:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Update an existing achievement
 */
export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Achievement> }) => {
      const response = await apiClient.put(endpoints.achievements.update(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });
    },
    onError: (error) => {
      logger.error("Failed to update achievement:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Delete (soft deactivate) an achievement
 */
export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(endpoints.achievements.delete(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });
    },
    onError: (error) => {
      logger.error("Failed to delete achievement:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Grant an achievement to a user
 */
export function useGrantAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const response = await apiClient.post(endpoints.achievements.grant(id), { userId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });
    },
    onError: (error) => {
      logger.error("Failed to grant achievement:", getErrorMessage(error, "Unknown error"));
    },
  });
}
