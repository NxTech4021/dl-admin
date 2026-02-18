import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  withdrawalRequestAdminSchema,
  withdrawalRequestStatsSchema,
  dissolvedPartnershipSchema,
  WithdrawalRequestAdmin,
  WithdrawalRequestStats,
  DissolvedPartnership,
  WithdrawalRequestStatus,
} from "@/constants/zod/partnership-admin-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

/**
 * Get all withdrawal requests with optional filters
 */
export function useWithdrawalRequestsAdmin(filters?: {
  status?: WithdrawalRequestStatus;
  seasonId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.withdrawalRequestList(filters),
    queryFn: async (): Promise<WithdrawalRequestAdmin[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.search) params.append("search", filters.search);

      const url = params.toString()
        ? `${endpoints.partnershipAdmin.getWithdrawalRequests}?${params.toString()}`
        : endpoints.partnershipAdmin.getWithdrawalRequests;

      const response = await apiClient.get(url);

      // Unwrap API envelope: response.data is { success, data: T }, actual payload is response.data.data
      const payload = response.data?.data ?? response.data;

      // Safe parse with error handling
      const parseResult = z.array(withdrawalRequestAdminSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Withdrawal requests schema validation failed:", parseResult.error.issues);
        return Array.isArray(payload) ? payload : [];
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get withdrawal request statistics
 */
export function useWithdrawalRequestStats() {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.withdrawalRequestStats(),
    queryFn: async (): Promise<WithdrawalRequestStats> => {
      const response = await apiClient.get(endpoints.partnershipAdmin.getWithdrawalRequestStats);

      // Unwrap API envelope: response.data is { success, data: T }, actual payload is response.data.data
      const payload = response.data?.data ?? response.data;

      const parseResult = withdrawalRequestStatsSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Withdrawal stats schema validation failed:", parseResult.error.issues);
        return { pending: 0, approved: 0, rejected: 0, total: 0, totalDissolved: 0 };
      }

      return parseResult.data;
    },
    staleTime: 60000,
  });
}

/**
 * Get all dissolved partnerships with lifecycle info
 */
export function useDissolvedPartnerships(filters?: {
  seasonId?: string;
  search?: string;
  status?: "DISSOLVED" | "EXPIRED";
}) {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.dissolvedPartnershipList(filters),
    queryFn: async (): Promise<DissolvedPartnership[]> => {
      const params = new URLSearchParams();
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);

      const url = params.toString()
        ? `${endpoints.partnershipAdmin.getDissolvedPartnerships}?${params.toString()}`
        : endpoints.partnershipAdmin.getDissolvedPartnerships;

      const response = await apiClient.get(url);

      // Unwrap API envelope: response.data is { success, data: T }, actual payload is response.data.data
      const payload = response.data?.data ?? response.data;

      const parseResult = z.array(dissolvedPartnershipSchema).safeParse(payload);
      if (!parseResult.success) {
        logger.error("Dissolved partnerships schema validation failed:", parseResult.error.issues);
        return Array.isArray(payload) ? payload : [];
      }

      return parseResult.data;
    },
    staleTime: 30000,
  });
}

/**
 * Get a single dissolved partnership by ID with full lifecycle
 */
export function useDissolvedPartnership(id: string | null) {
  return useQuery({
    queryKey: queryKeys.partnershipAdmin.dissolvedPartnershipDetail(id || ""),
    queryFn: async (): Promise<DissolvedPartnership | null> => {
      if (!id) return null;
      const response = await apiClient.get(endpoints.partnershipAdmin.getDissolvedPartnershipById(id));

      // Unwrap API envelope: response.data is { success, data: T }, actual payload is response.data.data
      const payload = response.data?.data ?? response.data;

      const parseResult = dissolvedPartnershipSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Dissolved partnership schema validation failed:", parseResult.error.issues);
        return payload ?? null;
      }

      return parseResult.data;
    },
    enabled: !!id,
  });
}

/**
 * Process a withdrawal request (approve/reject)
 */
export function useProcessWithdrawalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminNotes,
    }: {
      requestId: string;
      status: "APPROVED" | "REJECTED";
      adminNotes?: string;
    }) => {
      const response = await apiClient.put(
        endpoints.withdrawal.process(requestId),
        { status, adminNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partnershipAdmin.all });
    },
    onError: (error) => {
      logger.error("Failed to process withdrawal request:", getErrorMessage(error, "Unknown error"));
    },
  });
}
