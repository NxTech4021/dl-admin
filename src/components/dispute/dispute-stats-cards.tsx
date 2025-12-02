"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertCircle, IconEye, IconCheck, IconX } from "@tabler/icons-react";
import { useDisputes } from "@/hooks/use-queries";

export function DisputeStatsCards() {
  // Get open disputes count
  const { data: openData } = useDisputes({ status: "OPEN", limit: 1 });
  const { data: reviewData } = useDisputes({ status: "UNDER_REVIEW", limit: 1 });
  const { data: resolvedData } = useDisputes({ status: "RESOLVED", limit: 1 });
  const { data: rejectedData } = useDisputes({ status: "REJECTED", limit: 1 });

  const stats = [
    {
      title: "Open",
      value: openData?.total || 0,
      icon: IconAlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      title: "Under Review",
      value: reviewData?.total || 0,
      icon: IconEye,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Resolved",
      value: resolvedData?.total || 0,
      icon: IconCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Rejected",
      value: rejectedData?.total || 0,
      icon: IconX,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-700/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
