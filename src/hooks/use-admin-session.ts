"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/session`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUser(response.data.data.user);
        setAdmin(response.data.data.admin || null);
      } else {
        setUser(null);
        setAdmin(null);
      }
    } catch (err: any) {
      // Don't treat 401 as an error - it just means not logged in
      if (err.response?.status === 401) {
        setUser(null);
        setAdmin(null);
        setError(null);
      } else {
        console.error("Session fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch session");
        setUser(null);
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setAdmin(null);
      router.push("/login");
      router.refresh();
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
