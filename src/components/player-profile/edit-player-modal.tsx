"use client";

import * as React from "react";
import { IconLoader2, IconEdit } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";

interface PlayerData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  area: string | null;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

interface EditPlayerModalProps {
  player: PlayerData;
  onUpdate?: (updatedPlayer: PlayerData) => void;
}

export function EditPlayerModal({ player, onUpdate }: EditPlayerModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: player.name || "",
    email: player.email || "",
    phoneNumber: player.phoneNumber || "",
    area: player.area || "",
    bio: player.bio || "",
    gender: player.gender || "",
    dateOfBirth: player.dateOfBirth
      ? new Date(player.dateOfBirth).toISOString().split("T")[0]
      : "",
  });

  // Reset form when player changes
  React.useEffect(() => {
    setFormData({
      name: player.name || "",
      email: player.email || "",
      phoneNumber: player.phoneNumber || "",
      area: player.area || "",
      bio: player.bio || "",
      gender: player.gender || "",
      dateOfBirth: player.dateOfBirth
        ? new Date(player.dateOfBirth).toISOString().split("T")[0]
        : "",
    });
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        endpoints.admin.players.update(player.id),
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim() || null,
          area: formData.area.trim() || null,
          bio: formData.bio.trim() || null,
          gender: formData.gender || null,
          dateOfBirth: formData.dateOfBirth || null,
        }
      );

      if (response.data.success) {
        toast.success("Player updated successfully");
        setOpen(false);
        onUpdate?.(response.data.data);
      }
    } catch (error: unknown) {
      console.error("Failed to update player:", error);
      toast.error(
        getErrorMessage(error, "Failed to update player")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconEdit className="mr-2 size-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Player Profile</DialogTitle>
            <DialogDescription>
              Update player information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Player name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="player@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="area">Location</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                placeholder="City, State"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="A short bio about the player..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
