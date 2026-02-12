import { IconShieldCheck, IconCheck, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminDetail } from "../utils/types";
import { getRoleBadgeConfig } from "../utils/utils";

interface AdminRoleCardProps {
  profile: AdminDetail;
}

const PERMISSIONS = [
  { key: "manageLeagues", label: "Manage Leagues", superOnly: false },
  { key: "manageMatches", label: "Manage Matches", superOnly: false },
  { key: "managePlayers", label: "Manage Players", superOnly: false },
  { key: "resolveDisputes", label: "Resolve Disputes", superOnly: false },
  { key: "manageAdmins", label: "Manage Admins", superOnly: true },
  { key: "systemSettings", label: "System Settings", superOnly: true },
];

export function AdminRoleCard({ profile }: AdminRoleCardProps) {
  const role = profile.user?.role ?? "ADMIN";
  const roleConfig = getRoleBadgeConfig(role);
  const isSuperAdmin = role === "SUPERADMIN";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconShieldCheck className="size-5 text-blue-600" />
          Role & Permissions
        </CardTitle>
        <CardDescription>
          Current role and access level for this admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={roleConfig.variant} className={roleConfig.className}>
            {roleConfig.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Full system access"
              : "Standard admin access"}
          </span>
        </div>

        <div className="space-y-2">
          {PERMISSIONS.map(({ key, label, superOnly }) => {
            const hasAccess = isSuperAdmin || !superOnly;
            return (
              <div
                key={key}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm">{label}</span>
                {hasAccess ? (
                  <IconCheck className="size-4 text-emerald-600" />
                ) : (
                  <IconX className="size-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
