import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/endpoints";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconAlertTriangle,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconCheck,
  IconX,
  IconDeviceMobile,
  IconBrandApple,
  IconBrandAndroid,
} from "@tabler/icons-react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { formatTableDate } from "@/components/data-table/constants";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";

// Types
interface CrashReport {
  id: string;
  userId: string | null;
  type: string;
  errorMessage: string;
  stackTrace: string | null;
  componentStack: string | null;
  screenName: string | null;
  platform: string;
  osVersion: string | null;
  appVersion: string | null;
  deviceModel: string | null;
  buildType: string | null;
  severity: string;
  resolved: boolean;
  resolvedAt: string | null;
  notes: string | null;
  occurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface CrashStats {
  total: number;
  open: number;
  sessionLost: number;
  last24h: number;
  byType: { type: string; count: number }[];
  byScreen: { screen: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

// Severity badge
function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    CRITICAL: "destructive",
    HIGH: "destructive",
    MEDIUM: "default",
    LOW: "secondary",
  };
  return <Badge variant={variants[severity] || "secondary"}>{severity}</Badge>;
}

// Type badge
function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    JS_ERROR: "JS Error",
    RENDER_ERROR: "Render Error",
    UNHANDLED_REJECTION: "Unhandled",
    SESSION_LOST: "Session Lost",
  };
  const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    JS_ERROR: "destructive",
    RENDER_ERROR: "destructive",
    UNHANDLED_REJECTION: "default",
    SESSION_LOST: "outline",
  };
  return (
    <Badge variant={variants[type] || "secondary"}>
      {labels[type] || type}
    </Badge>
  );
}

// Platform icon
function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "ios") return <IconBrandApple className="size-4 text-muted-foreground" />;
  if (platform === "android") return <IconBrandAndroid className="size-4 text-muted-foreground" />;
  return <IconDeviceMobile className="size-4 text-muted-foreground" />;
}

