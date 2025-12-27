

import * as React from "react";
import { motion } from "framer-motion";
import {
  IconTrophy,
  IconDownload,
  IconRefresh,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import { Season } from "@/constants/zod/season-schema";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { getSportIcon } from "@/constants/sports";

import { SeasonRowActions } from "@/components/season/season-row-actions";
import { SeasonDetailModal } from "@/components/season/season-detail-modal";
import SeasonEditModal from "@/components/modal/season-edit-modal";

import {
  formatTableDate,
  formatCurrency,
  ACTION_MESSAGES,
} from "./constants";

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
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "FINISHED":
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
    case "CANCELLED":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    case "WAITLISTED":
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

/** Format category display */
const formatCategory = (category: Season["category"]): string => {
  if (!category) return "Open";
  const gender = category.genderRestriction || category.genderCategory || category.gender_category;
  const format = category.matchFormat || category.gameType || category.game_type;

  const genderLabel = gender?.toLowerCase() === "male" ? "Men's"
    : gender?.toLowerCase() === "female" ? "Women's"
    : gender?.toLowerCase() === "mixed" ? "Mixed"
    : "";

  const formatLabel = format?.toLowerCase() === "singles" ? "Singles"
    : format?.toLowerCase() === "doubles" ? "Doubles"
    : format || "";

  return [genderLabel, formatLabel].filter(Boolean).join(" ") || "Open";
};

export type SeasonsDataTableProps = {
  data: Season[];
  isLoading: boolean;
  onViewSeason?: (seasonId: string) => void;
  onRefresh?: () => void;
};

export function SeasonsDataTable({
  data,
  isLoading,
  onViewSeason,
  onRefresh,
}: SeasonsDataTableProps) {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  // Modal states
  const [viewSeason, setViewSeason] = React.useState<Season | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [editSeason, setEditSeason] = React.useState<Season | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [deleteSeason, setDeleteSeason] = React.useState<Season | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleViewSeason = React.useCallback((season: Season) => {
    setViewSeason(season);
    setIsViewOpen(true);
  }, []);

  const handleEditSeason = React.useCallback((season: Season) => {
    setEditSeason(season);
    setIsEditOpen(true);
  }, []);

  const handleDeleteRequest = React.useCallback((season: Season) => {
    setDeleteSeason(season);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteSeason = React.useCallback(async () => {
    if (!deleteSeason) return;
    try {
      setIsDeleting(true);
      const response = await axiosInstance.delete(endpoints.season.delete(deleteSeason.id));
      toast.success(response.data?.message ?? ACTION_MESSAGES.SUCCESS.DELETE);
      onRefresh?.();
      setDeleteSeason(null);
      setIsDeleteOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || ACTION_MESSAGES.ERROR.DELETE_FAILED;
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSeason, onRefresh]);

  const handleEditSuccess = React.useCallback(() => {
    onRefresh?.();
    setEditSeason(null);
    setIsEditOpen(false);
  }, [onRefresh]);

  const handleManagePlayers = React.useCallback((season: Season) => {
    navigate({ to: `/seasons/${season.id}?tab=players` });
  }, [navigate]);

  const exportToCSV = React.useCallback(() => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Status", "Sport Type", "Category", "Entry Fee", "Players", "Divisions", "Start Date", "End Date", "Deadline", "Payment Required", "Created At"];

    const rows = data.map(s => [
      s.name,
      s.status || "",
      s.sportType || "",
      formatCategory(s.category),
      s.entryFee || 0,
      s.registeredUserCount || 0,
      s.divisions?.length || 0,
      s.startDate ? new Date(s.startDate).toLocaleDateString() : "",
      s.endDate ? new Date(s.endDate).toLocaleDateString() : "",
      s.regiDeadline ? new Date(s.regiDeadline).toLocaleDateString() : "",
      s.paymentRequired ? "Yes" : "No",
      s.createdAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seasons-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Seasons exported successfully");
  }, [data]);

  // Filter data by search
  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;
    const search = globalFilter.toLowerCase();
    return data.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.status?.toLowerCase().includes(search) ||
      s.sportType?.toLowerCase().includes(search) ||
      formatCategory(s.category).toLowerCase().includes(search)
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
            placeholder="Search seasons..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-80"
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
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
          <TooltipProvider>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
                    <TableHead className="py-2.5 font-medium text-xs">Season</TableHead>
                    <TableHead className="w-[120px] py-2.5 font-medium text-xs">Leagues</TableHead>
                    <TableHead className="w-[120px] py-2.5 font-medium text-xs">Category</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Status</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Entry Fee</TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs">Players</TableHead>
                    <TableHead className="w-[130px] py-2.5 font-medium text-xs">Deadline</TableHead>
                    <TableHead className="w-[50px] py-2.5 pr-4 font-medium text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  initial="hidden"
                  animate="visible"
                  variants={tableContainerVariants}
                >
                  {paginatedData.map((season, index) => {
                    const leagues = season.leagues || [];
                    const sportType = season.sportType || (leagues[0]?.sportType);
                    const sportIcon = sportType ? getSportIcon(sportType, 16) : <IconTrophy className="size-4" />;

                    return (
                      <motion.tr
                        key={season.id}
                        variants={tableRowVariants}
                        transition={fastTransition}
                        className="hover:bg-muted/30 border-b transition-colors"
                      >
                        {/* Row Number */}
                        <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                          {((currentPage - 1) * pageSize) + index + 1}
                        </TableCell>

                        {/* Season Name */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg",
                              getSportBgClass(sportType)
                            )}>
                              {sportIcon}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to="/seasons/$seasonId"
                                params={{ seasonId: season.id }}
                                className="font-medium hover:text-primary transition-colors block truncate max-w-[200px]"
                              >
                                {season.name}
                              </Link>
                              {season.startDate && season.endDate && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTableDate(season.startDate)} - {formatTableDate(season.endDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Leagues */}
                        <TableCell className="py-3">
                          {leagues.length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="cursor-pointer">
                                  {leagues.length} League{leagues.length !== 1 ? "s" : ""}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  {leagues.slice(0, 5).map((league) => (
                                    <div key={league.id} className="text-xs">{league.name}</div>
                                  ))}
                                  {leagues.length > 5 && (
                                    <div className="text-xs text-muted-foreground">+{leagues.length - 5} more</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Category */}
                        <TableCell className="py-3">
                          <span className="text-sm">{formatCategory(season.category)}</span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium border", getStatusBadgeClass(season.status))}
                          >
                            {formatStatus(season.status)}
                          </Badge>
                        </TableCell>

                        {/* Entry Fee */}
                        <TableCell className="py-3">
                          {season.entryFee && Number(season.entryFee) > 0 ? (
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(Number(season.entryFee), "MYR")}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Free</span>
                          )}
                        </TableCell>

                        {/* Players */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <IconUsers className="size-4 text-muted-foreground" />
                            <span className="font-medium">{season.registeredUserCount || 0}</span>
                          </div>
                        </TableCell>

                        {/* Deadline */}
                        <TableCell className="py-3">
                          {season.regiDeadline ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <IconClock className="size-4" />
                              <span>{formatTableDate(season.regiDeadline)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 pr-4">
                          <SeasonRowActions
                            season={season}
                            onView={handleViewSeason}
                            onEdit={handleEditSeason}
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
            No seasons found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} seasons
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

      {/* Season Detail Modal */}
      <SeasonDetailModal
        season={viewSeason}
        open={isViewOpen}
        onOpenChange={(open) => {
          if (!open) setViewSeason(null);
          setIsViewOpen(open);
        }}
        onEdit={handleEditSeason}
        onManagePlayers={handleManagePlayers}
      />

      {/* Edit Season Modal */}
      {editSeason && (
        <SeasonEditModal
          open={isEditOpen}
          onOpenChange={(open) => {
            if (!open) setEditSeason(null);
            setIsEditOpen(open);
          }}
          season={editSeason}
          onSeasonUpdated={async () => { handleEditSuccess(); }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteSeason(null);
          setIsDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete season</AlertDialogTitle>
            <AlertDialogDescription>
              {ACTION_MESSAGES.DELETE_CONFIRM}
              <br />
              <span className="font-semibold">{deleteSeason?.name ?? "this season"}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSeason}
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
