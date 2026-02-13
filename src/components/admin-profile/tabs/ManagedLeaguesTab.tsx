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
import type { AdminDetail } from "../utils/types";
import { formatShortDate } from "../utils/utils";

interface ManagedLeaguesTabProps {
  profile: AdminDetail;
}

export function ManagedLeaguesTab({ profile }: ManagedLeaguesTabProps) {
  const leagues = profile.leagues;

  return (
    <TabsContent value="leagues">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            Managed Leagues
          </CardTitle>
          <CardDescription>
            Leagues this admin is assigned to manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leagues.length > 0 ? (
            <div className="space-y-4">
              {leagues.map((league) => (
                <div
                  key={league.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconTrophy className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        <Link
                          to="/league/view/$leagueId"
                          params={{ leagueId: league.id }}
                          className="hover:underline"
                        >
                          {league.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {league.sportType}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {formatShortDate(league.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      league.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {league.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <IconTrophy className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leagues managed</h3>
              <p className="text-muted-foreground">
                This admin has not been assigned to manage any leagues yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
