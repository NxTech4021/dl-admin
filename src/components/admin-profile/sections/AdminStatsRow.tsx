import {
  IconTrophy,
  IconScale,
  IconGavel,
  IconTarget,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminDetail } from "../utils/types";

interface AdminStatsRowProps {
  profile: AdminDetail;
}

const stats = [
  {
    key: "leagues" as const,
    label: "Leagues Managed",
    icon: IconTrophy,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    key: "reviewedDisputes" as const,
    label: "Disputes Reviewed",
    icon: IconScale,
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/20",
  },
  {
    key: "resolvedDisputes" as const,
    label: "Disputes Resolved",
    icon: IconGavel,
    color: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    key: "adminMatchActions" as const,
    label: "Match Actions",
    icon: IconTarget,
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/20",
  },
];

export function AdminStatsRow({ profile }: AdminStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key}>
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <div
              className={`flex items-center justify-center size-10 rounded-full ${bg} mb-2`}
            >
              <Icon className={`size-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{profile._count[key]}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
