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

interface UseAdminSessionReturn {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAdminSession(): UseAdminSessionReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST_URL}/admin/session`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Don't treat 401 as an error - it just means not logged in
      if (err.response?.status === 401) {
        setUser(null);
        setError(null);
      } else {
        console.error("Session fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch session");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/admin/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
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
    loading,
    error,
    logout,
    refreshSession,
  };
}
