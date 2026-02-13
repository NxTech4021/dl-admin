import { TabsContent } from "@/components/ui/tabs";
import type { AdminDetail, AdminStatus } from "../utils/types";
import { AdminProfileCard } from "../sections/AdminProfileCard";
import { AdminStatsRow } from "../sections/AdminStatsRow";
import { AdminRoleCard } from "../sections/AdminRoleCard";
import { RecentActivityPreview } from "../sections/RecentActivityPreview";
import { AdminActions } from "../admin-actions";

interface OverviewTabProps {
  profile: AdminDetail;
  isSuperAdmin: boolean;
  isSelf: boolean;
}

export function OverviewTab({
  profile,
  isSuperAdmin,
  isSelf,
}: OverviewTabProps) {
  return (
    <TabsContent value="overview">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Profile Card + Actions */}
        <div className="md:col-span-1 space-y-6">
          <AdminProfileCard profile={profile} />
          <AdminActions
            adminId={profile.id}
            adminName={profile.user?.name ?? "Unknown"}
            currentStatus={profile.status as AdminStatus}
            isSuperAdmin={isSuperAdmin}
            isSelf={isSelf}
          />
        </div>

        {/* Right Column: Stats + Role + Activity */}
        <div className="md:col-span-2 space-y-6">
          <AdminStatsRow profile={profile} />
          <AdminRoleCard profile={profile} />
          <RecentActivityPreview profile={profile} />
        </div>
      </div>
    </TabsContent>
  );
}
