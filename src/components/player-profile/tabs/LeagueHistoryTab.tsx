import { Link } from "@tanstack/react-router";
import { IconTrophy } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { LeagueHistory } from "../utils/types";

interface LeagueHistoryTabProps {
  leagueHistory: LeagueHistory[] | null;
  historyLoading: boolean;
  onFocus: () => void;
}

export function LeagueHistoryTab({
  leagueHistory,
  historyLoading,
  onFocus,
}: LeagueHistoryTabProps) {
  return (
    <TabsContent value="league_history" onFocus={onFocus}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            League History
          </CardTitle>
          <CardDescription>
            All leagues this player has participated in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ) : leagueHistory && leagueHistory.length > 0 ? (
            <div className="space-y-4">
              {leagueHistory.map((league) => (
                <div
                  key={league.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconTrophy className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-3">
                        <Link
                          to="/league/view/$leagueId"
                          params={{ leagueId: league.id }}
                          className="hover:underline"
                        >
                          {league.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {league.sportType} • {league.location || "No location"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>
                          Joined{" "}
                          {league.membership
                            ? new Date(league.membership.joinedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span>{league._count.seasons} seasons</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        league.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {league.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <IconTrophy className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No league history yet
              </h3>
              <p className="text-muted-foreground">
                League participation history will appear here once the player
                joins leagues
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

