import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  IconHistory,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle,
  IconCopy,
  IconExternalLink,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

interface AdminLogEntry {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string | null;
  description: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface LogsResponse {
  success: boolean;
  data: AdminLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const actionTypeColors: Record<string, { bg: string; text: string }> = {
  PLAYER_BAN: { bg: "bg-red-100", text: "text-red-700" },
  PLAYER_UNBAN: { bg: "bg-green-100", text: "text-green-700" },
  PLAYER_DELETE: { bg: "bg-red-100", text: "text-red-700" },
  PLAYER_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  LEAGUE_CREATE: { bg: "bg-green-100", text: "text-green-700" },
  LEAGUE_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  LEAGUE_DELETE: { bg: "bg-red-100", text: "text-red-700" },
  SEASON_CREATE: { bg: "bg-green-100", text: "text-green-700" },
  SEASON_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  SEASON_DELETE: { bg: "bg-red-100", text: "text-red-700" },
  DIVISION_CREATE: { bg: "bg-green-100", text: "text-green-700" },
  DIVISION_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  DIVISION_DELETE: { bg: "bg-red-100", text: "text-red-700" },
  MATCH_VOID: { bg: "bg-red-100", text: "text-red-700" },
  DISPUTE_RESOLVE: { bg: "bg-purple-100", text: "text-purple-700" },
  SETTINGS_UPDATE: { bg: "bg-gray-100", text: "text-gray-700" },
  OTHER: { bg: "bg-gray-100", text: "text-gray-700" },
};

const targetTypeColors: Record<string, { bg: string; text: string }> = {
  PLAYER: { bg: "bg-blue-100", text: "text-blue-700" },
  LEAGUE: { bg: "bg-indigo-100", text: "text-indigo-700" },
  SEASON: { bg: "bg-purple-100", text: "text-purple-700" },
  DIVISION: { bg: "bg-pink-100", text: "text-pink-700" },
  MATCH: { bg: "bg-orange-100", text: "text-orange-700" },
  DISPUTE: { bg: "bg-red-100", text: "text-red-700" },
  SETTINGS: { bg: "bg-gray-100", text: "text-gray-700" },
  OTHER: { bg: "bg-gray-100", text: "text-gray-700" },
};

export const Route = createFileRoute("/_authenticated/admin-logs/")({
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const [logs, setLogs] = React.useState<AdminLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedActionType, setSelectedActionType] = React.useState<string | undefined>();
  const [selectedTargetType, setSelectedTargetType] = React.useState<string | undefined>();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const [selectedLog, setSelectedLog] = React.useState<AdminLogEntry | null>(null);
  const [actionTypes, setActionTypes] = React.useState<FilterOption[]>([]);
  const [targetTypes, setTargetTypes] = React.useState<FilterOption[]>([]);

  React.useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [actionTypesRes, targetTypesRes] = await Promise.all([
          axiosInstance.get(endpoints.admin.logs.getActionTypes),
          axiosInstance.get(endpoints.admin.logs.getTargetTypes),
        ]);
        if (actionTypesRes.data.success) setActionTypes(actionTypesRes.data.data);
        if (targetTypesRes.data.success) setTargetTypes(targetTypesRes.data.data);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", String(pagination.page));
      params.append("limit", String(pagination.limit));
      if (searchQuery) params.append("search", searchQuery);
      if (selectedActionType) params.append("actionType", selectedActionType);
      if (selectedTargetType) params.append("targetType", selectedTargetType);
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await axiosInstance.get<LogsResponse>(
        `${endpoints.admin.logs.getAll}?${params.toString()}`
      );

      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch admin logs";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, selectedActionType, selectedTargetType, dateRange]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedActionType(undefined);
    setSelectedTargetType(undefined);
    setDateRange(undefined);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const formatActionType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportColumns: ExportColumn<AdminLogEntry>[] = [
    { key: "createdAt", header: "Date", formatter: (v) => formatDate(v as string) },
    { key: "admin.name", header: "Admin", formatter: (v) => (v as string) || "System" },
    { key: "actionType", header: "Action", formatter: (v) => formatActionType(v as string) },
    { key: "targetType", header: "Target Type" },
    { key: "targetId", header: "Target ID", formatter: (v) => (v as string) || "-" },
    { key: "description", header: "Description" },
  ];

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconHistory}
            title="Admin Activity Logs"
            description="View and audit all administrative actions performed in the system"
            actions={
              <>
                <Button variant="outline" size="sm" onClick={fetchLogs}>
                  <IconRefresh className="mr-2 size-4" />
                  Refresh
                </Button>
                <ExportButton
                  data={logs}
                  columns={exportColumns}
                  filename="admin-logs"
                  formats={["csv", "excel"]}
                  size="sm"
                />
              </>
            }
          >
            <FilterBar
              onClearAll={handleClearFilters}
              showClearButton={!!(searchQuery || selectedActionType || selectedTargetType || dateRange)}
            >
              <SearchInput
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Search logs..."
                className="flex-1 min-w-[200px] max-w-sm"
              />
              <FilterSelect
                value={selectedActionType}
                onChange={(value) => {
                  setSelectedActionType(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                options={actionTypes}
                allLabel="All Actions"
                triggerClassName="w-[180px]"
              />
              <FilterSelect
                value={selectedTargetType}
                onChange={(value) => {
                  setSelectedTargetType(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                options={targetTypes}
                allLabel="All Targets"
                triggerClassName="w-[150px]"
              />
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Date range"
                className="w-[280px]"
              />
            </FilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Activity Log</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {pagination.total} total entries
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <IconAlertCircle className="size-12 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Failed to Load Logs</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
                    <Button variant="outline" onClick={fetchLogs} className="gap-2">
                      <IconRefresh className="size-4" />
                      Retry
                    </Button>
                  </div>
                ) : logs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const actionColor = actionTypeColors[log.actionType] || { bg: "bg-gray-100", text: "text-gray-700" };
                        const targetColor = targetTypeColors[log.targetType] || { bg: "bg-gray-100", text: "text-gray-700" };

                        return (
                          <TableRow
                            key={log.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedLog(log)}
                          >
                            <TableCell className="text-sm whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-foreground">{formatRelativeTime(log.createdAt)}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {log.admin ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarImage src={log.admin.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(log.admin.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{log.admin.name}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">System</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${actionColor.bg} ${actionColor.text} font-normal`}>
                                {formatActionType(log.actionType)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className={`${targetColor.bg} ${targetColor.text} font-normal w-fit`}>
                                  {log.targetType}
                                </Badge>
                                {log.targetId && (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {log.targetId.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <span className="text-sm truncate block">{log.description}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <IconHistory className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Logs Found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || selectedActionType || selectedTargetType || dateRange
                        ? "Try adjusting your filters."
                        : "No admin activity has been recorded yet."}
                    </p>
                  </div>
                )}

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        <IconChevronLeft className="size-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                        <IconChevronRight className="size-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconHistory className="size-5" />
              Log Entry Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Date & Time
                    </label>
                    <p className="text-sm mt-1">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Admin
                    </label>
                    <p className="text-sm mt-1">{selectedLog.admin?.name || "System"}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-sm mt-1">{selectedLog.description}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
