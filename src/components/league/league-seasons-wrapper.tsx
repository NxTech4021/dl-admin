import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SeasonsDataTable } from "@/components/data-table/seasons-data-table";
import { Season } from "@/constants/zod/season-schema";
import { groupSeasonsByName } from "@/lib/group-seasons";
import SeasonCreateModal from "@/components/modal/season-create-modal";
import { Button } from "@/components/ui/button";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { IconPlus, IconCalendar, IconTrophy } from "@tabler/icons-react";
import { toast } from "sonner";
import { Category } from "./types";

interface LeagueSeasonsWrapperProps {
  seasons: Season[];
  leagueId: string;
  leagueName?: string;
  onRefresh?: () => void;
}

export function LeagueSeasonsWrapper({
  seasons,
  leagueId,
  leagueName,
  onRefresh,
}: LeagueSeasonsWrapperProps) {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [seasonsWithPlayers, setSeasonsWithPlayers] = useState<Season[]>([]);
  const [seasonsLoading, setSeasonsLoading] = useState(false);

  // Stable key derived from season IDs to prevent unnecessary re-fetches
  const seasonsKey = useMemo(
    () => seasons.map((s) => s.id).sort().join(","),
    [seasons]
  );
  const seasonsRef = useRef(seasons);
  seasonsRef.current = seasons;

  // Fetch detailed season data with players for each season
  useEffect(() => {
    const currentSeasons = seasonsRef.current;
    if (!currentSeasons || currentSeasons.length === 0) {
      setSeasonsWithPlayers([]);
      return;
    }

    const abortController = new AbortController();

    const fetchSeasonsWithPlayers = async () => {
      setSeasonsLoading(true);
      try {
        // Fetch detailed data for each season using Promise.allSettled to handle partial failures
        const seasonPromises = currentSeasons.map((season) =>
          axiosInstance
            .get(endpoints.season.getById(season.id), {
              signal: abortController.signal,
            })
            .then((response) => (response.data?.data || response.data) as Season)
        );

        const results = await Promise.allSettled(seasonPromises);

        if (abortController.signal.aborted) return;

        // Map results: use fetched data for fulfilled, fallback to original for rejected
        const detailedSeasons = results.map((result, index) =>
          result.status === "fulfilled" ? result.value : currentSeasons[index]
        );

        setSeasonsWithPlayers(detailedSeasons);
      } catch {
        if (abortController.signal.aborted) return;
        // Fallback to original seasons on unexpected failure
        setSeasonsWithPlayers(currentSeasons);
      } finally {
        if (!abortController.signal.aborted) {
          setSeasonsLoading(false);
        }
      }
    };

    fetchSeasonsWithPlayers();

    return () => {
      abortController.abort();
    };
  }, [seasonsKey]);

  // Fetch categories for the league
  const hasFetchedCategories = useRef(false);
  useEffect(() => {
    if (!leagueId) return;

    // Prevent StrictMode double-fetch — leagueId doesn't change between mounts
    if (hasFetchedCategories.current) return;

    const abortController = new AbortController();
    hasFetchedCategories.current = true;

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.categories.getAll, {
          params: { leagueId },
          signal: abortController.signal,
        });
        const categoriesData = response.data?.data || response.data || [];
        setCategories(categoriesData);
      } catch {
        if (abortController.signal.aborted) {
          hasFetchedCategories.current = false;
          return;
        }
        // Fallback to empty categories on fetch failure
        setCategories([]);
        toast.error("Failed to load categories");
      } finally {
        if (!abortController.signal.aborted) {
          setIsCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      abortController.abort();
    };
  }, [leagueId]);

  // Group seasons by name
  const groupedSeasons = useMemo(() => {
    return groupSeasonsByName(seasonsWithPlayers);
  }, [seasonsWithPlayers]);

  const handleViewSeason = (seasonId: string) => {
    navigate({ to: `/seasons/${seasonId}` });
  };

  const handleCreateSeason = () => {
    setIsCreateModalOpen(true);
  };

  const handleSeasonCreated = async () => {
    // Call the refresh callback
    if (onRefresh) {
      onRefresh();
    }
  };

  // Note: Delete functionality should use useConfirmationModal and proper API call
  const handleDeleteSeason = async (_seasonId: string) => {
    // TODO: Implement with useConfirmationModal and proper API call
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Seasons Management</h3>
          <span className="text-sm text-muted-foreground">
            ({seasonsWithPlayers.length} season(s))
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateSeason}
            size="sm"
            className="gap-2"
            disabled={isCategoriesLoading}
          >
            <IconPlus className="w-4 h-4" aria-hidden="true" />
            Create Season
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold">{seasonsWithPlayers.length}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconTrophy className="w-4 h-4 text-green-500" aria-hidden="true" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold">
            {seasonsWithPlayers.filter((s) => s.status === "ACTIVE").length}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span className="text-sm font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold">
            {seasonsWithPlayers.filter((s) => s.status === "UPCOMING").length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <SeasonsDataTable
        data={groupedSeasons}
        isLoading={seasonsLoading}
        onViewSeason={handleViewSeason}
        onRefresh={onRefresh}
      />

      {/* Modals */}
      <SeasonCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        leagueId={leagueId}
        leagueName={leagueName}
        categories={categories}
        onSeasonCreated={handleSeasonCreated}
      />
    </div>
  );
}
