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

type GameType = "SINGLES" | "DOUBLES" | "MIXED";
type GenderType = "MEN" | "WOMEN" | "MIXED";

const GAME_TYPE_OPTIONS: { value: GameType; label: string }[] = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
  { value: "MIXED", label: "Mixed" },
];

const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "MIXED", label: "Mixed" },
];

// Update the form data interface
interface CategoryFormData {
  name: string;
  matchFormat: string;
  maxPlayers: string;
  maxTeams: string;
  game_type: GameType;
  gender_category: GenderType;
}

export function CreateCategoryModal({
  open,
  onOpenChange,
  leagueId,
  onCategoryCreated,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    matchFormat: "",
    maxPlayers: "",
    maxTeams: "",
    game_type: "SINGLES",
    gender_category: "MIXED"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!leagueId) {
      toast.error("League ID is missing");
      return;
    }
    setLoading(true);
    try {
      // Map gender_category to genderRestriction
      const genderRestriction = formData.gender_category === "MIXED" ? "OPEN" : 
                               formData.gender_category === "MEN" ? "MALE" : "FEMALE";

      await axiosInstance.post(endpoints.categories.create, {
        leagueId,
        name: formData.name,
        genderRestriction,
        matchFormat: formData.matchFormat,
        maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
        maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : undefined,
        game_type: formData.game_type,
        gender_category: formData.gender_category
      });

      toast.success("Category created!");
      onCategoryCreated?.();
      onOpenChange(false);
      setFormData({
        name: "",
        matchFormat: "",
        maxPlayers: "",
        maxTeams: "",
        game_type: "SINGLES",
        gender_category: "MIXED"
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

          {/* Game Type Selection */}
          <div>
            <Label htmlFor="gameType" className=" mb-2">Game Type</Label>
            <Select
              value={formData.game_type}
              onValueChange={(value: GameType) => 
                setFormData({ ...formData, game_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select game type" className=" mb-2" />
              </SelectTrigger>
              <SelectContent>
                {GAME_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Category Selection */}
          <div>
            <Label htmlFor="genderCategory" className=" mb-2">Gender Category</Label>
            <Select
              value={formData.gender_category}
              onValueChange={(value: GenderType) => 
                setFormData({ ...formData, gender_category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender category" className=" mb-2" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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

          {/* Conditional rendering based on game type */}
          {formData.game_type === "SINGLES" ? (
            <div>
              <Label htmlFor="maxPlayers" className=" mb-2">Maximum Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                placeholder="Enter max players"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
              />
            </div>
          ) : (
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
          )}
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
