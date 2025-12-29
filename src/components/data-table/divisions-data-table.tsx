

import * as React from "react";
import { motion } from "framer-motion";
import {
  IconCategory,
  IconTrophy,
  IconDownload,
  IconRefresh,
  IconAlertTriangle,
  IconUsers,
  IconUser,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import { divisionSchema, Division } from "@/constants/zod/division-schema";
import { toast } from "sonner";
import { z } from "zod";
import { Link } from "@tanstack/react-router";

import DivisionCreateModal from "@/components/modal/division-create-modal";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { cn, formatDivisionLevel } from "@/lib/utils";

import { DivisionRowActions } from "@/components/division/division-row-actions";
import { DivisionDetailModal } from "@/components/division/division-detail-modal";

import {
  ACTION_MESSAGES,
} from "./constants";

interface Season {
  id: string;
  name: string;
}

/** Get level badge styling */
const getLevelBadgeClass = (level: string | null | undefined) => {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800";
    case "intermediate":
    case "upper_intermediate":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "advanced":
      return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

/** Get capacity status and color */
const getCapacityDisplay = (current: number, max: number | null | undefined) => {
  if (!max || max === 0) {
    return { percentage: 0, colorClass: "bg-slate-400", textColor: "text-slate-600", label: current.toString() };
  }
  const percentage = Math.min((current / max) * 100, 100);
  if (percentage >= 100) return { percentage: 100, colorClass: "bg-red-500", textColor: "text-red-600 dark:text-red-400", label: "Full" };
  if (percentage >= 90) return { percentage, colorClass: "bg-red-500", textColor: "text-red-600 dark:text-red-400", label: "Almost full" };
  if (percentage >= 70) return { percentage, colorClass: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", label: "Filling" };
  return { percentage, colorClass: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", label: "" };
};

export function DivisionsDataTable() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<Division[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Season filter
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  // Modal states
  const [viewDivision, setViewDivision] = React.useState<Division | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [editDivision, setEditDivision] = React.useState<Division | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [deleteDivision, setDeleteDivision] = React.useState<Division | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchDivisions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(endpoints.division.getAll);

      if (!response.data) {
        setData([]);
        setError("No data received from server");
        toast.error("No data received from server");
        return;
      }

      let divisionsArray = response.data;
      if (response.data.data && Array.isArray(response.data.data)) {
        divisionsArray = response.data.data;
      } else if (response.data.divisions && Array.isArray(response.data.divisions)) {
        divisionsArray = response.data.divisions;
      } else if (Array.isArray(response.data)) {
        divisionsArray = response.data;
      } else {
        setData([]);
        setError("Invalid data format from server");
        toast.error("Invalid data format from server");
        return;
      }

      try {
        const parsed = z.array(divisionSchema).parse(divisionsArray);
        setData(parsed);
      } catch {
        setData(divisionsArray);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || ACTION_MESSAGES.ERROR.LOAD_FAILED;
      setData([]);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSeasons = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get(endpoints.season.getAll);
      const seasonsData = response.data?.data || response.data || [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      console.error("Failed to fetch seasons:", error);
    }
  }, []);

  const fetchDivisionsBySeason = React.useCallback(async (seasonId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = seasonId === "all" ? endpoints.division.getAll : endpoints.division.getBySeasonId(seasonId);
      const response = await axiosInstance.get(url);

      let divisionsArray = response.data?.data || response.data?.divisions || response.data || [];
      if (!Array.isArray(divisionsArray)) divisionsArray = [];

      try {
        const parsed = z.array(divisionSchema).parse(divisionsArray);
        setData(parsed);
      } catch {
        setData(divisionsArray);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Failed to load divisions");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportToCSV = React.useCallback(() => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Season", "Level", "Game Type", "Gender", "Max Singles", "Max Doubles Teams", "Current Singles", "Current Doubles", "Threshold", "Prize Pool", "Sponsor", "Status", "Auto Assignment", "Created At", "Updated At"];

    const rows = data.map(d => [
      d.name,
      (d as any).season?.name || "",
      d.divisionLevel || "",
      d.gameType || "",
      d.genderCategory || "",
      d.maxSingles || "",
      d.maxDoublesTeams || "",
      d.currentSinglesCount || 0,
      d.currentDoublesCount || 0,
      d.threshold || "",
      d.prizePoolTotal || "",
      d.sponsoredDivisionName || "",
      d.isActive ? "Active" : "Inactive",
      d.autoAssignmentEnabled ? "Yes" : "No",
      d.createdAt,
      d.updatedAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `divisions-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Divisions exported successfully");
  }, [data]);

  React.useEffect(() => {
    fetchDivisions();
    fetchSeasons();
  }, [fetchDivisions, fetchSeasons]);

  React.useEffect(() => {
    fetchDivisionsBySeason(selectedSeasonId);
  }, [selectedSeasonId, fetchDivisionsBySeason]);

  const handleViewDivision = React.useCallback((division: Division) => {
    setViewDivision(division);
    setIsViewOpen(true);
  }, []);

  const handleEditDivision = React.useCallback((division: Division) => {
    setEditDivision(division);
    setIsEditOpen(true);
  }, []);

  const handleDeleteRequest = React.useCallback((division: Division) => {
    setDeleteDivision(division);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteDivision = React.useCallback(async () => {
    if (!deleteDivision) return;
    try {
      setIsDeleting(true);
      const response = await axiosInstance.delete(endpoints.division.delete(deleteDivision.id));
      toast.success(response.data?.message ?? ACTION_MESSAGES.SUCCESS.DELETE);
      await fetchDivisions();
      setDeleteDivision(null);
      setIsDeleteOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || ACTION_MESSAGES.ERROR.DELETE_FAILED;
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDivision, fetchDivisions]);

  const handleEditSuccess = React.useCallback(async () => {
    await fetchDivisions();
    setEditDivision(null);
    setIsEditOpen(false);
  }, [fetchDivisions]);

  const handleManagePlayers = React.useCallback((division: Division) => {
    navigate({ to: `/divisions/${division.id}?tab=players` });
  }, [navigate]);

  const mappedEditDivision = React.useMemo(() => {
    if (!editDivision) return null;
    return {
      id: editDivision.id,
      seasonId: editDivision.seasonId,
      name: editDivision.name,
      description: editDivision.description ?? null,
      threshold: editDivision.threshold ?? null,
      divisionLevel: editDivision.divisionLevel,
      gameType: editDivision.gameType,
      genderCategory: editDivision.genderCategory ?? null,
      maxSingles: editDivision.maxSingles ?? null,
      maxDoublesTeams: editDivision.maxDoublesTeams ?? null,
      autoAssignmentEnabled: editDivision.autoAssignmentEnabled ?? false,
      isActive: editDivision.isActive,
      prizePoolTotal: editDivision.prizePoolTotal ?? null,
      sponsoredDivisionName: editDivision.sponsoredDivisionName ?? null,
    };
  }, [editDivision]);

  // Filter data by search
  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;
    const search = globalFilter.toLowerCase();
    return data.filter(d =>
      d.name.toLowerCase().includes(search) ||
      (d as any).season?.name?.toLowerCase().includes(search) ||
      d.divisionLevel?.toLowerCase().includes(search) ||
      d.gameType?.toLowerCase().includes(search)
    );
  }, [data, globalFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            <div className="flex items-start gap-2">
              <IconAlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Error loading divisions</p>
                <p className="text-sm mt-1">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchDivisions} className="mt-2">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search, Season Filter, and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search divisions..."
              value={globalFilter}
              onChange={(e) => { setGlobalFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-80"
            />
            <Select value={selectedSeasonId} onValueChange={(val) => { setSelectedSeasonId(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchDivisionsBySeason(selectedSeasonId)}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : paginatedData.length > 0 ? (
          <TooltipProvider>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
                    <TableHead className="py-2.5 font-medium text-xs">Division</TableHead>
                    <TableHead className="w-[160px] py-2.5 font-medium text-xs">Season</TableHead>
                    <TableHead className="w-[110px] py-2.5 font-medium text-xs">Level</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Type</TableHead>
                    <TableHead className="w-[150px] py-2.5 font-medium text-xs">Capacity</TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs">Status</TableHead>
                    <TableHead className="w-[60px] py-2.5 font-medium text-xs text-center">Flags</TableHead>
                    <TableHead className="w-[50px] py-2.5 pr-4 font-medium text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  initial="hidden"
                  animate="visible"
                  variants={tableContainerVariants}
                >
                  {paginatedData.map((division, index) => {
                    const isDoubles = division.gameType?.toLowerCase() === "doubles";
                    const currentCount = isDoubles ? (division.currentDoublesCount || 0) : (division.currentSinglesCount || 0);
                    const maxCount = isDoubles ? division.maxDoublesTeams : division.maxSingles;
                    const capacity = getCapacityDisplay(currentCount, maxCount);
                    const season = (division as any).season;

                    return (
                      <motion.tr
                        key={division.id}
                        variants={tableRowVariants}
                        transition={fastTransition}
                        className="hover:bg-muted/30 border-b transition-colors cursor-pointer"
                        onClick={() => navigate({ to: "/divisions/$divisionId", params: { divisionId: division.id } })}
                      >
                        {/* Row Number */}
                        <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                          {((currentPage - 1) * pageSize) + index + 1}
                        </TableCell>

                        {/* Division Name */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <IconCategory className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <Link
                                to="/divisions/$divisionId"
                                params={{ divisionId: division.id }}
                                className="font-medium hover:text-primary transition-colors block truncate max-w-[200px]"
                              >
                                {division.name}
                              </Link>
                              {division.threshold && (
                                <span className="text-xs text-muted-foreground">
                                  {division.threshold}+ pts
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Season */}
                        <TableCell className="py-3">
                          {season ? (
                            <div className="flex items-center gap-2">
                              <IconTrophy className="size-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-[120px]">{season.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Level */}
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium border", getLevelBadgeClass(division.divisionLevel))}
                          >
                            {formatDivisionLevel(division.divisionLevel)}
                          </Badge>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {isDoubles ? (
                              <IconUsers className="size-4" />
                            ) : (
                              <IconUser className="size-4" />
                            )}
                            <span>{isDoubles ? "Doubles" : "Singles"}</span>
                          </div>
                        </TableCell>

                        {/* Capacity */}
                        <TableCell className="py-3">
                          {maxCount ? (
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all", capacity.colorClass)}
                                  style={{ width: `${capacity.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {currentCount}<span className="text-muted-foreground font-normal">/{maxCount}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm">{currentCount} {isDoubles ? "teams" : "players"}</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              division.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400"
                            )}
                          >
                            {division.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Flags */}
                        <TableCell className="py-3 text-center">
                          {division.autoAssignmentEnabled ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <IconSettings className="size-4 text-blue-500 mx-auto" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Auto-assignment enabled</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                          <DivisionRowActions
                            division={division}
                            onView={handleViewDivision}
                            onEdit={handleEditDivision}
                            onDelete={handleDeleteRequest}
                            onManagePlayers={handleManagePlayers}
                          />
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </Table>
            </div>
          </TooltipProvider>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No divisions found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} divisions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <IconChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <IconChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Division Detail Modal */}
      <DivisionDetailModal
        division={viewDivision}
        open={isViewOpen}
        onOpenChange={(open) => {
          if (!open) setViewDivision(null);
          setIsViewOpen(open);
        }}
        onEdit={handleEditDivision}
        onManagePlayers={handleManagePlayers}
      />

      {/* Edit Division Modal */}
      <DivisionCreateModal
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) setEditDivision(null);
          setIsEditOpen(open);
        }}
        onDivisionCreated={handleEditSuccess}
        mode="edit"
        division={mappedEditDivision}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteDivision(null);
          setIsDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete division</AlertDialogTitle>
            <AlertDialogDescription>
              {ACTION_MESSAGES.DELETE_CONFIRM}
              <br />
              <span className="font-semibold">{deleteDivision?.name ?? "this division"}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDivision}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
