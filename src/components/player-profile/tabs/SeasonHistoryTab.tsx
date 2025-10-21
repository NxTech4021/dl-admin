import Link from "next/link";
import { IconCalendar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { SeasonHistory } from "../utils/types";

interface SeasonHistoryTabProps {
  seasonHistory: SeasonHistory[] | null;
  historyLoading: boolean;
  onFocus: () => void;
}

export function SeasonHistoryTab({
  seasonHistory,
  historyLoading,
  onFocus,
}: SeasonHistoryTabProps) {
  return (
    <TabsContent value="season_history" onFocus={onFocus}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-5" />
            Season History
          </CardTitle>
          <CardDescription>
            All seasons this player has participated in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ) : seasonHistory && seasonHistory.length > 0 ? (
            <div className="space-y-4">
              {seasonHistory.map((season) => (
                <div
                  key={season.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconCalendar className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-3">
                        <Link
                          href={`/seasons/${season.id}`}
                          className="hover:underline"
                        >
                          {season.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <Link
                          href={`/league/view/${season.category.league.id}`}
                          className="hover:underline"
                        >
                          {season.category.league.name}
                        </Link>{" "}
                        • {season.category.league.sportType}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>
                          Joined{" "}
                          {new Date(
                            season.membership.joinedAt
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          Division:{" "}
                          {season.membership.division?.id ? (
                            <Link
                              href={`/league/divisions/${season.membership.division.id}`}
                              className="hover:underline"
                            >
                              {season.membership.division.name}
                            </Link>
                          ) : (
                            season.membership.division.name
                          )}
                        </span>
                        <span>Status: {season.membership.status}</span>
                      </div>
                      {season.startDate && season.endDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(season.startDate).toLocaleDateString()} -{" "}
                          {new Date(season.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        season.status === "ACTIVE"
                          ? "default"
                          : season.status === "FINISHED"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {season.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <IconCalendar className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No season history yet
              </h3>
              <p className="text-muted-foreground">
                Season participation history will appear here once the player
                joins seasons
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

