"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import { Sponsor } from "@/constants/zod/sponsor-schema";

type PackageTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

const PACKAGE_TIER_OPTIONS: { value: PackageTier; label: string }[] = [
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
];

interface SponsorFormData {
  sponsoredName: string;
  packageTier: PackageTier;
  contractAmount: number | null;
  sponsorRevenue: number | null;
}

interface SponsorEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsorId: string;
  onSponsorUpdated?: () => Promise<void>;
}

export function SponsorEditModal({
  open,
  onOpenChange,
  sponsorId,
  onSponsorUpdated,
}: SponsorEditModalProps) {
  const [formData, setFormData] = useState<SponsorFormData>({
    sponsoredName: "",
    packageTier: "BRONZE",
    contractAmount: null,
    sponsorRevenue: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // Fetch sponsor data on mount
  useEffect(() => {
    if (open && sponsorId) {
      setFetching(true);
      setError("");

      axiosInstance
        .get(endpoints.sponsors.getById(sponsorId))
        .then((res) => {
          const sponsor: Sponsor = res.data.data;
          setFormData({
            sponsoredName: sponsor.sponsoredName || "",
            packageTier: sponsor.packageTier,
            contractAmount: sponsor.contractAmount,
            sponsorRevenue: sponsor.sponsorRevenue,
          });
        })
        .catch((error) => {
          logger.error("Error fetching sponsor:", error);
          setError("Failed to load sponsor data");
        })
        .finally(() => setFetching(false));
    }
  }, [open, sponsorId]);

  const handleSubmit = async () => {
    if (!formData.sponsoredName || !formData.packageTier) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(endpoints.sponsors.update(sponsorId), {
        sponsoredName: formData.sponsoredName,
        packageTier: formData.packageTier,
        contractAmount: formData.contractAmount,
        sponsorRevenue: formData.sponsorRevenue,
      });

      toast.success("Sponsor updated successfully!");
      onOpenChange(false);
      if (onSponsorUpdated) {
        await onSponsorUpdated();
      }
    } catch (err: unknown) {
      logger.error("Error updating sponsor:", err);
      toast.error(getErrorMessage(err, "Failed to update sponsor"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loading</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-2">
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Loading sponsor data...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Sponsor</DialogTitle>
          <DialogDescription>
            Update the sponsorship package details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="sponsoredName">Sponsor Name *</Label>
            <Input
              id="sponsoredName"
              value={formData.sponsoredName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sponsoredName: e.target.value,
                }))
              }
              placeholder="Enter sponsor name"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageTier">Package Tier *</Label>
            <Select
              value={formData.packageTier}
              onValueChange={(value: PackageTier) =>
                setFormData((prev) => ({
                  ...prev,
                  packageTier: value,
                }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select package tier" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_TIER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contractAmount">Contract Amount (RM)</Label>
              <Input
                id="contractAmount"
                type="number"
                step="0.01"
                value={formData.contractAmount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contractAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
                placeholder="0.00"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorRevenue">Sponsor Revenue (RM)</Label>
              <Input
                id="sponsorRevenue"
                type="number"
                step="0.01"
                value={formData.sponsorRevenue || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sponsorRevenue: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  }))
                }
                placeholder="0.00"
                className="h-11"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.sponsoredName ||
              !formData.packageTier
            }
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Sponsor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
