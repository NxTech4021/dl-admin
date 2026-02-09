"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { logger } from "@/lib/logger";

interface SponsorshipCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export default function SponsorshipCreateModal({ open, onOpenChange, onCreated }: SponsorshipCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [sponsoredName, setSponsoredName] = React.useState("");
  const [packageTier, setPackageTier] = React.useState<string>("");
  const [contractAmount, setContractAmount] = React.useState<string>("");

  const resetForm = () => {
    setSponsoredName("");
    setPackageTier("");
    setContractAmount("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsoredName.trim()) {
      toast.error("Sponsor name is required");
      return;
    }
    if (!packageTier) {
      toast.error("Please select a package tier");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sponsoredName: sponsoredName.trim() || undefined,
        packageTier,
        contractAmount: contractAmount ? Number(contractAmount) : undefined,
      };
      logger.debug("Creating sponsorship with payload:", payload);
      
      await axiosInstance.post(endpoints.sponsors.create, payload);
      toast.success("Sponsorship created");
      onOpenChange(false);
      resetForm();
      onCreated?.();
    } catch (err) {
      logger.error(err);
      toast.error("Failed to create sponsorship");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Sponsorship</DialogTitle>
          <DialogDescription>
            Add a new sponsorship with company information and package tier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sponsoredName">Sponsor Name</Label>
            <Input
              id="sponsoredName"
              placeholder="e.g. Nike Malaysia or Nike Open 2025"
              value={sponsoredName}
              onChange={(e) => setSponsoredName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Package tier</Label>
            <Select value={packageTier} onValueChange={setPackageTier}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractAmount">Contract amount (optional)</Label>
            <Input
              id="contractAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 10000.00"
              value={contractAmount}
              onChange={(e) => setContractAmount(e.target.value)}
            />
          </div>


          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


