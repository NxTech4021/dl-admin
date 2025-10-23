import { IconTarget } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { PlayerProfileData } from "../utils/types";
import { formatDate } from "../utils/utils";

interface MatchesTabProps {
  profile: PlayerProfileData;
}

export function MatchesTab({ profile }: MatchesTabProps) {
  return (
    <TabsContent value="matches">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTarget className="size-5" />
            Match History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.matches && profile.matches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="capitalize font-medium">
                      {match.sport}
                    </TableCell>
                    <TableCell className="capitalize">
                      {match.matchType}
                    </TableCell>
                    <TableCell className="font-mono">
                      {match.playerScore} - {match.opponentScore}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          match.outcome === "win"
                            ? "default"
                            : match.outcome === "loss"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {match.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(match.matchDate)}</TableCell>
                    <TableCell>{match.location || "N/A"}</TableCell>
                    <TableCell>
                      {match.duration ? `${match.duration} min` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No match history found for this player.
            </p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

