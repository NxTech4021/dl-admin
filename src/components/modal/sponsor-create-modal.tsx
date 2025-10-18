"use client";

import { useState } from "react";
import { TierType } from "@/components/league/types";
import { toast } from "sonner";
import { IconBuildingStore } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance, { endpoints } from "@/lib/endpoints";

interface CreateSponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId: string;
  onSponsorCreated?: () => void;
}

interface SponsorFormData {
  sponsoredName: string;
  packageTier: TierType;
  contractAmount: string;
  sponsorRevenue: string;
}

const TIER_OPTIONS: { value: TierType; label: string }[] = [
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
];

export function CreateSponsorModal({
  open,
  onOpenChange,
  leagueId,
  onSponsorCreated,
}: CreateSponsorModalProps) {
  const [formData, setFormData] = useState<SponsorFormData>({
    sponsoredName: "",
    packageTier: "BRONZE",
    contractAmount: "",
    sponsorRevenue: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof SponsorFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.sponsoredName || !formData.packageTier) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(endpoints.sponsors.create, {
        ...formData,
        leagueIds: [leagueId],
        contractAmount:
          formData.contractAmount !== ""
            ? Number(formData.contractAmount)
            : null,
        sponsorRevenue:
          formData.sponsorRevenue !== "" ? Number(formData.sponsorRevenue) : null,
      });

      toast.success("Sponsor created successfully!");
      onOpenChange(false);
      if (onSponsorCreated) {
        await onSponsorCreated();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create sponsor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBuildingStore className="size-5" />
            Create Sponsor
          </DialogTitle>
          <DialogDescription>
            Add a new sponsor to this league.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sponsoredName">Sponsor Name *</Label>
            <Input
              id="sponsoredName"
              value={formData.sponsoredName}
              onChange={(e) => handleChange("sponsoredName", e.target.value)}
              placeholder="Enter sponsor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageTier">Package Tier *</Label>
            <Select
              value={formData.packageTier}
              onValueChange={(value: TierType) =>
                handleChange("packageTier", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractAmount">Contract Amount</Label>
              <Input
                id="contractAmount"
                type="number"
                value={formData.contractAmount}
                onChange={(e) => handleChange("contractAmount", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorRevenue">Expected Revenue</Label>
              <Input
                id="sponsorRevenue"
                type="number"
                value={formData.sponsorRevenue}
                onChange={(e) => handleChange("sponsorRevenue", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.sponsoredName ||
              !formData.packageTier
            }
          >
            {loading ? "Creating..." : "Create Sponsor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
