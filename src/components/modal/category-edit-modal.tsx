"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IconLoader2, IconTrophy, IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { logger } from "@/lib/logger";
import { Category } from "@/constants/zod/category-schema";

const formatGender = (restriction: string): string => {
  switch (restriction) {
    case "MALE": return "Male";
    case "FEMALE": return "Female";
    case "MIXED": return "Mixed";
    case "OPEN": return "Open";
    default: return restriction;
  }
};

const formatGameType = (gameType: string | null): string => {
  if (!gameType) return "Not set";
  return gameType.charAt(0) + gameType.slice(1).toLowerCase();
};

const getGenderBadgeClass = (restriction: string): string => {
  switch (restriction) {
    case "MALE":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "FEMALE":
      return "text-pink-700 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800";
    case "MIXED":
      return "text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800";
    case "OPEN":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

const getGameTypeBadgeClass = (gameType: string | null): string => {
  switch (gameType) {
    case "SINGLES":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "DOUBLES":
      return "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
  }
};

const getStatusBadgeClass = (isActive: boolean): string => {
  if (isActive) {
    return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
  }
  return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-700";
};

interface CategoryEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onCategoryUpdated?: () => Promise<void>;
}

export default function CategoryEditModal({
  open,
  onOpenChange,
  categoryId,
}: CategoryEditModalProps) {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (open && categoryId) {
      setFetching(true);
      setError("");

      axiosInstance
        .get(endpoints.categories.getById(categoryId))
        .then((res) => {
          const categoryData = res.data?.data;
          if (categoryData) {
            setCategory(categoryData);
          }
        })
        .catch((err) => {
          logger.error("Error fetching category:", err);
          setError("Failed to load category data");
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [open, categoryId]);

  const handleClose = () => {
    setCategory(null);
    setError("");
    onOpenChange(false);
  };

  // Note: leagues may come from API but not in schema - use type assertion
  const leagues = (category as Category & { leagues?: Array<{ id: string; name: string }> })?.leagues || [];
  const seasons = category?.seasons || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : category ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">{category.name}</DialogTitle>
              {category.matchFormat && (
                <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                  {category.matchFormat}
                </code>
              )}
            </DialogHeader>

            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn("text-xs border", getStatusBadgeClass(category.isActive))}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className={cn("text-xs border", getGenderBadgeClass(category.genderRestriction))}>
                  {formatGender(category.genderRestriction)}
                </Badge>
                {category.gameType && (
                  <Badge variant="outline" className={cn("text-xs border", getGameTypeBadgeClass(category.gameType))}>
                    {formatGameType(category.gameType)}
                  </Badge>
                )}
              </div>

              {/* Leagues */}
              {leagues.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconTrophy className="size-3.5" />
                    <span>Leagues</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {leagues.map((league: any) => (
                      <Badge key={league.id} variant="secondary" className="text-xs">
                        {league.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasons */}
              {seasons.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconCalendar className="size-3.5" />
                    <span>Seasons</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seasons.map((season: any) => (
                      <Badge key={season.id} variant="outline" className="text-xs">
                        {season.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {leagues.length === 0 && seasons.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No leagues or seasons assigned to this category.
                </p>
              )}

              {/* Created date */}
              {category.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
                  <IconCalendar className="size-3.5" />
                  <span>Created {new Date(category.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