// Time ago helper
function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CrashReportsDashboard() {
  // State
  const [reports, setReports] = useState<CrashReport[]>([]);
  const [stats, setStats] = useState<CrashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [resolvedFilter, setResolvedFilter] = useState("false");

  // Detail view
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "15");
      if (search) params.append("search", search);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (resolvedFilter !== "all") params.append("resolved", resolvedFilter);

      const response = await apiClient.get(
        `${endpoints.admin.crashReports.getAll}?${params.toString()}`
      );
      const data = response.data;
      setReports(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to fetch crash reports");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, severityFilter, resolvedFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get(endpoints.admin.crashReports.getStats);
      setStats(response.data?.data || response.data);
    } catch {
      // Stats are optional — don't block the page
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await apiClient.patch(endpoints.admin.crashReports.update(id), {
        resolved: true,
      });
      fetchReports();
      fetchStats();
    } catch (err: any) {
      console.error("Failed to resolve:", err);
    } finally {
      setResolving(null);
    }
  };

  const handleUnresolve = async (id: string) => {
    setResolving(id);
    try {
      await apiClient.patch(endpoints.admin.crashReports.update(id), {
        resolved: false,
      });
      fetchReports();
      fetchStats();
    } catch (err: any) {
      console.error("Failed to unresolve:", err);
    } finally {
      setResolving(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSeverityFilter("all");
    setResolvedFilter("false");
    setPage(1);
  };

  const hasFilters =
    search || typeFilter !== "all" || severityFilter !== "all" || resolvedFilter !== "false";

  const limit = 15;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <PageHeader
        icon={AlertTriangle}
        title="Crash Reports"
        description="Monitor and resolve application crashes from mobile users"
        actions={
          <Button variant="outline" size="sm" onClick={() => { fetchReports(); fetchStats(); }}>
            <IconRefresh className="mr-2 size-4" />
            Refresh
          </Button>
        }
      >
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-red-500" />
                  <span className="text-sm text-muted-foreground">Open</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.open}</p>
                <p className="text-xs text-muted-foreground">Unresolved crashes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="size-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Session Lost</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.sessionLost}</p>
                <p className="text-xs text-muted-foreground">Auto-logouts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Resolved</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.total - stats.open}</p>
                <p className="text-xs text-muted-foreground">Fixed crashes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Last 24h</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.last24h}</p>
                <p className="text-xs text-muted-foreground">Recent crashes</p>
              </CardContent>
            </Card>
          </div>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full md:w-64">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search errors..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="JS_ERROR">JS Error</SelectItem>
            <SelectItem value="RENDER_ERROR">Render Error</SelectItem>
            <SelectItem value="UNHANDLED_REJECTION">Unhandled Rejection</SelectItem>
            <SelectItem value="SESSION_LOST">Session Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={(v) => { setResolvedFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="false">Open</SelectItem>
            <SelectItem value="true">Resolved</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <IconX className="mr-1 size-3" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <IconAlertTriangle className="size-12 text-destructive mb-4" />
              <h3 className="font-semibold text-lg">Failed to load crash reports</h3>
              <p className="text-muted-foreground text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchReports}>
                <IconRefresh className="mr-2 size-4" /> Retry
              </Button>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">No Crash Reports</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {hasFilters ? "No crashes match your filters." : "No crashes recorded yet."}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead className="w-[160px]">User</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="min-w-[200px]">Error</TableHead>
                    <TableHead className="w-[120px]">Screen</TableHead>
                    <TableHead className="w-[90px]">Severity</TableHead>
                    <TableHead className="w-[30px]"></TableHead>
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead className="w-[80px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  initial="hidden"
                  animate="visible"
                  variants={tableContainerVariants}
                >
                  {reports.map((report, idx) => (
                    <motion.tr
                      key={report.id}
                      variants={tableRowVariants}
                      transition={fastTransition}
                      className="border-b cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedId(expandedId === report.id ? null : report.id)
                      }
                    >
                      <TableCell className="text-xs text-muted-foreground text-center font-mono">
                        {startItem + idx}
                      </TableCell>
                      <TableCell>
                        {report.user ? (
                          <div>
                            <p className="text-sm font-medium truncate max-w-[140px]">
                              {report.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {report.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Anonymous
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={report.type} />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[250px]">
                          {report.errorMessage}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {report.screenName || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={report.severity} />
                      </TableCell>
                      <TableCell>
                        <PlatformIcon platform={report.platform} />
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <span>{timeAgo(report.lastSeenAt)}</span>
                          {report.occurrenceCount > 1 && (
                            <span className="ml-1 text-orange-500 font-medium">
                              ({"\u00D7"}{report.occurrenceCount})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {report.resolved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleUnresolve(report.id); }}
                            disabled={resolving === report.id}
                            title="Unresolve"
                          >
                            <IconCheck className="size-4 text-green-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleResolve(report.id); }}
                            disabled={resolving === report.id}
                            title="Mark as Resolved"
                          >
                            <IconX className="size-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </Table>

              {/* Expanded Detail */}
              {expandedId && (() => {
                const report = reports.find((r) => r.id === expandedId);
                if (!report) return null;
                return (
                  <div className="border-t bg-muted/30 p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID:</span>{" "}
                        <span className="font-mono text-xs">{report.id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Platform:</span>{" "}
                        {report.platform} {report.osVersion}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Device:</span>{" "}
                        {report.deviceModel || "Unknown"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">App Version:</span>{" "}
                        {report.appVersion || "Unknown"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Build:</span>{" "}
                        {report.buildType || "standalone"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">First Seen:</span>{" "}
                        {formatTableDate(report.firstSeenAt)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Seen:</span>{" "}
                        {formatTableDate(report.lastSeenAt)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Occurrences:</span>{" "}
                        <span className="font-bold">{report.occurrenceCount}</span>
                      </div>
                    </div>

                    {report.stackTrace && (
                      <div>
                        <p className="text-sm font-medium mb-1">Stack Trace</p>
                        <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {report.stackTrace}
                        </pre>
                      </div>
                    )}

                    {report.componentStack && (
                      <div>
                        <p className="text-sm font-medium mb-1">Component Stack</p>
                        <pre className="bg-background border rounded-md p-3 text-xs overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {report.componentStack}
                        </pre>
                      </div>
                    )}

                    {report.notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Admin Notes</p>
                        <p className="text-sm bg-background border rounded-md p-3">{report.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {startItem}-{endItem} of {total} reports
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
