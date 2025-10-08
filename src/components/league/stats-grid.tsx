"use client";

import { IconUsers, IconAward, IconClock, IconBuilding } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsGridProps {
  memberCount: number;
  categoryCount: number;
  seasonCount: number;
  sponsorCount: number;
}

export function StatsGrid({ memberCount, categoryCount, seasonCount, sponsorCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <IconUsers className="size-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{memberCount}</p>
              <p className="text-sm text-muted-foreground">Total Players</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <IconAward className="size-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{categoryCount}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <IconClock className="size-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{seasonCount}</p>
              <p className="text-sm text-muted-foreground">Seasons</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <IconBuilding className="size-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{sponsorCount}</p>
              <p className="text-sm text-muted-foreground">Sponsors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
