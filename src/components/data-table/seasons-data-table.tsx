

import * as React from "react";
import { motion } from "framer-motion";
import {
  IconTrophy,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  tableContainerVariants,
  tableRowVariants,
  fastTransition,
} from "@/lib/animation-variants";
import { Season, GroupedSeason } from "@/constants/zod/season-schema";
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
import { getErrorMessage } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { getSportIcon } from "@/constants/sports";

import {
  SeasonRowActions,
  GroupedSeasonRowActions,
} from "@/components/season/season-row-actions";
import { SeasonDetailModal } from "@/components/season/season-detail-modal";
import { SeasonCategorySelectionModal } from "@/components/season/season-category-selection-modal";
import SeasonEditModal from "@/components/modal/season-edit-modal";

import { formatTableDate, ACTION_MESSAGES } from "./constants";

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

export type SeasonsDataTableProps = {
  data: GroupedSeason[];
  isLoading: boolean;
  onViewSeason?: (seasonId: string) => void;
  onRefresh?: () => void;
  searchQuery?: string;
  sportFilter?: string;
  leagueFilter?: string;
};

export function SeasonsDataTable({
  data,
  isLoading,
  onViewSeason,
  onRefresh,
  searchQuery = "",
  sportFilter,
  leagueFilter,
}: SeasonsDataTableProps) {
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sportFilter, leagueFilter]);

  // Modal states
  const [viewSeason, setViewSeason] = React.useState<Season | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [editSeason, setEditSeason] = React.useState<Season | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [deleteSeason, setDeleteSeason] = React.useState<Season | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Category selection modal state
  const [selectedGroup, setSelectedGroup] =
    React.useState<GroupedSeason | null>(null);
  const [isCategorySelectOpen, setIsCategorySelectOpen] = React.useState(false);

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
      const response = await axiosInstance.delete(
        endpoints.season.delete(deleteSeason.id)
      );
      toast.success(response.data?.message ?? ACTION_MESSAGES.SUCCESS.DELETE);
      onRefresh?.();
      setDeleteSeason(null);
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, ACTION_MESSAGES.ERROR.DELETE_FAILED));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSeason, onRefresh]);

  const handleEditSuccess = React.useCallback(() => {
    onRefresh?.();
    setEditSeason(null);
    setIsEditOpen(false);
  }, [onRefresh]);

  const handleManagePlayers = React.useCallback(
    (season: Season) => {
      navigate({ to: `/seasons/${season.id}?tab=players` });
    },
    [navigate]
  );

  const handleRowClick = React.useCallback(
    (group: GroupedSeason) => {
      if (group.seasons.length === 1) {
        // Single season - navigate directly
        navigate({
          to: "/seasons/$seasonId",
          params: { seasonId: group.seasons[0].id },
        });
      } else {
        // Multiple seasons - open category selection modal
        setSelectedGroup(group);
        setIsCategorySelectOpen(true);
      }
    },
    [navigate]
  );

  // Filter data by search, sport, and league
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter((group) => {
        // Search in group name
        if (group.name.toLowerCase().includes(search)) return true;

        // Search in categories
        if (
          group.aggregated.categories.some((c) =>
            c.name?.toLowerCase().includes(search)
          )
        )
          return true;

        // Search in statuses
        if (
          group.aggregated.statuses.some((s) =>
            s.toLowerCase().includes(search)
          )
        )
          return true;

        // Search in leagues sport types
        if (
          group.aggregated.leagues.some((l) =>
            l.sportType?.toLowerCase().includes(search)
          )
        )
          return true;

        // Search in individual seasons
        return group.seasons.some(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            s.status?.toLowerCase().includes(search) ||
            s.sportType?.toLowerCase().includes(search) ||
            s.category?.name?.toLowerCase().includes(search)
        );
      });
    }

    // Apply sport filter
    if (sportFilter) {
      const filterUpper = sportFilter.toUpperCase();
      filtered = filtered.filter((group) => {
        // Check aggregated sport type
        if (group.aggregated.sportType?.toUpperCase() === filterUpper)
          return true;
        // Check leagues
        if (
          group.aggregated.leagues.some(
            (l) => l.sportType?.toUpperCase() === filterUpper
          )
        )
          return true;
        // Check individual seasons
        return group.seasons.some(
          (s) =>
            s.sportType?.toUpperCase() === filterUpper ||
            s.leagues?.some((l) => l.sportType?.toUpperCase() === filterUpper)
        );
      });
    }

    // Apply league filter
    if (leagueFilter) {
      filtered = filtered.filter((group) => {
        // Check aggregated leagues
        if (group.aggregated.leagues.some((l) => l.id === leagueFilter))
          return true;
        // Check individual seasons
        return group.seasons.some((s) =>
          s.leagues?.some((l) => l.id === leagueFilter)
        );
      });
    }

    return filtered;
  }, [data, searchQuery, sportFilter, leagueFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <div className="space-y-4">
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
                    <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">
                      #
                    </TableHead>
                    <TableHead className="py-2.5 font-medium text-xs">
                      Season
                    </TableHead>
                    <TableHead className="w-[120px] py-2.5 font-medium text-xs">
                      Leagues
                    </TableHead>
                    <TableHead className="w-[150px] py-2.5 font-medium text-xs">
                      Category
                    </TableHead>
                    <TableHead className="w-[120px] py-2.5 font-medium text-xs">
                      Status
                    </TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">
                      Entry Fee
                    </TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs">
                      Players
                    </TableHead>
                    <TableHead className="w-[130px] py-2.5 font-medium text-xs">
                      Deadline
                    </TableHead>
                    <TableHead className="w-[50px] py-2.5 pr-4 font-medium text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  key={`${searchQuery}-${sportFilter}-${leagueFilter}-${currentPage}`}
                  initial="hidden"
                  animate="visible"
                  variants={tableContainerVariants}
                >
                  {paginatedData
                  .filter((group) => {
                    if (!group || !group.aggregated) {
                      logger.warn("Invalid group data:", group);
                      return false;
                    }
                    return true;
                  })
                  .map((group, index) => {
                    const leagues = group.aggregated.leagues || [];
                    const sportType = group.aggregated.sportType;
                    const sportIcon = sportType ? (
                      getSportIcon(sportType, 16)
                    ) : (
                      <IconTrophy className="size-4" />
                    );
                    const hasMultipleCategories = (group.seasons?.length || 0) > 1;

                    // Get date range for display
                    const firstSeason = group.seasons?.[0];
                    const dateRange =
                      group.aggregated.dateRange?.start &&
                      group.aggregated.dateRange?.end
                        ? `${formatTableDate(group.aggregated.dateRange.start)} - ${formatTableDate(group.aggregated.dateRange.end)}`
                        : firstSeason?.startDate && firstSeason?.endDate
                          ? `${formatTableDate(firstSeason.startDate)} - ${formatTableDate(firstSeason.endDate)}`
                          : null;

                    return (
                      <motion.tr
                        key={group.groupKey}
                        variants={tableRowVariants}
                        transition={fastTransition}
                        className="hover:bg-muted/30 border-b transition-colors cursor-pointer"
                        onClick={() => handleRowClick(group)}
                      >
                        {/* Row Number */}
                        <TableCell className="py-3 pl-4 text-sm text-muted-foreground">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>

                        {/* Season Name */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg",
                                getSportBgClass(sportType)
                              )}
                            >
                              {sportIcon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium hover:text-primary transition-colors block truncate max-w-[200px]">
                                {group.name}
                              </div>
                              {dateRange && (
                                <span className="text-xs text-muted-foreground">
                                  {dateRange}
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
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer"
                                >
                                  {leagues.length} League
                                  {leagues.length !== 1 ? "s" : ""}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  {leagues.slice(0, 5).map((league) => (
                                    <div key={league.id} className="text-xs">
                                      {league.name}
                                    </div>
                                  ))}
                                  {leagues.length > 5 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{leagues.length - 5} more
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>

                        {/* Category - show first 2 badges, then +N for additional */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1">
                            {group.aggregated.categories
                              .slice(0, 2)
                              .map((cat, catIndex) => (
                                <React.Fragment key={cat.seasonId}>
                                  <Badge variant="outline" className="text-xs">
                                    {cat.name || "No category"}
                                  </Badge>
                                  {catIndex === 1 &&
                                    group.aggregated.categories.length > 2 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="text-xs cursor-pointer"
                                          >
                                            +{group.aggregated.categories.length - 2}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="space-y-1">
                                            {group.aggregated.categories
                                              .slice(2)
                                              .map((extraCat) => (
                                                <div
                                                  key={extraCat.seasonId}
                                                  className="text-xs"
                                                >
                                                  {extraCat.name || "No category"}
                                                </div>
                                              ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                </React.Fragment>
                              ))}
                            {group.aggregated.categories.length === 1 && null}
                            {group.aggregated.categories.length === 0 && (
                              <span className="text-muted-foreground text-sm">
                                No category
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status - show multiple badges if different */}
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {group.aggregated.statuses.map((status) => (
                              <Badge
                                key={status}
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium border",
                                  getStatusBadgeClass(status)
                                )}
                              >
                                {formatStatus(status)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        {/* Entry Fee - show aggregated */}
                        <TableCell className="py-3">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              group.aggregated.entryFeeDisplay !== "Free"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {group.aggregated.entryFeeDisplay}
                          </span>
                        </TableCell>

                        {/* Players - show total */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <IconUsers className="size-4 text-muted-foreground" />
                            <span className="font-medium">
                              {group.aggregated.totalPlayers}
                            </span>
                          </div>
                        </TableCell>

                        {/* Deadline */}
                        <TableCell className="py-3">
                          {group.aggregated.earliestDeadline ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <IconClock className="size-4" />
                              <span>
                                {formatTableDate(
                                  group.aggregated.earliestDeadline
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell
                          className="py-3 pr-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GroupedSeasonRowActions
                            group={group}
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
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} seasons
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <IconChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection Modal */}
      <SeasonCategorySelectionModal
        group={selectedGroup}
        open={isCategorySelectOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedGroup(null);
          setIsCategorySelectOpen(open);
        }}
      />

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
          onSeasonUpdated={async () => {
            handleEditSuccess();
          }}
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
              <span className="font-semibold">
                {deleteSeason?.name ?? "this season"}
              </span>
              ? This action cannot be undone.
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
