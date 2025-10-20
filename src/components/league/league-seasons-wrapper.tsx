"use client";

import React, { useState } from "react";
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

interface LeagueSeasonsWrapperProps {
  seasons: Season[];
  leagueId: string;
}

export function LeagueSeasonsWrapper({ seasons, leagueId }: LeagueSeasonsWrapperProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleViewSeason = (seasonId: string) => {
    window.location.href = `/seasons/${seasonId}`;
  };

  const handleCreateSeason = () => {
    console.log("Create season button clicked!");
    console.log("Current isCreateModalOpen state:", isCreateModalOpen);
    setIsCreateModalOpen(true);
    console.log("Set isCreateModalOpen to true");
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

  const handleCreateSubmit = async (seasonData: any) => {
    console.log("Creating season:", seasonData);
    console.log("League ID:", leagueId);

    if (!seasonData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (isCreating) {
      console.log("Already creating, ignoring duplicate submission");
      return;
    }

    setIsCreating(true);

    try {
      // Prepare the data for the API (backend expects leagueIds array and specific status enum)
      const normalizedStatus = seasonData.status === 'DRAFT' ? 'UPCOMING' : seasonData.status;

      // TODO: Auto-create category logic commented out for now
      // This was implemented to automatically create a category when user types a name instead of selecting from dropdown
      // The logic would:
      // 1. Check if categoryId is a valid UUID
      // 2. If not, create a new category with the typed name
      // 3. Use the created category's ID for the season
      // 
      // let effectiveCategoryId: string = seasonData.categoryId;
      // const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      // if (effectiveCategoryId && !uuidLike.test(effectiveCategoryId)) {
      //   console.log("No valid categoryId provided, creating category with name:", effectiveCategoryId);
      //   try {
      //     const createCatRes = await axiosInstance.post(endpoints.categories.create, {
      //       leagueId,
      //       name: effectiveCategoryId,
      //     });
      //     const created = createCatRes.data?.data || createCatRes.data;
      //     effectiveCategoryId = created?.id || created?.data?.id || created?.category?.id;
      //     if (!effectiveCategoryId) throw new Error("Category create did not return an ID");
      //     console.log("Created category id:", effectiveCategoryId);
      //   } catch (catErr) {
      //     console.error("Failed to create category:", catErr);
      //     toast.error("Failed to create category. Please provide a valid category or try again.");
      //     return;
      //   }
      // }

      // Use the selected categoryId from the dropdown
      const effectiveCategoryId = seasonData.categoryId;

      const apiData = {
        name: seasonData.name,
        description: seasonData.description,
        status: normalizedStatus,
        startDate: seasonData.startDate?.toISOString(),
        endDate: seasonData.endDate?.toISOString(),
        regiDeadline: seasonData.regiDeadline?.toISOString(),
        entryFee: seasonData.entryFee?.toString?.() ?? String(seasonData.entryFee ?? 0),
        isActive: !!seasonData.isActive,
        paymentRequired: !!seasonData.paymentRequired,
        promoCodeSupported: !!seasonData.promoCodeSupported,
        withdrawalEnabled: !!seasonData.withdrawalEnabled,
        categoryId: effectiveCategoryId,
        leagueIds: [leagueId],
      };

      console.log("API Data:", apiData);

      const response = await axiosInstance.post(endpoints.season.create, apiData);
      console.log("Season created successfully:", response.data);

      toast.success("Season created successfully!");
      setIsCreateModalOpen(false);

      // Refresh the page to show the new season
      window.location.reload();
    } catch (error: any) {
      console.error("Error creating season:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to create season";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
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
          <Badge variant="secondary">{seasons.length} season(s)</Badge>
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
        onEditSeason={handleEditSeason}
        onDeleteSeason={handleDeleteSeason}
      />

      {/* Modals */}
      <SeasonCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        leagueId={leagueId}
        isLoading={isCreating}
      />

      <SeasonCreateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSeason(null);
        }}
        onSubmit={handleEditSubmit}
        leagueId={leagueId}
        season={editingSeason}
      />
    </div>
  );
}
