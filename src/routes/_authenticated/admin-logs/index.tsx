import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "framer-motion";
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
  IconPlus,
  IconPencil,
  IconTrash,
  IconBan,
  IconUserCheck,
  IconGavel,
  IconSettings,
  IconUser,
  IconTrophy,
  IconCalendar,
  IconCategory,
  IconSwords,
  IconScale,
  IconClock,
  IconBug,
  IconShield,
  IconDotsVertical,
  IconEye,
} from "@tabler/icons-react";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker, ExportButton, type ExportColumn, type DateRange } from "@/components/shared";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { AnimatedFilterBar, AnimatedEmptyState, AnimatedContainer } from "@/components/ui/animated-container";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";

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

// Get action type badge styling with dark mode support
const getActionTypeBadgeClass = (actionType: string): string => {
  // CREATE actions -> emerald (green)
  if (actionType.includes("CREATE") || actionType.includes("UNBAN")) {
    return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  }
  // UPDATE actions -> blue
  if (actionType.includes("UPDATE")) {
    return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
  }
  // DELETE/BAN/VOID actions -> red
  if (actionType.includes("DELETE") || actionType.includes("BAN") || actionType.includes("VOID")) {
    return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
  }
  // RESOLVE actions -> purple
  if (actionType.includes("RESOLVE")) {
    return "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800";
  }
  // Default/SETTINGS/OTHER -> slate
  return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
};

