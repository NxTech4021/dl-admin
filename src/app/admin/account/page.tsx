// app/admin/account/page.tsx
"use client";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileCard } from "@/components/profile-card";
import { useAdminSession } from "@/hooks/use-admin-session";

import ChangePasswordForm from "@/components/change-password-form";
import axiosInstance, { endpoints } from "@/lib/endpoints";

export default function AdminAccountPage() {
  const { user, loading, refreshSession } = useAdminSession();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: Partial<typeof user>) => {
    setSaving(true);
    try {
      await axiosInstance.put(
        endpoints.admin.updateAccount,
        // `${import.meta.env.VITE_API_BASE_URL}/api/admin/account/update`,
        {
          adminId: user?.id,
          ...data,
        },
        { withCredentials: true }
      );
      await refreshSession();
    } catch (err: unknown) {
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="container mx-auto p-6">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <Skeleton className="h-7 w-32" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-10 w-24 mt-4" />
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 border rounded-xl shadow-sm space-y-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-72" />
            <div className="space-y-4 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ProfileCard profile={user} onSave={handleSave} saving={saving} />
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="p-6 border rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your password, security, and notifications here.
                  </p>
                  <ChangePasswordForm />
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
