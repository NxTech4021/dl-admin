import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  paginatedPaymentsSchema,
  paymentStatsSchema,
  PaginatedPayments,
  PaymentStats,
  PaymentFilters,
  UpdatePaymentStatusRequest,
  BulkUpdatePaymentStatusRequest,
} from "@/constants/zod/payment-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

/**
 * Get all payments with filters and pagination
 */
export function usePayments(filters: Partial<PaymentFilters> = {}) {
  return useQuery({
    queryKey: queryKeys.payments.list(filters),
    queryFn: async (): Promise<PaginatedPayments> => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.seasonId) params.append("seasonId", filters.seasonId);
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const response = await apiClient.get(
        `${endpoints.payments.getAll}?${params.toString()}`
      );

      // Unwrap the API envelope (response.data has { success, data, pagination })
      const unwrapped = {
        data: response.data?.data ?? [],
        pagination: response.data?.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      // Safe parse with error handling
      const parseResult = paginatedPaymentsSchema.safeParse(unwrapped);
      if (!parseResult.success) {
        logger.error("Payments schema validation failed:", parseResult.error.issues);
        return unwrapped;
      }

      return parseResult.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get payment statistics
 */
export function usePaymentStats(filters?: {
  seasonId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: queryKeys.payments.stats(filters),
    queryFn: async (): Promise<PaymentStats> => {
      const params = new URLSearchParams();
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());

      const response = await apiClient.get(
        `${endpoints.payments.getStats}?${params.toString()}`
      );

      // Safe parse with error handling
      const parseResult = paymentStatsSchema.safeParse(response.data.data || response.data);
      if (!parseResult.success) {
        logger.error("Payment stats schema validation failed:", parseResult.error.issues);
        // Return default stats as fallback
        return {
          total: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          totalRevenue: 0,
          outstandingAmount: 0,
        };
      }

      return parseResult.data;
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Update a single payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: UpdatePaymentStatusRequest;
    }) => {
      const response = await apiClient.patch(
        endpoints.payments.updateStatus(membershipId),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
    onError: (error) => {
      logger.error("Failed to update payment status:", getErrorMessage(error, "Unknown error"));
    },
  });
}

/**
 * Bulk update payment statuses
 */
export function useBulkUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdatePaymentStatusRequest) => {
      const response = await apiClient.patch(
        endpoints.payments.bulkUpdateStatus,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all });
    },
    onError: (error) => {
      logger.error("Failed to bulk update payment statuses:", getErrorMessage(error, "Unknown error"));
    },
  });
}
