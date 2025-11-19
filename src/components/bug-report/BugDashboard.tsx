"use client";

import React, { useState, useEffect } from "react";
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
  reporter: { id: string; name: string; email: string };
  assignedTo?: { id: string; user: { name: string } };
  _count: { comments: number; screenshots: number };
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

export default function BugDashboard() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [page, statusFilter, severityFilter, priorityFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/stats`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
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
        setReports(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load bug reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
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
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this bug report?")) return;

    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Bug report deleted");
        fetchReports();
        fetchStats();
      } else {
        toast.error("Failed to delete bug report");
      }
    } catch (error) {
      toast.error("Failed to delete bug report");
    }
  };

  const openDetail = async (report: BugReport) => {
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/reports/${report.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data);
        setDetailOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load report details");
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bug Reports</h1>
          <p className="text-muted-foreground">
            Manage and track bug reports across all apps
          </p>
        </div>
        <Button onClick={() => { fetchReports(); fetchStats(); }} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentlyCreated} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.byStatus.NEW || 0) +
                  (stats.byStatus.TRIAGED || 0) +
                  (stats.byStatus.IN_PROGRESS || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.bySeverity.CRITICAL || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                High priority issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.byStatus.RESOLVED || 0) + (stats.byStatus.CLOSED || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg {Math.round(stats.avgResolutionTimeMinutes / 60)}h to resolve
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by title, description, or report number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="TRIAGED">Triaged</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="NEEDS_INFO">Needs Info</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No bug reports found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-sm">
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
                        <p>{report.reporter.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.reporter.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(report.id, "IN_PROGRESS")}
                          >
                            Start Working
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(report.id, "RESOLVED")}
                          >
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(report.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
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
                    {selectedReport.module.name} | Reported by {selectedReport.reporter.name}
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

                {(selectedReport as any).stepsToReproduce && (
                  <div>
                    <Label>Steps to Reproduce</Label>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {(selectedReport as any).stepsToReproduce}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {(selectedReport as any).expectedBehavior && (
                    <div>
                      <Label>Expected Behavior</Label>
                      <p className="mt-1 text-sm">
                        {(selectedReport as any).expectedBehavior}
                      </p>
                    </div>
                  )}
                  {(selectedReport as any).actualBehavior && (
                    <div>
                      <Label>Actual Behavior</Label>
                      <p className="mt-1 text-sm">
                        {(selectedReport as any).actualBehavior}
                      </p>
                    </div>
                  )}
                </div>

                {(selectedReport as any).pageUrl && (
                  <div>
                    <Label>Page URL</Label>
                    <p className="mt-1 text-sm font-mono text-xs break-all">
                      {(selectedReport as any).pageUrl}
                    </p>
                  </div>
                )}

                {/* Browser Info */}
                {((selectedReport as any).browserName || (selectedReport as any).osName) && (
                  <div>
                    <Label>Environment</Label>
                    <p className="mt-1 text-sm">
                      {(selectedReport as any).browserName} {(selectedReport as any).browserVersion} |
                      {(selectedReport as any).osName} {(selectedReport as any).osVersion} |
                      {(selectedReport as any).screenWidth}x{(selectedReport as any).screenHeight}
                    </p>
                  </div>
                )}

                {/* Screenshots */}
                {(selectedReport as any).screenshots?.length > 0 && (
                  <div>
                    <Label>Screenshots</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(selectedReport as any).screenshots.map((screenshot: any) => (
                        <a
                          key={screenshot.id}
                          href={screenshot.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={screenshot.thumbnailUrl || screenshot.imageUrl}
                            alt={screenshot.fileName}
                            className="h-20 w-20 object-cover rounded border hover:opacity-80"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Select
                    value={selectedReport.status}
                    onValueChange={(value) => {
                      handleStatusChange(selectedReport.id, value);
                      setSelectedReport({ ...selectedReport, status: value });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="TRIAGED">Triaged</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="NEEDS_INFO">Needs Info</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="WONT_FIX">Won't Fix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
