import { IconShield, IconClock } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { PlayerProfileData } from "../types";
import { formatDate } from "../utils";

interface ActivityTabProps {
  profile: PlayerProfileData;
}

export function ActivityTab({ profile }: ActivityTabProps) {
  return (
    <TabsContent value="activity">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Login Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="size-5 text-blue-600" />
              Login Methods
            </CardTitle>
            <CardDescription>
              Authentication providers linked to this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.accounts && profile.accounts.length > 0 ? (
              <div className="space-y-3">
                {profile.accounts.map((acc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <IconShield className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {acc.providerId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Linked on {formatDate(acc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconShield className="size-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No login methods found
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="size-5 text-green-600" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Current active sessions across devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.sessions && profile.sessions.length > 0 ? (
              <div className="space-y-3">
                {profile.sessions.map((sess, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-sm font-medium">
                          Active Session
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(sess.expiresAt)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Device:</span>
                        <span className="truncate">
                          {sess.userAgent || "Unknown device"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">IP:</span>
                        <span className="font-mono text-xs">
                          {sess.ipAddress || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconClock className="size-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No active sessions found
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

