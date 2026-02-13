import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/api-error";
import { isAxiosError } from "axios";
import { logger } from "@/lib/logger";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPERADMIN";
}

interface AdminRecord {
  id: string;
  status: string;
}

interface UseAdminSessionReturn {
  user: AdminUser | null;
  admin: AdminRecord | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAdminSession(): UseAdminSessionReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [admin, setAdmin] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/admin/session");

      if (response.data.success) {
        setUser(response.data.data.user);
        setAdmin(response.data.data.admin || null);
      } else {
        setUser(null);
        setAdmin(null);
      }
    } catch (err: unknown) {
      // Don't treat 401 as an error - it just means not logged in
      if (isAxiosError(err) && err.response?.status === 401) {
        setUser(null);
        setAdmin(null);
        setError(null);
      } else {
        logger.error("Session fetch error:", err);
        setError(getErrorMessage(err, "Failed to fetch session"));
        setUser(null);
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/api/admin/logout");
    } catch (err) {
      logger.error("Logout error:", err);
    } finally {
      setUser(null);
      setAdmin(null);
      navigate({ to: "/login" });
    }
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    user,
    admin,
    loading,
    error,
    logout,
    refreshSession,
  };
}
