"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  IconHistory,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconFilter,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

// Types for admin logs
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

// Action type badge colors
const actionTypeColors: Record<string, { bg: string; text: string }> = {
  PLAYER_BAN: { bg: "bg-red-100", text: "text-red-700" },
  PLAYER_UNBAN: { bg: "bg-green-100", text: "text-green-700" },
  PLAYER_DELETE: { bg: "bg-red-100", text: "text-red-700" },
  PLAYER_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  PLAYER_STATUS_CHANGE: { bg: "bg-yellow-100", text: "text-yellow-700" },
  LEAGUE_CREATE: { bg: "bg-green-100", text: "text-green-700" },
  LEAGUE_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  LEAGUE_DELETE: { bg: "bg-red-100", text: "text-red-700" },
  SEASON_CREATE: { bg: "bg-green-100", text: "text-green-700" },
  SEASON_UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  MATCH_VOID: { bg: "bg-red-100", text: "text-red-700" },
  MATCH_EDIT_RESULT: { bg: "bg-orange-100", text: "text-orange-700" },
  DISPUTE_RESOLVE: { bg: "bg-purple-100", text: "text-purple-700" },
  SETTINGS_UPDATE: { bg: "bg-gray-100", text: "text-gray-700" },
};

// Target type badge colors
const targetTypeColors: Record<string, { bg: string; text: string }> = {
  PLAYER: { bg: "bg-blue-100", text: "text-blue-700" },
  LEAGUE: { bg: "bg-indigo-100", text: "text-indigo-700" },
  SEASON: { bg: "bg-purple-100", text: "text-purple-700" },
  DIVISION: { bg: "bg-pink-100", text: "text-pink-700" },
  MATCH: { bg: "bg-orange-100", text: "text-orange-700" },
  DISPUTE: { bg: "bg-red-100", text: "text-red-700" },
  SETTINGS: { bg: "bg-gray-100", text: "text-gray-700" },
  ADMIN: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

export default function AdminLogsPage() {
  const [logs, setLogs] = React.useState<AdminLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedActionType, setSelectedActionType] = React.useState<string | undefined>();
  const [selectedTargetType, setSelectedTargetType] = React.useState<string | undefined>();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Available filter options
  const [actionTypes, setActionTypes] = React.useState<{ value: string; label: string }[]>([]);
  const [targetTypes, setTargetTypes] = React.useState<{ value: string; label: string }[]>([]);

  // Fetch filter options on mount
  React.useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [actionTypesRes, targetTypesRes] = await Promise.all([
          axiosInstance.get(endpoints.admin.logs.getActionTypes),
          axiosInstance.get(endpoints.admin.logs.getTargetTypes),
        ]);
        if (actionTypesRes.data.success) {
          setActionTypes(actionTypesRes.data.data);
        }
        if (targetTypesRes.data.success) {
          setTargetTypes(targetTypesRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch logs
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
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const formatActionType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Export columns configuration
  const exportColumns: ExportColumn<AdminLogEntry>[] = [
    { key: "createdAt", header: "Date", formatter: (v) => formatDate(v as string) },
    { key: "admin.name", header: "Admin", formatter: (v) => (v as string) || "System" },
    { key: "actionType", header: "Action", formatter: (v) => formatActionType(v as string) },
    { key: "targetType", header: "Target Type" },
    { key: "targetId", header: "Target ID", formatter: (v) => (v as string) || "-" },
    { key: "description", header: "Description" },
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Title and Actions */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconHistory className="size-8 text-primary" />
                          <h1 className="text-3xl font-bold tracking-tight">
                            Admin Activity Logs
                          </h1>
                        </div>
                        <p className="text-muted-foreground">
                          View and audit all administrative actions performed in the system
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Search logs..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className="pl-9"
                        />
                      </div>

                      <Select
                        value={selectedActionType}
                        onValueChange={(val) => {
                          setSelectedActionType(val === "all" ? undefined : val);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Action Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          {actionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedTargetType}
                        onValueChange={(val) => {
                          setSelectedTargetType(val === "all" ? undefined : val);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Target Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Targets</SelectItem>
                          {targetTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <DateRangePicker
                        value={dateRange}
                        onChange={(range) => {
                          setDateRange(range);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        placeholder="Date range"
                        className="w-[280px]"
                      />

                      {(searchQuery || selectedActionType || selectedTargetType || dateRange) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-muted-foreground"
                        >
                          <IconFilter className="mr-2 size-4" />
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
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
                              <TableRow key={log.id}>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                  {formatDate(log.createdAt)}
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
                            ? "Try adjusting your filters to see more results."
                            : "No admin activity has been recorded yet."}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                          >
                            <IconChevronLeft className="size-4 mr-1" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(5, pagination.totalPages) },
                              (_, i) => {
                                let pageNum: number;
                                if (pagination.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                  pageNum = i + 1;
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                  pageNum = pagination.totalPages - 4 + i;
                                } else {
                                  pageNum = pagination.page - 2 + i;
                                }
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={pagination.page === pageNum ? "default" : "outline"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
