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

      // Safe parse with error handling
      const parseResult = z.array(withdrawalRequestAdminSchema).safeParse(response.data);
      if (!parseResult.success) {
        console.error("Withdrawal requests schema validation failed:", parseResult.error.issues);
        return response.data ?? [];
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

      const parseResult = withdrawalRequestStatsSchema.safeParse(response.data);
      if (!parseResult.success) {
        console.error("Withdrawal stats schema validation failed:", parseResult.error.issues);
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

      const parseResult = z.array(dissolvedPartnershipSchema).safeParse(response.data);
      if (!parseResult.success) {
        console.error("Dissolved partnerships schema validation failed:", parseResult.error.issues);
        return response.data ?? [];
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

      const parseResult = dissolvedPartnershipSchema.safeParse(response.data);
      if (!parseResult.success) {
        console.error("Dissolved partnership schema validation failed:", parseResult.error.issues);
        return response.data;
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
      const response = await apiClient.patch(
        endpoints.withdrawal.process(requestId),
        { status, adminNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partnershipAdmin.all });
    },
    onError: (error) => {
      console.error("Failed to process withdrawal request:", getErrorMessage(error, "Unknown error"));
    },
  });
}
