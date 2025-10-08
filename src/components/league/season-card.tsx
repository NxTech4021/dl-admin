"use client";

import { IconCalendar, IconPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Season, FormatDateFunction } from "./types";

interface SeasonCardProps {
  seasons: Season[];
  formatDate: FormatDateFunction;
}

export function SeasonCard({ seasons, formatDate }: SeasonCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="size-5" />
          Seasons
        </CardTitle>
      </CardHeader>
      <CardContent>
        {seasons.length > 0 ? (
          <div className="space-y-3">
            {seasons.map((season) => (
              <div key={season.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                    <IconCalendar className="size-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">{season.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(season.startDate)} - {formatDate(season.endDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={season.isActive ? "default" : "secondary"}>
                    {season.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {season.registeredUserCount} registered
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconCalendar className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No seasons yet
            </p>
            <Button variant="outline" size="sm">
              <IconPlus className="size-4 mr-2" />
              Create Season
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
