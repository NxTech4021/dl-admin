"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Division } from "@/constants/zod/division-schema";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconTrophy,
  IconUsers,
  IconTarget,
  IconCalendar,
} from "@tabler/icons-react";

interface DivisionDetailsSectionProps {
  division: Division;
  onDivisionUpdated: () => Promise<void>;
}

export default function DivisionDetailsSection({
  division,
  onDivisionUpdated,
}: DivisionDetailsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: division.name,
    description: division.description || "",
    threshold: division.threshold || "",
    maxSingles: division.maxSingles || "",
    maxDoublesTeams: division.maxDoublesTeams || "",
    prizePoolTotal: division.prizePoolTotal || "",
    sponsoredDivisionName: division.sponsoredDivisionName || "",
    isActive: division.isActive,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put(endpoints.division.update(division.id), {
        name: editData.name,
        description: editData.description || null,
        threshold: editData.threshold ? Number(editData.threshold) : null,
        maxSingles: editData.maxSingles ? Number(editData.maxSingles) : null,
        maxDoublesTeams: editData.maxDoublesTeams ? Number(editData.maxDoublesTeams) : null,
        prizePoolTotal: editData.prizePoolTotal ? Number(editData.prizePoolTotal) : null,
        sponsoredDivisionName: editData.sponsoredDivisionName || null,
        isActive: editData.isActive,
      });
      toast.success("Division updated successfully");
      setIsEditing(false);
      await onDivisionUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update division");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: division.name,
      description: division.description || "",
      threshold: division.threshold || "",
      maxSingles: division.maxSingles || "",
      maxDoublesTeams: division.maxDoublesTeams || "",
      prizePoolTotal: division.prizePoolTotal || "",
      sponsoredDivisionName: division.sponsoredDivisionName || "",
      isActive: division.isActive,
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <IconInfoCircle className="size-4" />
          Division Details
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <IconEdit className="mr-2 size-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <IconCheck className="mr-2 size-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
              <IconX className="mr-2 size-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          {isEditing ? (
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Division name"
            />
          ) : (
            <p className="text-sm font-medium">{division.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Description</label>
          {isEditing ? (
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Division description"
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {division.description || "No description provided"}
            </p>
          )}
        </div>

        {/* Division Configuration */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconTrophy className="size-4" />
              Level
            </label>
            <Badge variant="outline" className="capitalize">
              {division.divisionLevel}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconUsers className="size-4" />
              Game Type
            </label>
            <Badge variant="outline" className="capitalize">
              {division.gameType}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IconTarget className="size-4" />
              Rating Threshold
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={editData.threshold}
                onChange={(e) => setEditData({ ...editData, threshold: e.target.value })}
                placeholder="Minimum rating"
              />
            ) : (
              <p className="text-sm font-medium">
                {division.threshold ? `${division.threshold} pts` : "No threshold"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {division.gameType === "singles" ? "Max Singles" : "Max Doubles Teams"}
            </label>
            {isEditing ? (
              division.gameType === "singles" ? (
                <Input
                  type="number"
                  value={editData.maxSingles}
                  onChange={(e) => setEditData({ ...editData, maxSingles: e.target.value })}
                  placeholder="Max players"
                />
              ) : (
                <Input
                  type="number"
                  value={editData.maxDoublesTeams}
                  onChange={(e) => setEditData({ ...editData, maxDoublesTeams: e.target.value })}
                  placeholder="Max teams"
                />
              )
            ) : (
              <p className="text-sm font-medium">
                {division.gameType === "singles"
                  ? division.maxSingles || "Unlimited"
                  : division.maxDoublesTeams || "Unlimited"}
              </p>
            )}
          </div>
        </div>

        {/* Prize & Sponsor */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Prize Pool (MYR)</label>
            {isEditing ? (
              <Input
                type="number"
                value={editData.prizePoolTotal}
                onChange={(e) => setEditData({ ...editData, prizePoolTotal: e.target.value })}
                placeholder="Prize pool amount"
              />
            ) : (
              <p className="text-sm font-medium text-green-600">
                {division.prizePoolTotal
                  ? `MYR ${division.prizePoolTotal.toLocaleString()}`
                  : "Not set"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Sponsor Name</label>
            {isEditing ? (
              <Input
                value={editData.sponsoredDivisionName}
                onChange={(e) => setEditData({ ...editData, sponsoredDivisionName: e.target.value })}
                placeholder="Sponsor name"
              />
            ) : (
              <p className="text-sm font-medium">
                {division.sponsoredDivisionName || "No sponsor"}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          {isEditing ? (
            <Select
              value={editData.isActive ? "active" : "inactive"}
              onValueChange={(value) => setEditData({ ...editData, isActive: value === "active" })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant={division.isActive ? "default" : "secondary"}
              className={division.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
            >
              {division.isActive ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>

        {/* Timestamps */}
        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <IconCalendar className="size-3" />
              Created
            </label>
            <p className="text-sm">{formatDate(division.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <IconCalendar className="size-3" />
              Last Updated
            </label>
            <p className="text-sm">{formatDate(division.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
