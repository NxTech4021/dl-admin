import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import { logger } from "@/lib/logger";

interface SuspendAdminInput {
  adminId: string;
  reason: string;
  notes?: string;
}

interface ActivateAdminInput {
  adminId: string;
  notes?: string;
}

export function useSuspendAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SuspendAdminInput) => {
      const response = await apiClient.post(
        `/api/admin/admins/${input.adminId}/suspend`,
        { reason: input.reason, notes: input.notes }
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Admin suspended successfully");
      queryClient.invalidateQueries({
        queryKey: queryKeys.admins.detail(variables.adminId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admins.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admins.statusHistory(variables.adminId),
      });
    },
    onError: (error) => {
      logger.error("Failed to suspend admin:", error);
      toast.error(getErrorMessage(error, "Failed to suspend admin"));
    },
  });
}

export function useActivateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ActivateAdminInput) => {
      const response = await apiClient.post(
        `/api/admin/admins/${input.adminId}/activate`,
        { notes: input.notes }
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Admin activated successfully");
      queryClient.invalidateQueries({
        queryKey: queryKeys.admins.detail(variables.adminId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admins.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admins.statusHistory(variables.adminId),
      });
    },
    onError: (error) => {
      logger.error("Failed to activate admin:", error);
      toast.error(getErrorMessage(error, "Failed to activate admin"));
    },
  });
}
