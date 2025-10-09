"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Category } from "../league/types";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onCategoryUpdated?: () => void;
  leagueId: string;
}

const GENDER_OPTIONS = ["OPEN", "MALE", "FEMALE"];

export function EditCategoryModal({
  open,
  onOpenChange,
  category,
  onCategoryUpdated,
  leagueId,
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    genderRestriction: "OPEN",
    matchFormat: "",
    maxPlayers: "",
    maxTeams: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        genderRestriction: category.genderRestriction || "OPEN",
        matchFormat: category.matchFormat || "",
        maxPlayers: category.maxPlayers?.toString() || "",
        maxTeams: category.maxTeams?.toString() || "",
        isActive: category.isActive,
      });
    }
  }, [category]);

  const handleSubmit = async () => {
    if (!category) return;
    setLoading(true);
    try {
      await axiosInstance.put(endpoints.categories.update(category.id), {
        ...formData,
        maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : null,
        maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : null,
        leagueId,
      });
      toast.success("Category updated!");
      onCategoryUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="categoryName" className="mb-1">Category Name</Label>
            <Input
              id="categoryName"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="genderRestriction" className="mb-1">Gender Restriction</Label>
            <Select
              value={formData.genderRestriction}
              onValueChange={(value) => setFormData({ ...formData, genderRestriction: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender restriction" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="matchFormat" className="mb-1">Match Format</Label>
            <Input
              id="matchFormat"
              placeholder="e.g., Best of 3 sets"
              value={formData.matchFormat}
              onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxPlayers" className="mb-1">Max Players (singles)</Label>
              <Input
                id="maxPlayers"
                type="number"
                placeholder="Enter max players"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxTeams" className="mb-1">Max Teams (doubles/team)</Label>
              <Input
                id="maxTeams"
                type="number"
                placeholder="Enter max teams"
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <span>Active</span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
