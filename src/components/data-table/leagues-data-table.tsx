

import * as React from "react";
import { motion } from "framer-motion";
import {
  IconTrophy,
  IconDownload,
  IconRefresh,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import { League } from "@/constants/zod/league-schema";
import { type League as LeagueEditType } from "@/constants/types/league";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { getSportIcon, getSportColor, getSportLabel } from "@/constants/sports";

import { LeagueRowActions } from "@/components/league/league-row-actions";
import { LeagueDetailModal } from "@/components/league/league-detail-modal";

import {
  formatTableDate,
  formatLocation,
  ACTION_MESSAGES,
  formatCount,
} from "./constants";

const LeagueEditModal = React.lazy(() => import("@/components/modal/league-edit-modal"));

/** Format status to Title Case (e.g., "ACTIVE" -> "Active") */
const formatStatus = (status: string | undefined): string => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

/** Get status badge styling */
const getStatusBadgeClass = (status: string | undefined) => {
  switch (status) {
    case "UPCOMING":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "ACTIVE":
    case "ONGOING":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "FINISHED":
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
    case "CANCELLED":
    case "SUSPENDED":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    case "INACTIVE":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

/** Get sport-specific background style for icon container */
const getSportBgClass = (sportType: string | null | undefined): string => {
  const sport = sportType?.toUpperCase();
  switch (sport) {
    case "TENNIS":
      return "bg-emerald-100 dark:bg-emerald-900/40";
    case "PICKLEBALL":
      return "bg-violet-100 dark:bg-violet-900/40";
    case "PADEL":
      return "bg-sky-100 dark:bg-sky-900/40";
    default:
      return "bg-primary/10";
  }
};

/** Format game type display */
const formatGameType = (gameType: string | undefined): string => {
  switch (gameType?.toUpperCase()) {
    case "SINGLES":
      return "Singles";
    case "DOUBLES":
      return "Doubles";
    case "MIXED":
      return "Mixed";
    default:
      return gameType || "—";
  }
};

export type LeaguesDataTableProps = {
  data: League[];
  isLoading: boolean;
  onDataChange?: () => void;
};

export function LeaguesDataTable({
  data,
  isLoading,
  onDataChange,
}: LeaguesDataTableProps) {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  // Modal states
  const [viewLeague, setViewLeague] = React.useState<League | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [editLeague, setEditLeague] = React.useState<League | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [deleteLeague, setDeleteLeague] = React.useState<League | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleViewLeague = React.useCallback((league: League) => {
    setViewLeague(league);
    setIsViewOpen(true);
  }, []);

  const handleEditLeague = React.useCallback((league: League) => {
    setEditLeague(league);
    setIsEditOpen(true);
  }, []);

  const handleDeleteRequest = React.useCallback((league: League) => {
    setDeleteLeague(league);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteLeague = React.useCallback(async () => {
    if (!deleteLeague) return;
    try {
      setIsDeleting(true);
      const response = await axiosInstance.delete(endpoints.league.delete(deleteLeague.id));
      toast.success(response.data?.message ?? ACTION_MESSAGES.SUCCESS.DELETE);
      onDataChange?.();
      setDeleteLeague(null);
      setIsDeleteOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || ACTION_MESSAGES.ERROR.DELETE_FAILED;
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteLeague, onDataChange]);

  const handleEditSuccess = React.useCallback(() => {
    onDataChange?.();
    setEditLeague(null);
    setIsEditOpen(false);
  }, [onDataChange]);

  const exportToCSV = React.useCallback(() => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Sport", "Location", "Status", "Game Type", "Players", "Seasons", "Created At"];

    const rows = data.map(l => [
      l.name,
      l.sportType || "",
      l.location || "",
      l.status || "",
      l.gameType || "",
      l.memberCount || 0,
      l.seasonCount || 0,
      l.createdAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leagues-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Leagues exported successfully");
  }, [data]);

  // Filter data by search
  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;
    const search = globalFilter.toLowerCase();
    return data.filter(l =>
      l.name.toLowerCase().includes(search) ||
      l.status?.toLowerCase().includes(search) ||
      l.sportType?.toLowerCase().includes(search) ||
      l.location?.toLowerCase().includes(search)
    );
  }, [data, globalFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="space-y-4">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Input
            placeholder="Search leagues..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
            {onDataChange && (
              <Button variant="outline" size="sm" onClick={onDataChange}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[60px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
                  <TableHead className="min-w-[250px] py-2.5 font-medium text-xs">League</TableHead>
                  <TableHead className="w-[120px] py-2.5 font-medium text-xs">Sport</TableHead>
                  <TableHead className="w-[180px] py-2.5 font-medium text-xs">Location</TableHead>
                  <TableHead className="w-[110px] py-2.5 font-medium text-xs">Status</TableHead>
                  <TableHead className="w-[120px] py-2.5 font-medium text-xs">Game Type</TableHead>
                  <TableHead className="w-[100px] py-2.5 font-medium text-xs">Players</TableHead>
                  <TableHead className="w-[100px] py-2.5 font-medium text-xs">Seasons</TableHead>
                  <TableHead className="w-[80px] py-2.5 pr-4 font-medium text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <motion.tbody
                initial="hidden"
                animate="visible"
                variants={tableContainerVariants}
              >
                {paginatedData.map((league, index) => {
                  const sportIcon = getSportIcon(league.sportType, 16);
                  const sportColor = getSportColor(league.sportType);
                  const sportLabel = getSportLabel(league.sportType);

                  return (
                    <motion.tr
                      key={league.id}
                      variants={tableRowVariants}
                      transition={fastTransition}
                      className="hover:bg-muted/30 border-b transition-colors cursor-pointer"
                      onClick={() => navigate({ to: "/league/view/$leagueId", params: { leagueId: league.id } })}
                    >
                      {/* Row Number */}
                      <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                        {((currentPage - 1) * pageSize) + index + 1}
                      </TableCell>

                      {/* League Name */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg",
                            getSportBgClass(league.sportType)
                          )}>
                            {sportIcon || <IconTrophy className="size-4" />}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to="/league/view/$leagueId"
                              params={{ leagueId: league.id }}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {league.name}
                            </Link>
                          </div>
                        </div>
                      </TableCell>

                      {/* Sport */}
                      <TableCell className="py-3">
                        <div
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
                          style={{
                            color: sportColor,
                            borderColor: sportColor + "40",
                            backgroundColor: sportColor + "10",
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: sportColor }}
                          />
                          {sportLabel}
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="py-3">
                        {league.location ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <IconMapPin className="size-4" />
                            <span className="truncate max-w-[120px]">{formatLocation(league.location)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium border", getStatusBadgeClass(league.status))}
                        >
                          {formatStatus(league.status)}
                        </Badge>
                      </TableCell>

                      {/* Game Type */}
                      <TableCell className="py-3">
                        <span className="text-sm">{formatGameType(league.gameType)}</span>
                      </TableCell>

                      {/* Players */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <IconUsers className="size-4 text-muted-foreground" />
                          <span className="font-medium">{formatCount(league.memberCount)}</span>
                        </div>
                      </TableCell>

                      {/* Seasons */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <IconCalendar className="size-4 text-muted-foreground" />
                          <span className="font-medium">{formatCount(league.seasonCount)}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                        <LeagueRowActions
                          league={league}
                          onView={handleViewLeague}
                          onEdit={handleEditLeague}
                          onDelete={handleDeleteRequest}
                        />
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No leagues found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} leagues
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

      {/* League Detail Modal */}
      <LeagueDetailModal
        league={viewLeague}
        open={isViewOpen}
        onOpenChange={(open) => {
          if (!open) setViewLeague(null);
          setIsViewOpen(open);
        }}
        onEdit={handleEditLeague}
      />

      {/* Edit League Modal */}
      {editLeague && (
        <React.Suspense fallback={null}>
          <LeagueEditModal
            open={isEditOpen}
            onOpenChange={(open) => {
              if (!open) setEditLeague(null);
              setIsEditOpen(open);
            }}
            league={{
              ...editLeague,
              location: editLeague.location ?? null,
              createdAt: editLeague.createdAt instanceof Date ? editLeague.createdAt.toISOString() : editLeague.createdAt,
              updatedAt: editLeague.updatedAt instanceof Date ? editLeague.updatedAt.toISOString() : editLeague.updatedAt,
            } as LeagueEditType}
            onLeagueUpdated={async () => { handleEditSuccess(); }}
          />
        </React.Suspense>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteLeague(null);
          setIsDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete league</AlertDialogTitle>
            <AlertDialogDescription>
              {ACTION_MESSAGES.DELETE_CONFIRM}
              <br />
              <span className="font-semibold">{deleteLeague?.name ?? "this league"}</span>? This action cannot be undone and will remove all associated seasons, divisions, and matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLeague}
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
