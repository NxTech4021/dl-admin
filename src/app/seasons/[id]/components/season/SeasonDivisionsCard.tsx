"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tableContainerVariants, tableRowVariants, fastTransition } from "@/lib/animation-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  IconPlus,
  IconTrophy,
  IconCategory,
  IconUsers,
  IconUser,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import DivisionCreateModal from "@/components/modal/division-create-modal";
import { Division } from "@/constants/zod/division-schema";
import { DivisionRowActions } from "@/components/division/division-row-actions";
import { DivisionDetailModal } from "@/components/division/division-detail-modal";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { cn, formatDivisionLevel } from "@/lib/utils";

type SeasonWithCategory = {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string | null;
    game_type?: "SINGLES" | "DOUBLES" | string | null;
    gender_category?: "MALE" | "FEMALE" | "MIXED" | string | null;
    genderCategory?: string | null;
    gameType?: string | null;
  } | null;
};

interface SeasonDivisionsCardProps {
  seasonId: string;
  adminId: string;
  divisions: Division[];
  isLoading?: boolean;
  onDivisionCreated?: () => Promise<void>;
  onDivisionUpdated?: () => Promise<void>;
  onDivisionDeleted?: () => Promise<void>;
  /** Pass the season object to auto-populate and lock fields when creating divisions */
  season?: SeasonWithCategory | null;
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

export default function SeasonDivisionsCard({
  seasonId,
  adminId,
  divisions,
  isLoading = false,
  onDivisionCreated,
  onDivisionUpdated,
  onDivisionDeleted,
  season,
}: SeasonDivisionsCardProps) {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deleteDivision, setDeleteDivision] = useState<Division | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // View modal state
  const [viewDivision, setViewDivision] = useState<Division | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const sortedDivisions = React.useMemo(() => {
    return divisions.slice().sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aDate - bDate; // OLDEST to NEWEST
    });
  }, [divisions]);
  const totalPages = Math.ceil(sortedDivisions.length / pageSize);
  const paginatedDivisions = sortedDivisions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDivisionCreated = () => {
    onDivisionCreated?.();
  };

  const handleViewDivision = (division: Division) => {
    setViewDivision(division);
    setIsViewOpen(true);
  };

  const handleEditDivision = (division: Division) => {
    setEditingDivision(division);
    setIsEditModalOpen(true);
  };

  const handleDivisionUpdated = () => {
    onDivisionUpdated?.();
    setIsEditModalOpen(false);
    setEditingDivision(null);
  };

  const handleDeleteRequest = (division: Division) => {
    setDeleteDivision(division);
    setIsDeleteOpen(true);
  };

  const handleDeleteDivision = async () => {
    if (!deleteDivision) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(endpoints.division.delete(deleteDivision.id));
      toast.success("Division deleted successfully");
      onDivisionDeleted?.();
    } catch (error) {
      console.error("Failed to delete division:", error);
      toast.error("Failed to delete division");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteDivision(null);
    }
  };

  const handleManagePlayers = (division: Division) => {
    navigate({ to: "/divisions/$divisionId", params: { divisionId: division.id }, search: { tab: "players" } });
  };

  // Map editingDivision for the modal
  const mappedEditDivision = React.useMemo(() => {
    if (!editingDivision) return null;
    return {
      id: editingDivision.id,
      seasonId: editingDivision.seasonId,
      name: editingDivision.name,
      description: editingDivision.description ?? null,
      threshold: editingDivision.threshold ?? null,
      divisionLevel: editingDivision.divisionLevel,
      gameType: editingDivision.gameType,
      genderCategory: editingDivision.genderCategory ?? null,
      maxSingles: editingDivision.maxSingles ?? null,
      maxDoublesTeams: editingDivision.maxDoublesTeams ?? null,
      autoAssignmentEnabled: editingDivision.autoAssignmentEnabled ?? false,
      isActive: editingDivision.isActive,
      prizePoolTotal: editingDivision.prizePoolTotal ?? null,
      sponsoredDivisionName: editingDivision.sponsoredDivisionName ?? null,
    };
  }, [editingDivision]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            <span className="text-lg font-semibold">Divisions</span>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with title and create button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconTrophy className="size-5" />
            <span className="text-lg font-semibold">Divisions ({divisions.length})</span>
          </div>
          <DivisionCreateModal
            open={isCreateModalOpen}
            adminId={adminId}
            onOpenChange={setIsCreateModalOpen}
            onDivisionCreated={handleDivisionCreated}
            seasonId={seasonId}
            season={season}
          >
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <IconPlus className="size-4" />
              Create Division
            </Button>
          </DivisionCreateModal>
        </div>

        {/* Table Container */}
        <div className="rounded-lg border bg-card">
          {paginatedDivisions.length > 0 ? (
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[50px] py-2.5 pl-4 font-medium text-xs">#</TableHead>
                    <TableHead className="py-2.5 font-medium text-xs">Division</TableHead>
                    <TableHead className="w-[110px] py-2.5 font-medium text-xs">Level</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Type</TableHead>
                    <TableHead className="w-[100px] py-2.5 font-medium text-xs">Rating</TableHead>
                    <TableHead className="w-[150px] py-2.5 font-medium text-xs">Capacity</TableHead>
                    <TableHead className="w-[90px] py-2.5 font-medium text-xs">Status</TableHead>
                    <TableHead className="w-[50px] py-2.5 pr-4 font-medium text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  initial="hidden"
                  animate="visible"
                  variants={tableContainerVariants}
                >
                  {paginatedDivisions.map((division, index) => {
                    const isDoubles = division.gameType?.toLowerCase() === "doubles";
                    const currentCount = isDoubles ? (division.currentDoublesCount || 0) : (division.currentSinglesCount || 0);
                    const maxCount = isDoubles ? division.maxDoublesTeams : division.maxSingles;
                    const capacity = getCapacityDisplay(currentCount, maxCount);

                    return (
                      <motion.tr
                        key={division.id}
                        variants={tableRowVariants}
                        transition={fastTransition}
                        className="hover:bg-muted/30 border-b transition-colors"
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
                              {division.description && (
                                <span className="text-xs text-muted-foreground truncate block max-w-[200px]">
                                  {division.description}
                                </span>
                              )}
                            </div>
                          </div>
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

                        {/* Rating */}
                        <TableCell className="py-3">
                          <span className="text-sm">
                            {division.threshold ? `${division.threshold}+ pts` : "—"}
                          </span>
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

                        {/* Actions */}
                        <TableCell className="py-3 pr-4">
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
          ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <IconTrophy className="size-12 opacity-50" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">No divisions found</p>
                  <p className="text-sm">
                    Create your first division to get started
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, divisions.length)} of {divisions.length} divisions
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
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDivision(null);
          }
          setIsEditModalOpen(open);
        }}
        mode="edit"
        division={mappedEditDivision}
        seasonId={seasonId}
        adminId={adminId}
        onDivisionCreated={handleDivisionUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Division</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDivision?.name}
              &quot;? This action cannot be undone.
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
