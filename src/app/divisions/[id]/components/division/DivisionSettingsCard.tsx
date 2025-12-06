"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { Division } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import {
  IconSettings,
  IconToggleLeft,
  IconTrash,
  IconRefresh,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface DivisionSettingsCardProps {
  division: Division;
  onDivisionUpdated: () => Promise<void>;
}

export default function DivisionSettingsCard({
  division,
  onDivisionUpdated,
}: DivisionSettingsCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.put(endpoints.division.update(division.id), {
        isActive: !division.isActive,
      });
      toast.success(
        division.isActive
          ? "Division deactivated successfully"
          : "Division activated successfully"
      );
      await onDivisionUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAutoAssignment = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.put(endpoints.division.update(division.id), {
        autoAssignmentEnabled: !division.autoAssignmentEnabled,
      });
      toast.success(
        division.autoAssignmentEnabled
          ? "Auto-assignment disabled"
          : "Auto-assignment enabled"
      );
      await onDivisionUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update auto-assignment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDivision = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(endpoints.division.delete(division.id));
      toast.success("Division deleted successfully");
      router.push("/divisions");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete division");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Status Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IconToggleLeft className="size-4" />
              Division Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="active-status" className="font-medium">
                  Active Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  When inactive, this division will not accept new players or matches.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={division.isActive ? "default" : "secondary"}
                  className={
                    division.isActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : ""
                  }
                >
                  {division.isActive ? "Active" : "Inactive"}
                </Badge>
                <Switch
                  id="active-status"
                  checked={division.isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-assignment" className="font-medium">
                    Auto Assignment
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign players to this division based on their rating.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={division.autoAssignmentEnabled ? "default" : "secondary"}>
                    {division.autoAssignmentEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    id="auto-assignment"
                    checked={division.autoAssignmentEnabled || false}
                    onCheckedChange={handleToggleAutoAssignment}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IconSettings className="size-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Division Level</Label>
                <p className="font-medium capitalize">{division.divisionLevel}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Game Type</Label>
                <p className="font-medium capitalize">{division.gameType}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Gender Category</Label>
                <p className="font-medium capitalize">
                  {division.genderCategory || "Open"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Rating Threshold</Label>
                <p className="font-medium">
                  {division.threshold ? `${division.threshold} pts` : "None"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">
                  {division.gameType === "singles" ? "Max Singles" : "Max Teams"}
                </Label>
                <p className="font-medium">
                  {division.gameType === "singles"
                    ? division.maxSingles || "Unlimited"
                    : division.maxDoublesTeams || "Unlimited"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Season</Label>
                <p className="font-medium">
                  {(division as any).season?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <IconTrash className="size-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="font-medium text-destructive">Delete Division</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this division and all associated data. This action
                  cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                disabled={isDeleting}
              >
                <IconTrash className="mr-2 size-4" />
                Delete Division
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Division</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{division.name}&quot;? This will
              permanently remove the division and all player assignments. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDivision}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Division"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
