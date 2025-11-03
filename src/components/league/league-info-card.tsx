"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrophy, IconMapPin, IconCalendar, IconUser, IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { League, GetLocationLabelFunction, GetSportLabelFunction, GetStatusBadgeFunction, FormatDateFunction } from "./types";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface LeagueInfoCardProps {
  league: League;
  getLocationLabel: GetLocationLabelFunction;
  getSportLabel: GetSportLabelFunction;
  getStatusBadge: GetStatusBadgeFunction;
  formatDate: FormatDateFunction;
  onLeagueUpdated?: () => Promise<void>;
}

export function LeagueInfoCard({ 
  league, 
  getLocationLabel, 
  getSportLabel, 
  getStatusBadge, 
  formatDate,
  onLeagueUpdated 
}: LeagueInfoCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: league.name,
    description: league.description || "",
    location: league.location || "",
    sportType: league.sportType,
    gameType: league.gameType,
    status: league.status,
    joinType: league.joinType
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put(endpoints.league.getById(league.id), editForm);
      toast.success("League updated successfully");
      setIsEditing(false);
      if (onLeagueUpdated) {
        await onLeagueUpdated();
      }
    } catch (error) {
      console.error("Error updating league:", error);
      toast.error("Failed to update league");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <IconTrophy className="size-8 text-primary" />
            </div>
            {isEditing ? (
              <div className="space-y-2 flex-1">
                <Input
                  value={editForm.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="font-semibold text-lg"
                  placeholder="League Name"
                />
                <Select
                  value={editForm.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="FINISHED">Finished</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <CardTitle className="text-2xl">{league.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {getStatusBadge(league.status)}
                  <span className="capitalize">
                    {getSportLabel(league.sportType)}
                  </span>
                  <span className="capitalize">
                    {league.joinType?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <IconCheck className="size-4" />
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <IconX className="size-4" />
                </Button>
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <IconEdit className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit League</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-3">
          {isEditing ? (
            <>
              <Select
                value={editForm.location}
                onValueChange={(value) => handleChange("location", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add your location options here */}
                </SelectContent>
              </Select>

              <Select
                value={editForm.sportType}
                onValueChange={(value) => handleChange("sportType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENNIS">Tennis</SelectItem>
                  <SelectItem value="PICKLEBALL">Pickleball</SelectItem>
                  <SelectItem value="PADEL">Padel</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={editForm.gameType}
                onValueChange={(value) => handleChange("gameType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLES">Singles</SelectItem>
                  <SelectItem value="DOUBLES">Doubles</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                value={editForm.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="League description..."
                className="min-h-[100px]"
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconMapPin className="size-4" />
                <span>{getLocationLabel(league.location || "Location not set")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconTrophy className="size-4" />
                <span className="capitalize">{league.gameType.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconCalendar className="size-4" />
                <span>Created on {formatDate(league.createdAt)}</span>
              </div>
              {league.createdBy && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconUser className="size-4" />
                  <span>Created by {league.createdBy.user.name}</span>
                </div>
              )}
            </>
          )}
        </div>

        {!isEditing && league.description && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground italic">
              &quot;{league.description}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
