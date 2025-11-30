"use client";

import React, { useState } from "react";
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
  DialogTrigger,
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
  IconBuilding
} from "@tabler/icons-react";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useSession } from "@/lib/auth-client";
import {
  SPORTS_OPTIONS,
  LOCATION_OPTIONS,
  STATUS_OPTIONS,
  getSportColor,
  type League,
  type SponsorOption,
  type SportType,
  type LeagueStatus,
} from "@/constants/types/league";

interface LeagueCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onLeagueCreated?: (data?: League) => void;
  selectedTemplate?: { name: string };
}

export default function LeagueCreateModal({
  open,
  onOpenChange,
  children,
  onLeagueCreated,
  selectedTemplate,
}: LeagueCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sponsors, setSponsors] = useState<SponsorOption[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorInputValue, setSponsorInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSponsors, setFilteredSponsors] = useState<SponsorOption[]>([]);
  const { data } = useSession();

  const userId = data?.user.id;
 
  // Form data
  const [formData, setFormData] = useState({
    leagueName: "",
    sport: "",
    location: "",
    status: "ACTIVE",
    description: "",
    hasSponsor: false,
    existingSponsorId: "",
  });


React.useEffect(() => {
  if (formData.hasSponsor) {
    setSponsorsLoading(true);
    axiosInstance.get(endpoints.sponsors.getAll)
      .then(res => {
         const api = res.data;
         const sponsorships = (api?.data?.sponsorships || api?.data || api || []) as Array<{ id: string; sponsoredName?: string }>;
         // map to simple shape for autocomplete
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

  const updateFormData = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle sponsor input change
  const handleSponsorInputChange = (value: string) => {
    setSponsorInputValue(value);
    
    if (value.trim() === "") {
      setFilteredSponsors([]);
      setShowSuggestions(false);
      updateFormData("existingSponsorId", "");
      return;
    }

    // Filter sponsors based on input
    const filtered = sponsors.filter(sponsor =>
      sponsor.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSponsors(filtered);
    setShowSuggestions(true);
  };

  // Handle sponsor selection
  const handleSponsorSelect = (sponsor: SponsorOption) => {
    setSponsorInputValue(sponsor.name);
    updateFormData("existingSponsorId", sponsor.id);
    setShowSuggestions(false);
  };

  // Handle input blur (hide suggestions after a delay)
  const handleSponsorInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  
  const resetModal = () => {
    setFormData({
      leagueName: "",
      sport: "",
      location: "",
      status: "ACTIVE",
      description: "",
      hasSponsor: false,
      existingSponsorId: "",
    });
    setError("");
    setLoading(false);
    setSponsorInputValue("");
    setShowSuggestions(false);
    setFilteredSponsors([]);
  };

  const isFormValid = formData.leagueName && formData.sport && formData.location;

/** Payload for creating a league */
interface LeagueCreatePayload {
  name: string;
  location: string;
  status: string;
  sportType: SportType;
  gameType: "SINGLES" | "DOUBLES" | "MIXED";
  description: string | null;
  createdById: string | undefined;
  existingSponsorshipIds?: string[];
}

const handleCreateLeague = async () => {
  if (!isFormValid) return;

  setLoading(true);
  setError("");

  try {
    // Base league data
    const leagueData: LeagueCreatePayload = {
      name: formData.leagueName,
      location: formData.location,
      status: formData.status,
      sportType: (formData.sport as SportType) || "TENNIS",
      gameType: "SINGLES",
      description: formData.description || null,
      createdById: userId,
    };

    // Add sponsorship if applicable
    if (formData.hasSponsor && formData.existingSponsorId) {
      leagueData.existingSponsorshipIds = [formData.existingSponsorId];
    }

    // Send request
    const response = await axiosInstance.post(endpoints.league.create, leagueData);

    if (response.data) {
      toast.success("League created successfully!");
      resetModal();
      onOpenChange(false);
      onLeagueCreated?.(response.data);
    }

  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } }; message?: string };
    const message = error.response?.data?.message || error.message || "Failed to create league";
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
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconTrophy className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span>Create New League</span>
              {selectedTemplate && (
                <span className="text-sm font-normal text-muted-foreground">
                  Using template: {selectedTemplate.name}
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">
            Set up the basic information for your new league
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* League Information Section */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* League Name */}
              <div className="space-y-2">
                <Label htmlFor="leagueName" className="text-sm font-medium">
                  League Name *
                </Label>
                <Input
                  id="leagueName"
                  type="text"
                  placeholder="e.g., KL League"
                  value={formData.leagueName}
                  onChange={(e) => updateFormData("leagueName", e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Sport */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sport *</Label>
                <Select value={formData.sport} onValueChange={(value) => updateFormData("sport", value)}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
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
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => updateFormData("location", value)}>
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
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
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
            </div>

            {/* Sponsor Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hasSponsor"
                  checked={formData.hasSponsor}
                  onCheckedChange={(checked) => updateFormData("hasSponsor", checked)}
                />
                <Label htmlFor="hasSponsor" className="text-sm font-medium flex items-center gap-2">
                  <IconBuilding className="h-4 w-4" />
                  This league has a sponsor
                </Label>
              </div>
              
              {formData.hasSponsor && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20 bg-muted/30 p-4 rounded-lg">
                  {/* Existing sponsor selection */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="existingSponsor" className="text-sm font-medium">
                      Select Existing Sponsor *
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
                      className="h-11"
                    />
                    
                    {/* Suggestions dropdown */}
                    {showSuggestions && filteredSponsors.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredSponsors.map((sponsor) => (
                          <div
                            key={sponsor.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleSponsorSelect(sponsor)}
                          >
                            {sponsor.name}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {showSuggestions && filteredSponsors.length === 0 && sponsorInputValue.trim() !== "" && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No sponsors found
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

        <DialogFooter className="flex gap-3 pt-4">
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
            onClick={handleCreateLeague}
            disabled={loading || !isFormValid}
            className="flex-1 sm:flex-none min-w-[160px]"
          >
            {loading ? (
              <>
                <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
                Creating League...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Create League
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
