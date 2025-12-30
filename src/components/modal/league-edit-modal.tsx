"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconLoader2,
  IconTrophy,
  IconX,
  IconCheck,
  IconMapPin,
  IconBuilding,
  IconForms,
  IconFileDescription,
  IconSettings,
} from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/api-error";
import {
  SPORTS_OPTIONS,
  LOCATION_OPTIONS,
  STATUS_OPTIONS,
  getSportColor,
  type League,
  type SponsorOption,
  type SportType,
} from "@/constants/types/league";

interface LeagueEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  league: League;
  onLeagueUpdated?: () => Promise<void>;
}

export default function LeagueEditModal({
  open,
  onOpenChange,
  league,
  onLeagueUpdated,
}: LeagueEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sponsors, setSponsors] = useState<SponsorOption[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorInputValue, setSponsorInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSponsors, setFilteredSponsors] = useState<SponsorOption[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    sportType: "",
    location: "",
    status: "",
    description: "",
    hasSponsor: false,
    existingSponsorId: "",
  });

  useEffect(() => {
    if (league && open) {
      setFormData({
        name: league.name || "",
        sportType: league.sportType || "",
        location: league.location || "",
        status: league.status || "",
        description: league.description || "",
        hasSponsor: false,
        existingSponsorId: "",
      });
      setError("");
      setSponsorInputValue("");
      setShowSuggestions(false);
      setFilteredSponsors([]);
    }
  }, [league, open]);

  useEffect(() => {
    if (formData.hasSponsor) {
      setSponsorsLoading(true);
      axiosInstance.get(endpoints.sponsors.getAll)
        .then(res => {
          const api = res.data;
          const sponsorships = (api?.data?.sponsorships || api?.data || api || []) as Array<{ id: string; sponsoredName?: string }>;
          const mapped = sponsorships.map((s) => ({
            id: s.id,
            name: s.sponsoredName || "Unnamed Sponsor",
          }));
          setSponsors(mapped);
        })
        .catch(() => {
          setSponsors([]);
        })
        .finally(() => setSponsorsLoading(false));
    }
  }, [formData.hasSponsor]);

  const updateFormData = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSponsorInputChange = (value: string) => {
    setSponsorInputValue(value);

    if (value.trim() === "") {
      setFilteredSponsors([]);
      setShowSuggestions(false);
      updateFormData("existingSponsorId", "");
      return;
    }

    const filtered = sponsors.filter(sponsor =>
      sponsor.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSponsors(filtered);
    setShowSuggestions(true);
  };

  const handleSponsorSelect = (sponsor: SponsorOption) => {
    setSponsorInputValue(sponsor.name);
    updateFormData("existingSponsorId", sponsor.id);
    setShowSuggestions(false);
  };

  const handleSponsorInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const resetModal = () => {
    setError("");
    setLoading(false);
    setSponsorInputValue("");
    setShowSuggestions(false);
    setFilteredSponsors([]);
  };

  const isFormValid = formData.name && formData.sportType && formData.location;

  const handleUpdateLeague = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      await axiosInstance.put(endpoints.league.getById(league.id), {
        name: formData.name,
        sportType: formData.sportType,
        location: formData.location,
        status: formData.status,
        description: formData.description || null,
      });

      toast.success("League updated successfully!");
      resetModal();
      onOpenChange(false);
      await onLeagueUpdated?.();
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to update league");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50">
          <DialogHeader className="px-6 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                <IconTrophy className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold">
                  Edit League
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Update your league details and configuration.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Basic Information Section */}
          <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
              <IconForms className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Basic Information
              </span>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {/* League Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                    League Name
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., KL League"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Sport */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    Sport
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.sportType}
                    onValueChange={(value) => updateFormData("sportType", value)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2 rounded-full"
                              style={{ backgroundColor: getSportColor(option.value) }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <IconMapPin className="size-3.5" />
                    Location
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => updateFormData("location", value)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <IconSettings className="size-3.5" />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateFormData("status", value)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "size-2 rounded-full",
                              option.value === "ACTIVE" && "bg-emerald-500",
                              option.value === "UPCOMING" && "bg-blue-500"
                            )} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsor Section */}
          <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
              <IconBuilding className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sponsorship
              </span>
              <Badge variant="outline" className="text-[10px] ml-auto bg-background">
                Optional
              </Badge>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "size-2 rounded-full",
                    formData.hasSponsor ? "bg-emerald-500" : "bg-slate-400"
                  )} />
                  <Label htmlFor="hasSponsor" className="text-sm font-medium cursor-pointer">
                    This league has a sponsor
                  </Label>
                </div>
                <Checkbox
                  id="hasSponsor"
                  checked={formData.hasSponsor}
                  onCheckedChange={(checked) => updateFormData("hasSponsor", checked)}
                />
              </div>

              {formData.hasSponsor && (
                <div className="pt-3 border-t border-border/50">
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="existingSponsor" className="text-sm font-medium flex items-center gap-1">
                      Select Sponsor
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="existingSponsor"
                      placeholder="Type to search sponsors..."
                      value={sponsorInputValue}
                      onChange={(e) => handleSponsorInputChange(e.target.value)}
                      onFocus={() => {
                        if (sponsorInputValue.trim() !== "") {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={handleSponsorInputBlur}
                      className="h-9"
                    />

                    {/* Suggestions dropdown */}
                    {showSuggestions && filteredSponsors.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredSponsors.map((sponsor) => (
                          <div
                            key={sponsor.id}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                            onClick={() => handleSponsorSelect(sponsor)}
                          >
                            {sponsor.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No results message */}
                    {showSuggestions && filteredSponsors.length === 0 && sponsorInputValue.trim() !== "" && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No sponsors found
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50">
              <IconFileDescription className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </span>
              <Badge variant="outline" className="text-[10px] ml-auto bg-background">
                Optional
              </Badge>
            </div>
            <div className="p-3">
              <Textarea
                id="description"
                placeholder="Brief description of the league..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-destructive/10">
                  <IconX className="size-4 text-destructive" />
                </div>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border/50 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateLeague}
              disabled={loading || !isFormValid}
              className="gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <IconLoader2 className="animate-spin size-4" />
                  Updating...
                </>
              ) : (
                <>
                  <IconCheck className="size-4" />
                  Update League
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
