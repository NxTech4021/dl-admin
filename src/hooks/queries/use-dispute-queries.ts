import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { FinalScore } from "@/constants/zod/dispute-schema";
import { queryKeys } from "./query-keys";

/**
 * Get all disputes with filters
 */
export function useDisputes(filters?: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.disputes.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get(
        `${endpoints.admin.disputes.getAll}?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Get single dispute by ID
 */
export function useDispute(id: string) {
  return useQuery({
    queryKey: queryKeys.disputes.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(
        endpoints.admin.disputes.getById(id)
      );
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Start reviewing a dispute - sets status to UNDER_REVIEW
 */
export function useStartDisputeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      const response = await apiClient.post(
        endpoints.admin.disputes.startReview(disputeId)
      );
      return response.data;
    },
    onSuccess: (_, disputeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.disputes.detail(disputeId),
      });
    },
  });
}

/**
 * Resolve dispute (admin action)
 */
export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      action,
      finalScore,
      reason,
      notifyPlayers,
    }: {
      disputeId: string;
      action: string;
      finalScore?: FinalScore;
      reason: string;
      notifyPlayers?: boolean;
    }) => {
      const response = await apiClient.post(
        endpoints.admin.disputes.resolve(disputeId),
        {
          action,
          finalScore,
          reason,
          notifyPlayers,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.disputes.detail(variables.disputeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

/**
 * Get open disputes count for sidebar badge
 */
export function useOpenDisputeCount() {
  return useQuery({
    queryKey: queryKeys.disputes.openCount(),
    queryFn: async () => {
      // Fetch only OPEN and UNDER_REVIEW disputes to get the count
      const params = new URLSearchParams();
      params.append("status", "OPEN,UNDER_REVIEW");
      params.append("limit", "1"); // We only need the total count

      const response = await apiClient.get(
        `${endpoints.admin.disputes.getAll}?${params.toString()}`
      );
      return response.data?.total || 0;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Add note to dispute (admin action)
 */
export function useAddDisputeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      note,
      isInternalOnly = true,
    }: {
      disputeId: string;
      note: string;
      isInternalOnly?: boolean;
    }) => {
      const response = await apiClient.post(
        `${endpoints.admin.disputes.getById(disputeId)}/notes`,
        {
          note,
          isInternalOnly,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.disputes.detail(variables.disputeId),
      });
    },
  });
}