// Get target type badge styling with dark mode support
const getTargetTypeBadgeClass = (targetType: string): string => {
  switch (targetType) {
    case "PLAYER":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "LEAGUE":
      return "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800";
    case "SEASON":
      return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
    case "DIVISION":
      return "text-pink-700 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800";
    case "MATCH":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "DISPUTE":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    case "BUG_REPORT":
      return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800";
    case "ADMIN":
      return "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

// Get icon for action type
const getActionTypeIcon = (actionType: string): React.ReactNode => {
  if (actionType.includes("CREATE")) return <IconPlus className="size-3" />;
  if (actionType.includes("UPDATE")) return <IconPencil className="size-3" />;
  if (actionType.includes("DELETE")) return <IconTrash className="size-3" />;
  if (actionType.includes("BAN")) return <IconBan className="size-3" />;
  if (actionType.includes("UNBAN")) return <IconUserCheck className="size-3" />;
  if (actionType.includes("VOID")) return <IconTrash className="size-3" />;
  if (actionType.includes("RESOLVE")) return <IconGavel className="size-3" />;
  if (actionType.includes("SETTINGS")) return <IconSettings className="size-3" />;
  return null;
};

// Get icon for target type
const getTargetTypeIcon = (targetType: string): React.ReactNode => {
  switch (targetType) {
    case "PLAYER": return <IconUser className="size-3" />;
    case "LEAGUE": return <IconTrophy className="size-3" />;
    case "SEASON": return <IconCalendar className="size-3" />;
    case "DIVISION": return <IconCategory className="size-3" />;
    case "MATCH": return <IconSwords className="size-3" />;
    case "DISPUTE": return <IconScale className="size-3" />;
    case "SETTINGS": return <IconSettings className="size-3" />;
    case "BUG_REPORT": return <IconBug className="size-3" />;
    case "ADMIN": return <IconShield className="size-3" />;
    default: return null;
  }
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
        logger.error("Failed to fetch filter options:", err);
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
            <AnimatedFilterBar>
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
            </AnimatedFilterBar>
          </PageHeader>

          <div className="flex-1 px-4 lg:px-6 pb-6 space-y-4">
            {/* Table content */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-md border bg-muted/10">
                <IconAlertCircle className="size-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Logs</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
                <Button variant="outline" onClick={fetchLogs} className="gap-2">
                  <IconRefresh className="size-4" />
                  Retry
                </Button>
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-3">
                {/* Header with total count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{pagination.total.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">total entries</span>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-14 py-2.5 pl-4 font-medium text-xs">#</TableHead>
                        <TableHead className="w-44 py-2.5 font-medium text-xs">Date</TableHead>
                        <TableHead className="w-56 py-2.5 font-medium text-xs">Admin</TableHead>
                        <TableHead className="w-40 py-2.5 font-medium text-xs">Action</TableHead>
                        <TableHead className="w-36 py-2.5 font-medium text-xs">Target</TableHead>
                        <TableHead className="py-2.5 font-medium text-xs">Description</TableHead>
                        <TableHead className="w-16 py-2.5 pr-4 font-medium text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <motion.tbody
                      key={`${searchQuery}-${selectedActionType || ''}-${selectedTargetType || ''}-${pagination.page}`}
                      initial="hidden"
                      animate="visible"
                      variants={tableContainerVariants}
                    >
                      {logs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          variants={tableRowVariants}
                          transition={fastTransition}
                          className="cursor-pointer hover:bg-muted/30 border-b transition-colors"
                          onClick={() => setSelectedLog(log)}
                        >
                          {/* Row Number */}
                          <TableCell className="py-3 pl-4 text-sm text-muted-foreground font-mono">
                            {((pagination.page - 1) * pagination.limit) + index + 1}
                          </TableCell>

                          {/* Date */}
                          <TableCell className="py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <IconClock className="size-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {formatRelativeTime(log.createdAt)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground ml-5">
                                {formatDate(log.createdAt)}
                              </span>
                            </div>
                          </TableCell>

                          {/* Admin */}
                          <TableCell className="py-3">
                            {log.admin ? (
                              <div className="flex items-center gap-2.5">
                                <Avatar className="size-7 border border-border">
                                  <AvatarImage src={log.admin.image || undefined} />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {getInitials(log.admin.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium leading-tight">
                                    {log.admin.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground leading-tight truncate max-w-[160px]">
                                    {log.admin.email}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="size-7 rounded-full bg-muted flex items-center justify-center">
                                  <IconSettings className="size-3.5" />
                                </div>
                                <span className="text-sm">System</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Action */}
                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium border gap-1",
                                getActionTypeBadgeClass(log.actionType)
                              )}
                            >
                              {getActionTypeIcon(log.actionType)}
                              {formatActionType(log.actionType)}
                            </Badge>
                          </TableCell>

                          {/* Target */}
                          <TableCell className="py-3">
                            <div className="flex flex-col gap-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium border w-fit gap-1",
                                  getTargetTypeBadgeClass(log.targetType)
                                )}
                              >
                                {getTargetTypeIcon(log.targetType)}
                                {log.targetType}
                              </Badge>
                              {log.targetId && (
                                <code className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
                                  {log.targetId.slice(0, 8)}...
                                </code>
                              )}
                            </div>
                          </TableCell>

                          {/* Description */}
                          <TableCell className="py-3">
                            <p className="text-sm text-foreground line-clamp-2" title={log.description}>
                              {log.description}
                            </p>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3 pr-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDotsVertical className="size-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLog(log);
                                  }}
                                >
                                  <IconEye className="size-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {log.targetId && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(log.targetId!);
                                    }}
                                  >
                                    <IconCopy className="size-4 mr-2" />
                                    Copy Target ID
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </Table>
                </div>
              </div>
            ) : (
              <AnimatedEmptyState>
                <div className="text-center py-16 rounded-md border bg-muted/10">
                  <IconHistory className="size-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Logs Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || selectedActionType || selectedTargetType || dateRange
                      ? "Try adjusting your filters."
                      : "No admin activity has been recorded yet."}
                  </p>
                </div>
              </AnimatedEmptyState>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
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
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setPagination((prev) => ({ ...prev, page: pageNum }));
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
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
          </div>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <IconHistory className="size-5" />
              Log Entry Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 py-4 pr-4">
                {/* Header with Action and Target Badges */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm font-medium border gap-1.5",
                        getActionTypeBadgeClass(selectedLog.actionType)
                      )}
                    >
                      {getActionTypeIcon(selectedLog.actionType)}
                      {formatActionType(selectedLog.actionType)}
                    </Badge>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <IconClock className="size-3.5" />
                      {formatDate(selectedLog.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border gap-1",
                      getTargetTypeBadgeClass(selectedLog.targetType)
                    )}
                  >
                    {getTargetTypeIcon(selectedLog.targetType)}
                    {selectedLog.targetType}
                  </Badge>
                </div>

                <Separator />

                {/* Admin Info */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Performed By
                  </label>
                  {selectedLog.admin ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                      <Avatar className="size-10 border">
                        <AvatarImage src={selectedLog.admin.image || undefined} />
                        <AvatarFallback className="bg-muted">
                          {getInitials(selectedLog.admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedLog.admin.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedLog.admin.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <IconSettings className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">System</p>
                        <p className="text-sm text-muted-foreground">Automated action</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-sm p-3 rounded-lg bg-muted/30 border">{selectedLog.description}</p>
                </div>

                {/* Target ID */}
                {selectedLog.targetId && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Target ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono p-2.5 rounded-lg bg-muted border flex-1 break-all">
                        {selectedLog.targetId}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => copyToClipboard(selectedLog.targetId!)}
                      >
                        <IconCopy className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Old/New Values Diff */}
                {(selectedLog.oldValue || selectedLog.newValue) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Changes
                      </label>
                      <div className={cn(
                        "grid gap-4",
                        selectedLog.oldValue && selectedLog.newValue ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                      )}>
                        {selectedLog.oldValue && (
                          <div className="space-y-2 min-w-0">
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">Previous Value</p>
                            <pre className="text-xs p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 overflow-x-auto overflow-y-auto max-h-60 whitespace-pre-wrap break-words">
                              {JSON.stringify(selectedLog.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedLog.newValue && (
                          <div className="space-y-2 min-w-0">
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">New Value</p>
                            <pre className="text-xs p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 overflow-x-auto overflow-y-auto max-h-60 whitespace-pre-wrap break-words">
                              {JSON.stringify(selectedLog.newValue, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Additional Metadata
                      </label>
                      <pre className="text-xs p-3 rounded-lg bg-muted border overflow-auto max-h-40">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
