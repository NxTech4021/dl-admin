import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Eye,
  Trash2,
  RefreshCw,
  FileQuestion,
  Loader2,
  MessageSquare,
  Send,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { StatsGrid } from "@/components/ui/stats-grid";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar } from "@/components/ui/filter-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { IconBug, IconClock, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedStatsGrid, AnimatedStatsCard, AnimatedContainer } from "@/components/ui/animated-container";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
// import Image from "next/image";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

const PAGE_SIZE = 20;

const DEFAULT_STATS: Stats = {
  total: 0,
  byStatus: {},
  bySeverity: {},
  byPriority: {},
  recentlyCreated: 0,
  avgResolutionTimeMinutes: 0,
};

interface Screenshot {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
}

interface BugReport {
  id: string;
  reportNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  reportType: string;
  createdAt: string;
  app: { code: string; displayName: string };
  module: { name: string };
  reporter: { id: string; name: string; email: string } | null;
  anonymousName?: string | null;
  anonymousEmail?: string | null;
  assignedTo?: { id: string; user: { name: string } };
  _count: { comments: number; screenshots: number };
}

interface BugComment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: string; name: string; image?: string };
}

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface BugReportDetail extends BugReport {
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  pageUrl?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  screenWidth?: number;
  screenHeight?: number;
  screenshots?: Screenshot[];
  comments?: BugComment[];
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byPriority: Record<string, number>;
  recentlyCreated: number;
  avgResolutionTimeMinutes: number;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  TRIAGED: "bg-purple-100 text-purple-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  NEEDS_INFO: "bg-orange-100 text-orange-800",
  IN_REVIEW: "bg-indigo-100 text-indigo-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  WONT_FIX: "bg-red-100 text-red-800",
  DUPLICATE: "bg-gray-100 text-gray-600",
};

const severityColors: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  NORMAL: "bg-blue-100 text-blue-800",
  LOW: "bg-gray-100 text-gray-800",
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "TRIAGED", label: "Triaged" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "NEEDS_INFO", label: "Needs Info" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const SEVERITY_OPTIONS = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

