import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { adminSchema, Admin } from "@/constants/zod/admin-schema";
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
