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
import { Textarea } from "@/components/ui/textarea";
import {
  IconLoader2,
  IconTrophy,
  IconX,
  IconCheck,
  IconMapPin,
  IconArrowLeft,
  IconArrowRight,
  IconEye,
} from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import {
  SPORTS_OPTIONS,
  LOCATION_OPTIONS,
  STATUS_OPTIONS,
  getSportColor,
  type League,
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
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sportType: "",
    location: "",
    status: "",
    gameType: "",
    joinType: "",
    description: "",
  });

  useEffect(() => {
    if (league && open) {
      setFormData({
        name: league.name || "",
        sportType: league.sportType || "",
        location: league.location || "",
        status: league.status || "",
        gameType: league.gameType || "",
        joinType: league.joinType || "",
        description: league.description || "",
      });
      setCurrentStep("form");
      setError("");
    }
  }, [league, open]);

  const updateFormData = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetModal = () => {
    setCurrentStep("form");
    setError("");
  };

  const isFormValid = formData.name && formData.sportType && formData.location;

  const handleNextToPreview = () => {
    if (isFormValid) setCurrentStep("preview");
  };

  const handleBackToForm = () => setCurrentStep("form");

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
        gameType: formData.gameType,
        joinType: formData.joinType,
        description: formData.description || null,
      });

      toast.success("League updated successfully!");
      resetModal();
      onOpenChange(false);
      await onLeagueUpdated?.();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update league";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getSportLabel = (value: string) => {
    return SPORTS_OPTIONS.find((s) => s.value === value)?.label || value;
  };

  const getLocationLabel = (value: string) => {
    return LOCATION_OPTIONS.find((l) => l.value === value)?.label || value;
  };

  const getStatusLabel = (value: string) => {
    return STATUS_OPTIONS.find((s) => s.value === value)?.label || value;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {currentStep === "form" ? (
                <IconTrophy className="h-5 w-5 text-primary" />
              ) : (
                <IconEye className="h-5 w-5 text-primary" />
              )}
            </div>
            {currentStep === "form" ? "Edit League" : "Confirm Changes"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStep === "form"
              ? "Update the league information below."
              : "Review your changes before updating."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
              currentStep === "form"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span>1. Details</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div
            className={cn(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
              currentStep === "preview"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span>2. Confirm</span>
          </div>
        </div>

        {/* Form Step */}
        {currentStep === "form" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="grid gap-6 md:grid-cols-2">
              {/* League Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  League Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., KL League"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Sport */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sport *</Label>
                <Select
                  value={formData.sportType}
                  onValueChange={(value) => updateFormData("sportType", value)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getSportColor(option.value),
                            }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => updateFormData("location", value)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-muted-foreground" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Game Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Game Type</Label>
                <Select
                  value={formData.gameType}
                  onValueChange={(value) => updateFormData("gameType", value)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLES">Singles</SelectItem>
                    <SelectItem value="DOUBLES">Doubles</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Join Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Join Type</Label>
                <Select
                  value={formData.joinType}
                  onValueChange={(value) => updateFormData("joinType", value)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select join type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the league..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center">
                  <IconX className="h-2.5 w-2.5" />
                </div>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview Step */}
        {currentStep === "preview" && (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                <IconTrophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formData.description || "No description"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Sport
                </span>
                <span className="text-sm font-medium">
                  {getSportLabel(formData.sportType)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Location
                </span>
                <span className="text-sm font-medium">
                  {getLocationLabel(formData.location)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <span className="text-sm font-medium">
                  {getStatusLabel(formData.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Game Type
                </span>
                <span className="text-sm font-medium capitalize">
                  {formData.gameType?.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Join Type
                </span>
                <span className="text-sm font-medium capitalize">
                  {formData.joinType?.toLowerCase().replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-3 pt-4">
          {currentStep === "form" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNextToPreview}
                disabled={!isFormValid || loading}
                className="flex-1 sm:flex-none min-w-[140px]"
              >
                <IconArrowRight className="mr-2 h-4 w-4" />
                Review Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToForm}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleUpdateLeague}
                disabled={loading}
                className="flex-1 sm:flex-none min-w-[160px]"
              >
                {loading ? (
                  <>
                    <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
                    Updating...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Update League
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
