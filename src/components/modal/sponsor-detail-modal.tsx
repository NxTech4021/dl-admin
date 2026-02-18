"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2, IconEdit, IconCalendar, IconTrophy, IconCurrencyDollar } from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { sponsorSchema, Sponsor } from "@/constants/zod/sponsor-schema";
import { logger } from "@/lib/logger";

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getPackageTierBadgeVariant = (tier: string) => {
  switch (tier?.toUpperCase()) {
    case "PLATINUM":
      return "default" as const;
    case "GOLD":
      return "secondary" as const;
    case "SILVER":
      return "outline" as const;
    case "BRONZE":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

interface SponsorDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsorId: string;
  onEditClick?: (sponsorId: string) => void;
}

export function SponsorDetailModal({
  open,
  onOpenChange,
  sponsorId,
  onEditClick,
}: SponsorDetailModalProps) {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && sponsorId) {
      setLoading(true);
      setError("");

      axiosInstance
        .get(endpoints.sponsors.getById(sponsorId))
        .then((res) => {
          const raw = res.data?.data ?? res.data;
          const processed = {
            ...raw,
            contractAmount: raw.contractAmount
              ? parseFloat(String(raw.contractAmount))
              : null,
            sponsorRevenue: raw.sponsorRevenue
              ? parseFloat(String(raw.sponsorRevenue))
              : null,
          };
          const parsed = sponsorSchema.parse(processed);
          setSponsor(parsed);
        })
        .catch((err) => {
          logger.error("Error fetching sponsor:", err);
          setError("Failed to load sponsor details");
        })
        .finally(() => setLoading(false));
    }
  }, [open, sponsorId]);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sponsor Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Loading sponsor details...
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
            <DialogTitle>Sponsor Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
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
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl">
              {sponsor?.sponsoredName || "Unnamed Sponsor"}
            </DialogTitle>
            {sponsor && (
              <Badge
                variant={getPackageTierBadgeVariant(sponsor.packageTier)}
                className="capitalize text-sm"
              >
                {sponsor.packageTier.toLowerCase()}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {sponsor && (
          <div className="space-y-6">
            {/* Financial Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <IconCurrencyDollar className="size-4" />
                  Contract Amount
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(sponsor.contractAmount)}
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <IconCurrencyDollar className="size-4" />
                  Sponsor Revenue
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(sponsor.sponsorRevenue)}
                </p>
              </div>
            </div>

            {/* Leagues */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <IconTrophy className="size-4" />
                Linked Leagues ({sponsor.leagues.length})
              </div>
              {sponsor.leagues.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sponsor.leagues.map((league) => (
                    <Badge key={league.id} variant="secondary">
                      {league.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No leagues linked
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                Created {formatDate(sponsor.createdAt)}
              </div>
              {sponsor.createdBy && (
                <span>by {sponsor.createdBy.name}</span>
              )}
            </div>

            {/* Actions */}
            {onEditClick && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onEditClick(sponsorId);
                  }}
                >
                  <IconEdit className="mr-2 size-4" />
                  Edit Sponsor
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
