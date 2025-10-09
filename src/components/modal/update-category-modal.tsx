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
          <Input
            placeholder="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            value={formData.genderRestriction}
            onValueChange={(value) => setFormData({ ...formData, genderRestriction: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Gender Restriction" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Match Format"
            value={formData.matchFormat}
            onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
          />
          <Input
            placeholder="Max Players"
            type="number"
            value={formData.maxPlayers}
            onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
          />
          <Input
            placeholder="Max Teams"
            type="number"
            value={formData.maxTeams}
            onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <span>Active</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
