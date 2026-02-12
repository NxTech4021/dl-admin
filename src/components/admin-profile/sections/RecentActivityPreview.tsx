import {
  IconTrophy,
  IconScale,
  IconTarget,
  IconHistory,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminDetail } from "../utils/types";

interface RecentActivityPreviewProps {
  profile: AdminDetail;
}

export function RecentActivityPreview({
  profile,
}: RecentActivityPreviewProps) {
  const activityItems = [
    {
      icon: IconTrophy,
      label: "Leagues managed",
      value: profile._count.leagues,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: IconScale,
      label: "Disputes reviewed",
      value: profile._count.reviewedDisputes,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      icon: IconTarget,
      label: "Match actions taken",
      value: profile._count.adminMatchActions,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      icon: IconHistory,
      label: "Status changes",
      value: profile._count.statusChanges,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
  ];

  const hasActivity = activityItems.some((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconHistory className="size-5 text-muted-foreground" />
          Activity Summary
        </CardTitle>
        <CardDescription>Overview of admin actions and activity</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
          <div className="space-y-3">
            {activityItems
              .filter((item) => item.value > 0)
              .map(({ icon: Icon, label, value, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center size-8 rounded-full ${bg}`}
                    >
                      <Icon className={`size-4 ${color}`} />
                    </div>
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconHistory className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No activity recorded yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