export default function BugDashboard() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReportDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status change loading
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Comments
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Admins for assignee dropdown
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [assigneeLoading, setAssigneeLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/getadmins`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.data?.getAllAdmins || []);
      }
    } catch (error) {
      logger.error("Failed to fetch admins:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/stats`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          ...DEFAULT_STATS,
          ...data,
          byStatus: { ...data.byStatus },
          bySeverity: { ...data.bySeverity },
          byPriority: { ...data.byPriority },
        });
      } else {
        logger.error("Failed to fetch stats:", res.status);
        setStats(DEFAULT_STATS);
      }
    } catch (error) {
      logger.error("Failed to fetch stats:", error);
      setStats(DEFAULT_STATS);
    }
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        sortBy,
        sortOrder,
      });

      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (severityFilter && severityFilter !== "all") params.append("severity", severityFilter);
      if (priorityFilter && priorityFilter !== "all") params.append("priority", priorityFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${API_URL}/api/bug/admin/reports?${params}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setReports(data.data ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotalCount(data.pagination?.total ?? 0);
      } else {
        logger.error("Failed to fetch reports:", res.status);
        toast.error("Failed to load bug reports");
        setReports([]);
      }
    } catch (error) {
      logger.error("Failed to fetch reports:", error);
      toast.error("Failed to load bug reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter, priorityFilter, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
    fetchReports();
    fetchAdmins();
  }, [fetchReports]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setStatusLoading(reportId);
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Status updated");
        fetchReports();
        fetchStats();
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(null);
    }
  };

  const confirmDelete = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${reportToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Bug report deleted");
        fetchReports();
        fetchStats();
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.message || "Failed to delete bug report");
      }
    } catch (error) {
      toast.error("Failed to delete bug report");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const openDetail = async (report: BugReport) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setSelectedReport(null);

    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${report.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
      } else {
        toast.error("Failed to load report details");
        setDetailOpen(false);
      }
    } catch (error) {
      toast.error("Failed to load report details");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, report: BugReport) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail(report);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaginationText = () => {
    if (totalCount === 0) return "";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, totalCount);
    return `Showing ${start}-${end} of ${totalCount} reports`;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const handleAssigneeChange = async (reportId: string, adminId: string | null) => {
    setAssigneeLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ assignedToId: adminId || null }),
      });

      if (res.ok) {
        toast.success("Assignee updated");
        // Update local state
        if (selectedReport) {
          const admin = admins.find(a => a.id === adminId);
          setSelectedReport({
            ...selectedReport,
            assignedTo: admin ? { id: adminId!, user: { name: admin.name } } : undefined,
          });
        }
        fetchReports();
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.message || "Failed to update assignee");
      }
    } catch (error) {
      toast.error("Failed to update assignee");
    } finally {
      setAssigneeLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${selectedReport.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment, isInternal: false }),
      });

      if (res.ok) {
        const comment = await res.json();
        toast.success("Comment added");
        setNewComment("");
        // Add comment to local state
        setSelectedReport({
          ...selectedReport,
          comments: [...(selectedReport.comments || []), comment],
        });
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={IconBug}
        title="Bug Reports"
        description="Manage and track bug reports across all apps"
        actions={
          <Button onClick={() => { fetchReports(); fetchStats(); }} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      >
        {/* Stats Cards */}
        <AnimatedStatsGrid className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <AnimatedStatsCard>
            <StatsCard
              title="Total Reports"
              value={stats.total}
              description={`${stats.recentlyCreated} this week`}
              icon={IconBug}
              loading={loading}
            />
          </AnimatedStatsCard>
          <AnimatedStatsCard>
            <StatsCard
              title="Open"
              value={(stats.byStatus?.NEW || 0) + (stats.byStatus?.TRIAGED || 0) + (stats.byStatus?.IN_PROGRESS || 0)}
              description="Needs attention"
              icon={IconClock}
              iconColor="text-yellow-500"
              loading={loading}
            />
          </AnimatedStatsCard>
          <AnimatedStatsCard>
            <StatsCard
              title="Critical"
              value={stats.bySeverity?.CRITICAL || 0}
              description="High priority issues"
              icon={IconAlertTriangle}
              iconColor="text-red-500"
              loading={loading}
            />
          </AnimatedStatsCard>
          <AnimatedStatsCard>
            <StatsCard
              title="Resolved"
              value={(stats.byStatus?.RESOLVED || 0) + (stats.byStatus?.CLOSED || 0)}
              description={`Avg ${Math.round(stats.avgResolutionTimeMinutes / 60)}h to resolve`}
              icon={IconCircleCheck}
              iconColor="text-green-500"
              loading={loading}
            />
          </AnimatedStatsCard>
        </AnimatedStatsGrid>
      </PageHeader>

      {/* Filters */}
      <div className="px-4 lg:px-6 space-y-6">
      <AnimatedContainer>
        <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch}>
            <FilterBar
              onClearAll={() => {
                setSearch("");
                setStatusFilter("all");
                setSeverityFilter("all");
                setPriorityFilter("all");
                setPage(1);
              }}
              showClearButton={!!(search || statusFilter !== "all" || severityFilter !== "all" || priorityFilter !== "all")}
            >
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by title, description, or report number..."
                className="flex-1 min-w-[250px]"
              />

              <FilterSelect
                value={statusFilter === "all" ? undefined : statusFilter}
                onChange={(value) => { setStatusFilter(value || "all"); setPage(1); }}
                options={STATUS_OPTIONS}
                allLabel="All Status"
                triggerClassName="w-[140px]"
              />

              <FilterSelect
                value={severityFilter === "all" ? undefined : severityFilter}
                onChange={(value) => { setSeverityFilter(value || "all"); setPage(1); }}
                options={SEVERITY_OPTIONS}
                allLabel="All Severity"
                triggerClassName="w-[140px]"
              />

              <FilterSelect
                value={priorityFilter === "all" ? undefined : priorityFilter}
                onChange={(value) => { setPriorityFilter(value || "all"); setPage(1); }}
                options={PRIORITY_OPTIONS}
                allLabel="All Priority"
                triggerClassName="w-[140px]"
              />

              <Button type="submit" size="default">
                Search
              </Button>
            </FilterBar>
          </form>
        </CardContent>
      </Card>
      </AnimatedContainer>

      {/* Reports Table */}
      <AnimatedContainer delay={0.1}>
        <Card>
        <CardContent className="p-0">
          {/* Table Header with count */}
          {!loading && totalCount > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-medium text-muted-foreground">
                {getPaginationText()}
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="pl-4 cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("reportNumber")}
                  >
                    <div className="flex items-center">
                      Report #
                      <SortIcon field="reportNumber" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Title
                      <SortIcon field="title" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("severity")}
                  >
                    <div className="flex items-center">
                      Severity
                      <SortIcon field="severity" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center">
                      Priority
                      <SortIcon field="priority" />
                    </div>
                  </TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Created
                      <SortIcon field="createdAt" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={tableContainerVariants}
            >
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground">Loading bug reports...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-muted p-4">
                        <FileQuestion className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">No bug reports found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {search || statusFilter !== "all" || severityFilter !== "all" || priorityFilter !== "all"
                            ? "Try adjusting your filters or search terms"
                            : "Bug reports will appear here when users submit them"}
                        </p>
                      </div>
                      {(search || statusFilter !== "all" || severityFilter !== "all" || priorityFilter !== "all") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                            setSeverityFilter("all");
                            setPriorityFilter("all");
                            setPage(1);
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <motion.tr
                    key={report.id}
                    variants={tableRowVariants}
                    transition={fastTransition}
                    className="cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none border-b transition-colors"
                    onClick={() => openDetail(report)}
                    onKeyDown={(e) => handleRowKeyDown(e, report)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View bug report ${report.reportNumber}: ${report.title}`}
                  >
                    <TableCell className="font-mono text-sm font-medium pl-4">
                      {report.reportNumber}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="font-medium truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.module.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[report.status]}>
                        {report.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={severityColors[report.severity]}>
                        {report.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[report.priority]}>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{report.reporter?.name || report.anonymousName || "User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.reporter?.email || report.anonymousEmail || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={statusLoading === report.id}>
                            {statusLoading === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(report.id, "IN_PROGRESS")}
                            disabled={report.status === "IN_PROGRESS"}
                          >
                            Start Working
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(report.id, "RESOLVED")}
                            disabled={report.status === "RESOLVED"}
                          >
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmDelete(report.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      </AnimatedContainer>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading report details...</p>
            </div>
          ) : selectedReport ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">{selectedReport.reportNumber}</span>
                  <Badge className={statusColors[selectedReport.status]}>
                    {selectedReport.status.replace("_", " ")}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedReport.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.module.name} | Reported by {selectedReport.reporter?.name || selectedReport.anonymousName || "User"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Badge className={severityColors[selectedReport.severity]}>
                    {selectedReport.severity}
                  </Badge>
                  <Badge className={priorityColors[selectedReport.priority]}>
                    {selectedReport.priority}
                  </Badge>
                  <Badge variant="outline">{selectedReport.reportType}</Badge>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.stepsToReproduce && (
                  <div>
                    <Label>Steps to Reproduce</Label>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {selectedReport.stepsToReproduce}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedReport.expectedBehavior && (
                    <div>
                      <Label>Expected Behavior</Label>
                      <p className="mt-1 text-sm">
                        {selectedReport.expectedBehavior}
                      </p>
                    </div>
                  )}
                  {selectedReport.actualBehavior && (
                    <div>
                      <Label>Actual Behavior</Label>
                      <p className="mt-1 text-sm">
                        {selectedReport.actualBehavior}
                      </p>
                    </div>
                  )}
                </div>

                {selectedReport.pageUrl && (
                  <div>
                    <Label>Page URL</Label>
                    <p className="mt-1 text-sm font-mono text-xs break-all">
                      {selectedReport.pageUrl}
                    </p>
                  </div>
                )}

                {/* Browser Info */}
                {(selectedReport.browserName || selectedReport.osName) && (
                  <div>
                    <Label>Environment</Label>
                    <p className="mt-1 text-sm">
                      {selectedReport.browserName} {selectedReport.browserVersion} |{" "}
                      {selectedReport.osName} {selectedReport.osVersion} |{" "}
                      {selectedReport.screenWidth}x{selectedReport.screenHeight}
                    </p>
                  </div>
                )}

                {/* Screenshots */}
                {selectedReport.screenshots && selectedReport.screenshots.length > 0 && (
                  <div>
                    <Label>Screenshots ({selectedReport.screenshots.length})</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedReport.screenshots.map((screenshot) => (
                        <a
                          key={screenshot.id}
                          href={screenshot.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={screenshot.thumbnailUrl || screenshot.imageUrl}
                            alt={screenshot.fileName}
                            width={80}
                            height={80}
                            className="h-20 w-20 object-cover rounded border hover:opacity-80 transition-opacity"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={selectedReport.status}
                      onValueChange={(value) => {
                        handleStatusChange(selectedReport.id, value);
                        setSelectedReport({ ...selectedReport, status: value });
                      }}
                      disabled={statusLoading === selectedReport.id}
                    >
                      <SelectTrigger className="w-[160px]">
                        {statusLoading === selectedReport.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Change Status" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="TRIAGED">Triaged</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="NEEDS_INFO">Needs Info</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="WONT_FIX">Won&apos;t Fix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Assignee</Label>
                    <Select
                      value={selectedReport.assignedTo?.id || "unassigned"}
                      onValueChange={(value) => {
                        handleAssigneeChange(selectedReport.id, value === "unassigned" ? null : value);
                      }}
                      disabled={assigneeLoading}
                    >
                      <SelectTrigger className="w-[180px]">
                        {assigneeLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Assign to..." />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <span className="text-muted-foreground">Unassigned</span>
                        </SelectItem>
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {admin.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Comments Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label>Comments ({selectedReport.comments?.length || 0})</Label>
                  </div>

                  {/* Existing Comments */}
                  {selectedReport.comments && selectedReport.comments.length > 0 ? (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {selectedReport.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(comment.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </span>
                              {comment.isInternal && (
                                <Badge variant="outline" className="text-xs">Internal</Badge>
                              )}
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet
                    </p>
                  )}

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] flex-1"
                      disabled={commentLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={commentLoading || !newComment.trim()}
                      className="self-end"
                    >
                      {commentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bug Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bug report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
