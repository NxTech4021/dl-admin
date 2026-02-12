import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  paginatedAdminLogsSchema,
  filterOptionSchema,
  activitySummarySchema,
  paginatedUserActivityLogsSchema,
  type PaginatedAdminLogs,
  type AdminLogFilters,
  type FilterOption,
  type ActivitySummary,
  type PaginatedUserActivityLogs,
  type UserActivityFilters,
} from "@/constants/zod/admin-log-schema";
import { endpoints } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

const DEFAULT_PAGINATION = { page: 1, limit: 50, total: 0, totalPages: 0 };

// ========================================
// Admin Log Hooks
// ========================================

/**
 * Get paginated admin logs with filters
 */
export function useAdminLogs(filters: Partial<AdminLogFilters> = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminLogs.list(filters),
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<PaginatedAdminLogs> => {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.search) params.append("search", filters.search);
      if (filters.actionType) params.append("actionType", filters.actionType);
      if (filters.targetType) params.append("targetType", filters.targetType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await apiClient.get(
        `${endpoints.admin.logs.getAll}?${params.toString()}`
      );

      const parseResult = paginatedAdminLogsSchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("Admin logs schema validation failed:", parseResult.error.issues);
        return {
          data: response.data.data ?? [],
          pagination: response.data.pagination ?? DEFAULT_PAGINATION,
        };
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get available action type filter options
 */
export function useAdminLogActionTypes() {
  return useQuery({
    queryKey: queryKeys.adminLogs.actionTypes(),
    queryFn: async (): Promise<FilterOption[]> => {
      const response = await apiClient.get(endpoints.admin.logs.getActionTypes);

      const parseResult = z.array(filterOptionSchema).safeParse(response.data);
      if (!parseResult.success) {
        logger.error("Action types schema validation failed:", parseResult.error.issues);
        return response.data ?? [];
      }

      return parseResult.data;
    },
    staleTime: 300000, // 5 minutes — these change rarely
  });
}

/**
 * Get available target type filter options
 */
export function useAdminLogTargetTypes() {
  return useQuery({
    queryKey: queryKeys.adminLogs.targetTypes(),
    queryFn: async (): Promise<FilterOption[]> => {
      const response = await apiClient.get(endpoints.admin.logs.getTargetTypes);

      const parseResult = z.array(filterOptionSchema).safeParse(response.data);
      if (!parseResult.success) {
        logger.error("Target types schema validation failed:", parseResult.error.issues);
        return response.data ?? [];
      }

      return parseResult.data;
    },
    staleTime: 300000,
  });
}

/**
 * Get activity summary statistics
 */
export function useAdminLogSummary(options?: { days?: number; adminId?: string }) {
  return useQuery({
    queryKey: queryKeys.adminLogs.summary(options),
    queryFn: async (): Promise<ActivitySummary> => {
      const params = new URLSearchParams();
      if (options?.days) params.append("days", String(options.days));
      if (options?.adminId) params.append("adminId", options.adminId);

      const response = await apiClient.get(
        `${endpoints.admin.logs.getSummary}?${params.toString()}`
      );

      const parseResult = activitySummarySchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("Activity summary schema validation failed:", parseResult.error.issues);
        return response.data ?? { totalActions: 0, byActionType: [], byTargetType: [], dailyCounts: [], period: "" };
      }

      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/**
 * Get admin logs for a specific target
 */
export function useAdminLogForTarget(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: queryKeys.adminLogs.forTarget(targetType, targetId),
    queryFn: async (): Promise<PaginatedAdminLogs> => {
      const response = await apiClient.get(
        endpoints.admin.logs.getForTarget(targetType!, targetId!)
      );

      const parseResult = paginatedAdminLogsSchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("Admin logs for target schema validation failed:", parseResult.error.issues);
        return {
          data: response.data.data ?? [],
          pagination: response.data.pagination ?? DEFAULT_PAGINATION,
        };
      }

      return parseResult.data;
    },
    enabled: !!targetType && !!targetId,
    staleTime: 30000,
  });
}

// ========================================
// User Activity Log Hooks
// ========================================

/**
 * Get paginated user activity logs with filters
 */
export function useUserActivityLogs(filters: Partial<UserActivityFilters> = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.userActivity.list(filters),
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<PaginatedUserActivityLogs> => {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.actionType) params.append("actionType", filters.actionType);
      if (filters.targetType) params.append("targetType", filters.targetType);
      if (filters.targetId) params.append("targetId", filters.targetId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await apiClient.get(
        `${endpoints.admin.userActivity.getAll}?${params.toString()}`
      );

      const parseResult = paginatedUserActivityLogsSchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("User activity logs schema validation failed:", parseResult.error.issues);
        return {
          data: response.data.data ?? [],
          pagination: response.data.pagination ?? DEFAULT_PAGINATION,
        };
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get user activity logs for a specific user
 */
export function useUserActivityForUser(userId?: string) {
  return useQuery({
    queryKey: queryKeys.userActivity.forUser(userId),
    queryFn: async (): Promise<PaginatedUserActivityLogs> => {
      const response = await apiClient.get(
        endpoints.admin.userActivity.getForUser(userId!)
      );

      const parseResult = paginatedUserActivityLogsSchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("User activity for user schema validation failed:", parseResult.error.issues);
        return {
          data: response.data.data ?? [],
          pagination: response.data.pagination ?? DEFAULT_PAGINATION,
        };
      }

      return parseResult.data;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

/**
 * Get user activity logs for a specific target
 */
export function useUserActivityForTarget(targetType?: string, targetId?: string) {
  return useQuery({
    queryKey: queryKeys.userActivity.forTarget(targetType, targetId),
    queryFn: async (): Promise<PaginatedUserActivityLogs> => {
      const response = await apiClient.get(
        endpoints.admin.userActivity.getForTarget(targetType!, targetId!)
      );

      const parseResult = paginatedUserActivityLogsSchema.safeParse(response.data);
      if (!parseResult.success) {
        logger.error("User activity for target schema validation failed:", parseResult.error.issues);
        return {
          data: response.data.data ?? [],
          pagination: response.data.pagination ?? DEFAULT_PAGINATION,
        };
      }

      return parseResult.data;
    },
    enabled: !!targetType && !!targetId,
    staleTime: 30000,
  });
}
