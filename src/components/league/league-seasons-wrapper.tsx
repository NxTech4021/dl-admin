"use client";

import React, { useState, useEffect } from "react";
import { SeasonsDataTable } from "@/components/data-table/seasons-data-table";
import { Season } from "@/ZodSchema/season-schema";
import SeasonCreateModal from "@/components/modal/season-create-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { 
  IconPlus, 
  IconCalendar,
  IconTrophy
} from "@tabler/icons-react";

interface Category {
  id: string;
  name: string | null;
  genderRestriction: string;
  matchFormat: string | null;
  game_type: string | null;
  league: {
    id: string;
    name: string;
    sportType: string;
  } | null;
  seasons: Array<{
    id: string;
    name: string;
  }>;
}

interface LeagueSeasonsWrapperProps {
  seasons: Season[];
  leagueId: string;
  leagueName?: string;
  onRefresh?: () => void;
}

export function LeagueSeasonsWrapper({ seasons, leagueId, leagueName, onRefresh }: LeagueSeasonsWrapperProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch categories for the league
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.categories.getAll, {
          params: { leagueId }
        });
        const categoriesData = response.data?.data || response.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (leagueId) {
      fetchCategories();
    }
  }, [leagueId]);

  const handleViewSeason = (seasonId: string) => {
    window.location.href = `/seasons/${seasonId}`;
  };

  const handleCreateSeason = () => {
    console.log("Create season button clicked!");
    console.log("Current isCreateModalOpen state:", isCreateModalOpen);
    setIsCreateModalOpen(true);
    console.log("Set isCreateModalOpen to true");
  };

  const handleSeasonCreated = async () => {
    // Call the refresh callback if provided, otherwise fallback to page reload
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleEditSeason = (seasonId: string) => {
    const season = seasons.find(s => s.id === seasonId);
    if (season) {
      setEditingSeason(season);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    if (!confirm("Are you sure you want to delete this season?")) {
      return;
    }
    
    try {
      // TODO: Implement actual delete API call
      console.log("Delete season:", seasonId);
      // For now, just refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete season:", error);
    }
  };


  const handleEditSubmit = (seasonData: any) => {
    // TODO: Implement actual API call to update season
    console.log("Updating season:", editingSeason?.id, seasonData);
    
    // For now, just refresh the page
    window.location.reload();
    setIsEditModalOpen(false);
    setEditingSeason(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Seasons Management</h3>
          <span className="text-sm text-muted-foreground">({seasons.length} season(s))</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateSeason} size="sm" className="gap-2">
            <IconPlus className="w-4 h-4" />
            Create Season
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold">{seasons.length}</p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconTrophy className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold">
            {seasons.filter(s => s.status === 'ACTIVE').length}
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold">
            {seasons.filter(s => s.status === 'UPCOMING').length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <SeasonsDataTable 
        data={seasons} 
        isLoading={false}
        onViewSeason={handleViewSeason}
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
