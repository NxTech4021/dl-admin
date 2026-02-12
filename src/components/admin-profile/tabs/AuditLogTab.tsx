import * as React from "react";
import { IconFileText, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/logger";
import { formatDate } from "../utils/utils";

interface AuditLogEntry {
  id: string;
  actionType: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditLogTabProps {
  adminId: string;
}

export function AuditLogTab({ adminId }: AuditLogTabProps) {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const fetchLogs = React.useCallback(async () => {
    if (hasLoaded) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/admin/logs", {
        params: { adminId, limit: 50 },
      });
      setLogs(response.data.data?.logs ?? response.data.data ?? []);
      setHasLoaded(true);
    } catch (error) {
      logger.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [adminId, hasLoaded]);

  return (
    <TabsContent value="audit" onFocus={fetchLogs}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="size-5" />
            Audit Log
          </CardTitle>
          <CardDescription>
            Actions performed by this admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasLoaded && !isLoading ? (
            <div className="text-center py-8">
              <button
                onClick={fetchLogs}
                className="text-sm text-primary hover:underline"
              >
                Click to load audit log
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {log.actionType.replace(/_/g, " ")}
                      </Badge>
                      {log.targetType && (
                        <span className="text-xs text-muted-foreground">
                          on {log.targetType.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground">
                        {log.details}
                      </p>
                    )}
                    {log.ipAddress && (
                      <p className="text-xs text-muted-foreground font-mono">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <IconFileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit entries</h3>
              <p className="text-muted-foreground">
                No recorded actions for this admin yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
