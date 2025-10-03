// app/admin/account/page.tsx
"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/profile-card";
import { useAdminSession } from "@/hooks/use-admin-session";

import ChangePasswordForm from "@/components/change-password-form";
import axiosInstance, { endpoints } from "@/lib/endpoints";

export default function AdminAccountPage() {
  const { user, loading, error, refreshSession } = useAdminSession();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("🔑 Session status changed");
    console.log("Loading:", loading);

    console.log("User from session:", user);
  }, [user, loading, error]);

  console.log("userid", user?.id);

  const handleSave = async (data: Partial<typeof user>) => {
    setSaving(true);
    try {
      await axiosInstance.put(
        endpoints.admin.updateAccount,
        // `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/account/update`,
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
        {/* <SiteHeader /> */}
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
      </SidebarInset>
    </SidebarProvider>
  );
}
