import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  adminSchema,
  Admin,
  adminDetailSchema,
  AdminDetail,
  AdminStatusHistoryItem,
} from "@/constants/zod/admin-schema";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.list(),
    queryFn: async (): Promise<Admin[]> => {
      const response = await apiClient.get("/api/admin/getadmins");
      const result = response.data;
      return z.array(adminSchema).parse(result.data.getAllAdmins);
    },
  });
}

export function useAdminSession() {
  return useQuery({
    queryKey: queryKeys.admins.session(),
    queryFn: async () => {
      const response = await apiClient.get("/api/admin/session");
      return response.data.data;
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function useAdminDetail(adminId: string) {
  return useQuery({
    queryKey: queryKeys.admins.detail(adminId),
    queryFn: async (): Promise<AdminDetail> => {
      const response = await apiClient.get(
        `/api/admin/admins/${adminId}`
      );
      const result = response.data;
      return adminDetailSchema.parse(result.data);
    },
    enabled: !!adminId,
  });
}

export function useAdminStatusHistory(
  adminId: string,
  enabled = false
) {
  return useQuery({
    queryKey: queryKeys.admins.statusHistory(adminId),
    queryFn: async (): Promise<AdminStatusHistoryItem[]> => {
      const response = await apiClient.get(
        `/api/admin/admins/${adminId}/status-history`
      );
      return response.data.data;
    },
    enabled: enabled && !!adminId,
  });
}
