"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Loader2,
  Trophy,
  X,
  ArrowLeft,
  ArrowRight,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SeasonCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onSeasonCreated?: () => void;
}

// Available options for dropdowns
const SPORTS_OPTIONS = [
  { value: "Pickleball", label: "Pickleball" },
  { value: "Tennis", label: "Tennis" },
  { value: "Padel", label: "Padel" },
];

const LEAGUE_OPTIONS = [
  { value: "PJ League", label: "PJ League" },
  { value: "Subang League", label: "Subang League" },
  { value: "KL League", label: "KL League" },
];

const LEAGUE_TYPE_OPTIONS = [
  { value: "Men's Singles", label: "Men's Singles" },
  { value: "Men's Doubles", label: "Men's Doubles" },
  { value: "Mixed Doubles", label: "Mixed Doubles" },
];

export default function SeasonCreateModal({
  open,
  onOpenChange,
  children,
  onSeasonCreated,
}: SeasonCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<"form" | "preview">("form");
  const [seasonName, setSeasonName] = useState("");
  const [sport, setSport] = useState("");
  const [league, setLeague] = useState("");
  const [leagueTypes, setLeagueTypes] = useState<string[]>([]);
  const [entryFee, setEntryFee] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLeagueTypeToggle = (leagueType: string) => {
    setLeagueTypes((prev) =>
      prev.includes(leagueType)
        ? prev.filter((type) => type !== leagueType)
        : [...prev, leagueType]
    );
  };

  const resetModal = () => {
    setCurrentStep("form");
    setSeasonName("");
    setSport("");
    setLeague("");
    setLeagueTypes([]);
    setEntryFee("");
    setRegistrationDeadline(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setError("");
  };

  const handleNextToPreview = () => {
    if (isFormValid) {
      setCurrentStep("preview");
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
  };

  const handleCreateSeason = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (
        !seasonName ||
        !sport ||
        !league ||
        leagueTypes.length === 0 ||
        !entryFee ||
        !registrationDeadline ||
        !startDate ||
        !endDate
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate dates
      if (startDate >= endDate) {
        throw new Error("End date must be after start date");
      }

      if (registrationDeadline >= startDate) {
        throw new Error("Registration deadline must be before start date");
      }

      const seasonData = {
        name: seasonName,
        sportType: sport,
        seasonType: leagueTypes.join(", "),
        description: `${league} - ${leagueTypes.join(", ")}`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        regiDeadline: registrationDeadline.toISOString(),
        status: "UPCOMING",
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/season/create`,
        seasonData
      );

      toast.success(res.data.message || "Season created successfully!");

      // Reset modal and close
      resetModal();
      onOpenChange(false);
      onSeasonCreated?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create season";

      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    seasonName &&
    sport &&
    league &&
    leagueTypes.length > 0 &&
    entryFee &&
    registrationDeadline &&
    startDate &&
    endDate;

  const getSportColor = (leagueType: string) => {
    switch (leagueType) {
      case "Pickleball":
        return "#A04DFE";
      case "Tennis":
        return "#ABFE4D";
      case "Padel":
        return "#4DABFE";
      default:
        return "#6B7280";
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
      {children}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {currentStep === "form" ? (
                <Trophy className="h-5 w-5 text-primary" />
              ) : (
                <Eye className="h-5 w-5 text-primary" />
              )}
            </div>
            {currentStep === "form"
              ? "Create New Season"
              : "Confirm Season Details"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStep === "form"
              ? "Set up a new season with comprehensive details. Select multiple league types to offer various competition formats."
              : "Review all details before creating the season. You can go back to make changes if needed."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
                currentStep === "form"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep === "form"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
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
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep === "preview"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
              <span>2. Confirm</span>
            </div>
          </div>

          {/* Form Step */}
          {currentStep === "form" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Basic Information
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Season Name */}
                  <div className="space-y-2">
                    <Label htmlFor="seasonName" className="text-sm font-medium">
                      Season Name *
                    </Label>
                    <Input
                      id="seasonName"
                      type="text"
                      placeholder="e.g., Spring Championship 2024"
                      value={seasonName}
                      onChange={(e) => setSeasonName(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Entry Fee */}
                  <div className="space-y-2">
                    <Label htmlFor="entryFee" className="text-sm font-medium">
                      Entry Fee (MYR) *
                    </Label>
                    <Input
                      id="entryFee"
                      type="number"
                      placeholder="150"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      className="h-11"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Sports & League Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Sports & League
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="space-y-4">
                  {/* Sports Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sports *</Label>
                    <Select value={sport} onValueChange={setSport}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORTS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* League Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">League *</Label>
                    <Select value={league} onValueChange={setLeague}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select a league" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAGUE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* League Types Multi-Select */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">League Types *</Label>
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      {LEAGUE_TYPE_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50",
                            leagueTypes.includes(option.value) &&
                              "border-primary bg-primary/5"
                          )}
                          onClick={() => handleLeagueTypeToggle(option.value)}
                        >
                          <Checkbox
                            checked={leagueTypes.includes(option.value)}
                            onChange={() =>
                              handleLeagueTypeToggle(option.value)
                            }
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label className="text-sm font-medium cursor-pointer flex-1">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Schedule
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Registration Deadline */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Registration Deadline *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !registrationDeadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {registrationDeadline
                            ? format(registrationDeadline, "MMM dd, yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={registrationDeadline}
                          onSelect={setRegistrationDeadline}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? format(startDate, "MMM dd, yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate
                            ? format(endDate, "MMM dd, yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center">
                    <X className="h-2.5 w-2.5" />
                  </div>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {currentStep === "preview" && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              {/* Season Header with Details */}
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{seasonName}</h3>
                </div>

                {/* Seamless Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Sport & League
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="capitalize text-xs"
                        style={{
                          backgroundColor: getSportColor(sport),
                          color: "white",
                          borderColor: getSportColor(sport),
                        }}
                      >
                        {sport}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {league}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Entry Fee
                    </span>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat("en-MY", {
                        style: "currency",
                        currency: "MYR",
                      }).format(Number(entryFee))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      League Types
                    </span>
                    <div className="flex gap-1">
                      {leagueTypes.map((type, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Schedule
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-green-400 to-blue-400" />

                  {/* Registration Deadline */}
                  <div className="relative flex items-center gap-4 pb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 z-10">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">
                            Registration Deadline
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Last day to register
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {format(registrationDeadline!, "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(registrationDeadline!, "EEEE")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="relative flex items-center gap-4 pb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 z-10">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">Season Start</h4>
                          <p className="text-xs text-muted-foreground">
                            Season begins
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {format(startDate!, "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(startDate!, "EEEE")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="relative flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 z-10">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">Season End</h4>
                          <p className="text-xs text-muted-foreground">
                            Season concludes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {format(endDate!, "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(endDate!, "EEEE")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration Summary */}
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Season Duration</h4>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil(
                          (endDate!.getTime() - startDate!.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(startDate!, "MMM dd")} –{" "}
                        {format(endDate!, "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
                disabled={loading || !isFormValid}
                className="flex-1 sm:flex-none min-w-[140px]"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Review Details
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={handleCreateSeason}
                disabled={loading}
                className="flex-1 sm:flex-none min-w-[160px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating Season...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Create Season
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
