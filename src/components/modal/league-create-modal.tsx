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
  IconUsers,
  IconBuilding
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useSession } from "@/lib/auth-client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


interface LeagueCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onLeagueCreated?: (formData?: any) => void;
  selectedTemplate?: any;
}

// Available options for dropdowns
const SPORTS_OPTIONS = [
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "TENNIS", label: "Tennis" },
  { value: "PADEL", label: "Padel" },
];

const LOCATION_OPTIONS = [
  { value: "kuala-lumpur", label: "Kuala Lumpur" },
  { value: "petaling-jaya", label: "Petaling Jaya" },
  { value: "subang-jaya", label: "Subang Jaya" },
  { value: "shah-alam", label: "Shah Alam" },
  { value: "klang", label: "Klang" },
  { value: "ampang", label: "Ampang" },
  { value: "cheras", label: "Cheras" },
  { value: "puchong", label: "Puchong" },
  { value: "cyberjaya", label: "Cyberjaya" },
  { value: "putrajaya", label: "Putrajaya" },
];

const FORMAT_OPTIONS = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
  { value: "MIXED", label: "Mixed Doubles" },
];

const STATUS_OPTIONS = [
  // { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "UPCOMING", label: "Upcoming" },
];



export default function LeagueCreateModal({
  open,
  onOpenChange,
  children,
  onLeagueCreated,
  selectedTemplate,
}: LeagueCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const { data} = useSession();

  const userId = data?.user.id;
 
  // Form data
  const [formData, setFormData] = useState({
    leagueName: "",
    sport: "",
    location: "",
    status: "UPCOMING",
    description: "",
    hasSponsor: false,
    sponsorOption: "existing" as "existing" | "new", 
    existingSponsorId: "",                            
    sponsorship: {
      packageTier: "BRONZE" as TierType,
      contractAmount: "",
      sponsorRevenue: "",
      sponsoredName: "",
    }
  });


React.useEffect(() => {
  console.log("hasSponsor value:", formData.hasSponsor);
  if (formData.hasSponsor) {
    console.log("Attempting to fetch sponsors..."); // Log the start of the process
    setSponsorsLoading(true);
    axiosInstance.get(endpoints.sponsors.getAll)
      .then(res => {
         console.log("response sponsor", res.data);
  setSponsors(res.data || []);
  console.log("sponsors length:", res.data?.length);
      })
      .catch((error) => {
        console.error("Error fetching sponsors:", error); // Log any errors
        setSponsors([]);
      })
      .finally(() => setSponsorsLoading(false));
  }
}, [formData.hasSponsor]);


// 2. **Add this new useEffect to log the actual state value**
React.useEffect(() => {
  // This will run AFTER the `setSponsors(res.data)` update completes
  if (formData.hasSponsor) {
    console.log("Current sponsors state:", sponsors); 
  }
}, [sponsors, formData.hasSponsor]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  
  const resetModal = () => {
    setFormData({
      leagueName: "",
      sport: "",
      location: "",
      status: "UPCOMING",
      description: "",
      hasSponsor: false,
      sponsorOption: "existing",
      existingSponsorId: "",
      sponsorship: {
        packageTier: "BRONZE" as TierType,
        contractAmount: "",
        sponsorRevenue: "",
        sponsoredName: "",
      }
    });
    setError("");
    setLoading(false);
  };

  const isFormValid = formData.leagueName && formData.sport && formData.location;

type TierType = "GOLD" | "SILVER" | "BRONZE" | "PLATINUM";

const handleCreateLeague = async () => {
  if (!isFormValid) return;

  setLoading(true);
  setError("");

  try {
    // Map sport values to match backend enum
    const sportTypeMap: { [key: string]: string } = {
      "TENNIS": "TENNIS",
      "PICKLEBALL": "PICKLEBALL", 
      "PADEL": "PADEL"
    };

     // Base league data
    const leagueData: any = {
      name: formData.leagueName,
      location: formData.location,
      description: formData.description,
      status: formData.status,
      sportType: sportTypeMap[formData.sport] || "TENNIS",
      registrationType: "OPEN",
      gameType: "SINGLES", // Default to singles
      createdById: userId,
    };

    // Add sponsorship if applicable
    if (formData.hasSponsor) {
      let sponsorName = "";

      if (formData.sponsorOption === "existing") {
        const existingSponsor = sponsors.find(s => s.id === formData.existingSponsorId);
        sponsorName = existingSponsor?.sponsoredName || "";
      } else {
        sponsorName = formData.sponsorship.sponsoredName || "";
      }

      leagueData.sponsorships = [
        {
          packageTier: formData.sponsorship.packageTier,
          contractAmount: formData.sponsorship.contractAmount || null,
          sponsorRevenue: formData.sponsorship.sponsorRevenue || null,
          sponsoredName: sponsorName,
          isActive: true,
          createdById: userId,
        },
      ];
    }

    console.log("League data being sent to backend:", JSON.stringify(leagueData, null, 2));

   
    // Send request
    const response = await axiosInstance.post(endpoints.league.create, leagueData);

    if (response.data) {
      toast.success("League created successfully!");
      resetModal();
      onOpenChange(false);
      onLeagueCreated?.(response.data);
    }

  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to create league";
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};


  const getSportColor = (sport: string) => {
    switch (sport) {
      case "TENNIS":
        return "#ABFE4D";
      case "PICKLEBALL":
        return "#A04DFE";
      case "PADEL":
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
                  {/* Choose existing or new sponsor */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sponsor Source</Label>
                    <RadioGroup
                      defaultValue={formData.sponsorOption || "existing"}
                      onValueChange={(value) => updateFormData("sponsorOption", value)}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" />
                        <Label htmlFor="existing">Use Existing Sponsor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new">Create New Sponsor</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Existing sponsor selection */}
                  {formData.sponsorOption === "existing" && (
                    <div className="space-y-2">
                      <Label htmlFor="existingSponsor" className="text-sm font-medium">
                        Select Existing Sponsor *
                      </Label>
                      <Select
                        value={formData.existingSponsorId}
                        onValueChange={(value) => updateFormData("existingSponsorId", value)}
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder={sponsorsLoading ? "Loading sponsors..." : "Select a sponsor"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sponsors.length > 0 ? (
                            sponsors.map((sponsor) => (
                              <SelectItem key={sponsor.id} value={sponsor.id}>
                                {sponsor.sponsoredName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="none">
                              {sponsorsLoading ? "Loading..." : "No sponsors found"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* New sponsor creation form */}
                  {formData.sponsorOption === "new" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Sponsor Name */}
                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-sm font-medium">
                            Sponsor Name *
                          </Label>
                          <Input
                            id="companyName"
                            value={formData.sponsorship.sponsoredName}
                            onChange={(e) =>
                              updateFormData("sponsorship", {
                                ...formData.sponsorship,
                                sponsoredName: e.target.value,
                              })
                            }
                            className="h-11"
                            placeholder="Enter sponsor name"
                          />
                        </div>

                        {/* Package Tier */}
                        <div className="space-y-2">
                          <Label htmlFor="packageTier" className="text-sm font-medium">
                            Sponsorship Tier *
                          </Label>
                          <Select
                            value={formData.sponsorship.packageTier}
                            onValueChange={(value) =>
                              updateFormData("sponsorship", {
                                ...formData.sponsorship,
                                packageTier: value as TierType,
                              })
                            }
                          >
                            <SelectTrigger className="h-11 w-full">
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
                      </div>

                      {/* Contract Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="contractAmount" className="text-sm font-medium">
                          Contract Amount (Optional)
                        </Label>
                        <Input
                          id="contractAmount"
                          type="number"
                          value={formData.sponsorship.contractAmount}
                          onChange={(e) =>
                            updateFormData("sponsorship", {
                              ...formData.sponsorship,
                              contractAmount: e.target.value,
                            })
                          }
                          className="h-11"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                  )}
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
