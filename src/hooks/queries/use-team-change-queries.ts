import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamChangeRequestSchema, teamChangeRequestsResponseSchema, TeamChangeRequest, TeamChangeRequestStatus } from "@/constants/zod/team-change-request-schema";
import { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { logger } from "@/lib/logger";

/**
 * Get all team change requests with optional filters
 */
export function useTeamChangeRequests(filters?: {
  status?: TeamChangeRequestStatus;
  seasonId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.teamChangeRequests.list(filters),
    queryFn: async (): Promise<TeamChangeRequest[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.seasonId) params.append("seasonId", filters.seasonId);

      const url = params.toString()
        ? `${endpoints.teamChangeRequests.getAll}?${params.toString()}`
        : endpoints.teamChangeRequests.getAll;

      const response = await apiClient.get(url);
      const payload = response.data?.data ?? response.data;
      const parseResult = teamChangeRequestsResponseSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Team change requests schema validation failed:", parseResult.error.issues);
        return Array.isArray(payload) ? payload : [];
      }
      return parseResult.data;
    },
  });
}

/**
 * Get a single team change request by ID
 */
export function useTeamChangeRequest(id: string | null) {
  return useQuery({
    queryKey: queryKeys.teamChangeRequests.detail(id || ""),
    queryFn: async (): Promise<TeamChangeRequest | null> => {
      if (!id) return null;
      const response = await apiClient.get(endpoints.teamChangeRequests.getById(id));
      const payload = response.data?.data ?? response.data;
      const parseResult = teamChangeRequestSchema.safeParse(payload);
      if (!parseResult.success) {
        logger.error("Team change request schema validation failed:", parseResult.error.issues);
        return payload ?? null;
      }
      return parseResult.data;
    },
    enabled: !!id,
  });
}

/**
 * Get pending team change requests count
 */
export function usePendingTeamChangeRequestsCount() {
  return useQuery({
    queryKey: queryKeys.teamChangeRequests.pendingCount(),
    queryFn: async (): Promise<number> => {
      const response = await apiClient.get(endpoints.teamChangeRequests.getPendingCount);
      const payload = response.data?.data ?? response.data;
      return payload?.count || 0;
    },
  });
}

/**
 * Process a team change request (approve/deny)
 */
export function useProcessTeamChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminId,
      adminNotes,
    }: {
      requestId: string;
      status: "APPROVED" | "DENIED";
      adminId: string;
      adminNotes?: string;
    }) => {
      const response = await apiClient.patch(
        endpoints.teamChangeRequests.process(requestId),
        { status, adminId, adminNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamChangeRequests.all });
    },
    onError: (error) => {
      logger.error("Failed to process team change request:", getErrorMessage(error, "Unknown error"));
    },
  });
}
