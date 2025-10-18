"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sponsor } from "../league/types";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

interface EditSponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor: Sponsor | null;
  onSponsorUpdated?: () => void;
}

const PACKAGE_TIERS = ["BRONZE", "SILVER", "GOLD"] as const;

export function EditSponsorModal({
  open,
  onOpenChange,
  sponsor,
  onSponsorUpdated,
}: EditSponsorModalProps) {
  const [formData, setFormData] = useState({
    sponsoredName: "",
    packageTier: "BRONZE",
    contractAmount: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sponsor) {
      setFormData({
        sponsoredName: sponsor.sponsoredName || "",
        packageTier: sponsor.packageTier || "BRONZE",
        contractAmount: sponsor.contractAmount?.toString() || "",
      });
    }
  }, [sponsor]);

  const handleSubmit = async () => {
    if (!sponsor) return;
    setLoading(true);
    try {
      const payload = {
        sponsoredName: formData.sponsoredName,
        packageTier: formData.packageTier,
        contractAmount:
          formData.contractAmount.trim() === ""
            ? undefined
            : Number(formData.contractAmount),
      };

      await axiosInstance.put(endpoints.sponsors.update(sponsor.id), payload);
      toast.success("Sponsor updated!");
      onSponsorUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update sponsor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Sponsor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Sponsor Name"
            value={formData.sponsoredName}
            onChange={(e) =>
              setFormData({ ...formData, sponsoredName: e.target.value })
            }
          />

          <select
            className="w-full p-2 border rounded"
            value={formData.packageTier}
            onChange={(e) =>
              setFormData({ ...formData, packageTier: e.target.value })
            }
          >
            {PACKAGE_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>

          <Input
            placeholder="Contract Amount"
            value={formData.contractAmount}
            onChange={(e) =>
              setFormData({ ...formData, contractAmount: e.target.value })
            }
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Update Sponsor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
