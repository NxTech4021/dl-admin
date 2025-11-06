'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Season } from '@/constants/zod/season-schema';

interface SeasonMetricsCardProps {
  season: Season;
}

export default function SeasonMetricsCard({ season }: SeasonMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add your metrics here */}
          <div className="text-sm text-muted-foreground">
            Created: {new Date(season.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Last Updated: {new Date(season.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}