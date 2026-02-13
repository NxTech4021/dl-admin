import {
  IconMail,
  IconMapPin,
  IconCalendar,
  IconUserCircle,
  IconClock,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDetail } from "../utils/types";
import {
  getInitials,
  formatDate,
  getAdminStatusConfig,
  getRoleBadgeConfig,
} from "../utils/utils";

interface AdminProfileCardProps {
  profile: AdminDetail;
}

export function AdminProfileCard({ profile }: AdminProfileCardProps) {
  const user = profile.user;
  const name = user?.name ?? "Unknown";
  const statusConfig = getAdminStatusConfig(profile.status);
  const roleConfig = getRoleBadgeConfig(user?.role ?? "ADMIN");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={user?.image || undefined} alt={name} />
            <AvatarFallback className="text-xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <CardTitle className="text-2xl">{name}</CardTitle>
              {user?.username && (
                <p className="text-sm text-muted-foreground">
                  @{user.displayUsername || user.username}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={statusConfig.variant}
                className={statusConfig.className}
              >
                {statusConfig.label}
              </Badge>
              <Badge
                variant={roleConfig.variant}
                className={roleConfig.className}
              >
                {roleConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconMail className="size-4" />
            <span>{user?.email ?? "No email"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconMapPin className="size-4" />
            <span>{user?.area || "Location not set"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconUserCircle className="size-4" />
            <span className="capitalize">
              {user?.gender || "Gender not set"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="size-4" />
            <span>Joined on {formatDate(profile.createdAt)}</span>
          </div>
          {user?.lastLogin && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconClock className="size-4" />
              <span>Last login: {formatDate(user.lastLogin)}</span>
            </div>
          )}
        </div>

        {profile.invite && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Invited via {profile.invite.email}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
