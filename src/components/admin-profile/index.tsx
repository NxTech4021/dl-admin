"use client";

import {
  IconUserCircle,
  IconActivity,
  IconTrophy,
  IconFileText,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminDetail } from "@/hooks/queries/use-admin-queries";
import { useAdminSession } from "@/hooks/use-admin-session";
import type { AdminProfileProps } from "./utils/types";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { OverviewTab } from "./tabs/OverviewTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { ManagedLeaguesTab } from "./tabs/ManagedLeaguesTab";
import { AuditLogTab } from "./tabs/AuditLogTab";

export function AdminProfile({ adminId }: AdminProfileProps) {
  const { data: profile, isLoading, isError } = useAdminDetail(adminId);
  const { user: sessionUser } = useAdminSession();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <div className="container p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested admin profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuperAdmin = sessionUser?.role === "SUPERADMIN";
  const isSelf = sessionUser?.id === profile.userId;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <IconUserCircle className="size-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <IconActivity className="size-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="leagues" className="flex items-center gap-2">
          <IconTrophy className="size-4" />
          Managed Leagues
        </TabsTrigger>
        <TabsTrigger value="audit" className="flex items-center gap-2">
          <IconFileText className="size-4" />
          Audit Log
        </TabsTrigger>
      </TabsList>

      <OverviewTab
        profile={profile}
        isSuperAdmin={isSuperAdmin}
        isSelf={isSelf}
      />
      <ActivityTab profile={profile} />
      <ManagedLeaguesTab profile={profile} />
      <AuditLogTab adminId={adminId} />
    </Tabs>
  );
}
