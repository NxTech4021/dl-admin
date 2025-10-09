"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId: string;
  onCategoryCreated?: () => void;
}

// Enum options from your Prisma GenderRestriction enum
const genderOptions = ["OPEN", "MALE", "FEMALE"] as const;

export function CreateCategoryModal({
  open,
  onOpenChange,
  leagueId,
  onCategoryCreated,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    genderRestriction: "OPEN" as (typeof genderOptions)[number],
    matchFormat: "",
    maxPlayers: "",
    maxTeams: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!leagueId) {
      toast.error("League ID is missing");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post(endpoints.categories.create, {
        leagueId,
        name: formData.name,
        genderRestriction: formData.genderRestriction,
        matchFormat: formData.matchFormat,
        maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
        maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : undefined,
      });
      toast.success("Category created!");
      onCategoryCreated?.();
      onOpenChange(false);
      setFormData({
        name: "",
        genderRestriction: "OPEN",
        matchFormat: "",
        maxPlayers: "",
        maxTeams: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="categoryName" className=" mb-2">Category Name</Label>
            <Input
              id="categoryName"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="genderRestriction" className=" mb-2">Gender Restriction</Label>
            <Select
              value={formData.genderRestriction}
              onValueChange={(value) =>
                setFormData({ ...formData, genderRestriction: value as typeof genderOptions[number] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender restriction" className=" mb-2" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="matchFormat" className=" mb-2">Match Format</Label>
            <Input
              id="matchFormat"
              placeholder="e.g., Best of 3 sets"
              value={formData.matchFormat}
              onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="maxPlayers" className=" mb-2">Maximum Players (for singles)</Label>
            <Input
              id="maxPlayers"
              type="number"
              placeholder="Enter max players"
              value={formData.maxPlayers}
              onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="maxTeams" className=" mb-2" >Maximum Teams</Label>
            <Input
              id="maxTeams"
              type="number"
              placeholder="Enter max teams"
              value={formData.maxTeams}
              onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
