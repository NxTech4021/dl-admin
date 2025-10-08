"use client";

import React, { useState, useRef } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconCalendar,
  IconLoader2,
  IconTrophy,
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconEye,
  IconCheck,
  IconMapPin,
  IconUsers,
  IconCurrencyDollar,
  IconPlus,
  IconUpload,
  IconPhoto
} from "@tabler/icons-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { SponsorCreateModal } from "./sponsor-create-modal";

interface LeagueCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onLeagueCreated?: (formData?: any) => void;
  selectedTemplate?: any;
}

// Available options for dropdowns
const SPORTS_OPTIONS = [
  { value: "tennis", label: "Tennis" },
  { value: "pickleball", label: "Pickleball" },
  { value: "padel", label: "Padel" },
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
  { value: "singles", label: "Singles" },
  { value: "doubles", label: "Doubles" },
  { value: "mixed", label: "Mixed Doubles" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
];

// function SponsorCreateModal({ open, onOpenChange, onSponsorCreated }: { open: boolean, onOpenChange: (open: boolean) => void, onSponsorCreated: (sponsor: any) => void }) {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.post("/api/companies", { name });
//       onSponsorCreated(res.data.company);
//       onOpenChange(false);
//       setName("");
//       toast.success("Sponsor created!");
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Failed to create sponsor");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create Sponsor</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-2">
//           <Label>Sponsor Name</Label>
//           <Input value={name} onChange={e => setName(e.target.value)} />
//         </div>
//         <DialogFooter>
//           <Button onClick={handleCreate} disabled={loading || !name}>
//             {loading ? "Creating..." : "Create"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


export default function LeagueCreateModal({
  open,
  onOpenChange,
  children,
  onLeagueCreated,
  selectedTemplate,
}: LeagueCreateModalProps) {
  const [currentStep, setCurrentStep] = useState<"basic" | "details" | "preview">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    leagueName: "",
    sport: "",
    location: "",
    status: "UPCOMING",
    format: "",
    entryFee: "",
    maxPlayers: "",
    divisions: "",
    hasSponsor: false,
    sponsorCompanyId: "",
    sponsorName: "",
    sponsorWebsite: "",
    sponsorEmail: "",
    sponsorLogo: "",
    description: "",
    rules: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    registrationDeadline: undefined as Date | undefined,
    // Category fields
    categoryName: "",
    matchFormat: "",
    maxTeams: "",
    genderRestriction: "OPEN",
  });


React.useEffect(() => {
  if (formData.hasSponsor) {
    console.log("Attempting to fetch companies..."); // Log the start of the process
    setSponsorsLoading(true);
    axiosInstance.get(endpoints.companies.getAll)
      .then(res => {
        console.log("Companies fetched successfully, setting state.");
        setSponsors(res.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error); // Log any errors
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


  // Pre-fill form data when template is selected
  React.useEffect(() => {
    if (selectedTemplate && open) {
      setFormData({
        leagueName: "", // User needs to provide custom name
        sport: selectedTemplate.sport || "",
        location: "", // User needs to provide location
        status: "draft",
        format: selectedTemplate.format || "",
        entryFee: selectedTemplate.entryFee?.toString() || "",
        maxPlayers: selectedTemplate.maxPlayers?.toString() || "",
        divisions: selectedTemplate.divisions?.length?.toString() || "",
        hasSponsor: !!selectedTemplate.sponsor,
        sponsorName: selectedTemplate.sponsor || "",
        sponsorWebsite: "",
        sponsorEmail: "",
        sponsorLogo: "",
        description: selectedTemplate.description || "",
        rules: selectedTemplate.rules?.join("\n") || "",
        startDate: undefined, // User needs to set dates
        endDate: undefined,
        registrationDeadline: undefined,
      });
      toast.success(`Template "${selectedTemplate.name}" loaded! Please fill in the remaining details.`);
    }
  }, [selectedTemplate, open]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // File upload handlers
  const handleFileUpload = (file: File) => {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error("File size too large. Please upload an image smaller than 5MB.");
      return;
    }

    setSponsorLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setSponsorLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    toast.success("Logo uploaded successfully!");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };


  const handleRemoveLogo = () => {
    setSponsorLogoFile(null);
    setSponsorLogoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetModal = () => {
    setCurrentStep("basic");
    setFormData({
      leagueName: "",
      sport: "",
      location: "",
      status: "UPCOMING",
      format: "",
      entryFee: "",
      maxPlayers: "",
      divisions: "",
      hasSponsor: false,
      sponsorCompanyId: "",
      sponsorName: "",
      sponsorWebsite: "",
      sponsorEmail: "",
      sponsorLogo: "",
      description: "",
      rules: "",
      startDate: undefined,
      endDate: undefined,
      registrationDeadline: undefined,
      // Category fields
      categoryName: "",
      matchFormat: "",
      maxTeams: "",
      genderRestriction: "OPEN",
    });
    setSponsorLogoFile(null);
    setSponsorLogoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError("");
    setLoading(false);
  };

  const handleNextStep = () => {
    if (currentStep === "basic" && isBasicStepValid) {
      setCurrentStep("details");
    } else if (currentStep === "details" && isDetailsStepValid) {
      setCurrentStep("preview");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "details") {
      setCurrentStep("basic");
    } else if (currentStep === "preview") {
      setCurrentStep("details");
    }
  };

  const isBasicStepValid = formData.leagueName && formData.sport && formData.location;
  const isDetailsStepValid = formData.categoryName && formData.format &&
    (!formData.hasSponsor || (formData.hasSponsor && formData.sponsorCompanyId));
  const isFormValid = isBasicStepValid && isDetailsStepValid;

  // const handleCreateLeague = async () => {
  //   if (!isFormValid) return;
    
  //   setLoading(true);
  //   setError("");

  //   try {
  //     // Validate dates
  //     if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
  //       throw new Error("End date must be after start date");
  //     }

  //     if (formData.registrationDeadline && formData.startDate && formData.registrationDeadline >= formData.startDate) {
  //       throw new Error("Registration deadline must be before start date");
  //     }

  //     // TODO: Replace with actual API call
  //     await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
  //     // Simulate logo upload if file exists
  //     let logoUrl = "";
  //     if (sponsorLogoFile) {
  //       // TODO: Upload file to server and get URL
  //       logoUrl = `/uploads/sponsors/${Date.now()}-${sponsorLogoFile.name}`;
  //     }
      
  //     const leagueDataWithLogo = {
  //       ...formData,
  //       sponsorLogo: logoUrl || formData.sponsorLogo,
  //       sponsorLogoFile: sponsorLogoFile // Include file for parent component if needed
  //     };
      
  //     console.log("Creating league:", leagueDataWithLogo);
      
  //     resetModal();
  //     onOpenChange(false);
  //     onLeagueCreated?.(leagueDataWithLogo); // Pass form data with logo to parent
  //   } catch (err: any) {
  //     const message = err.message || "Failed to create league";
  //     toast.error(message);
  //     setError(message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


 const handleCreateLeague = async () => {
  if (!isFormValid) return;

  setLoading(true);
  setError("");

  try {
    // Map sport values to match backend enum
    const sportTypeMap: { [key: string]: string } = {
      "tennis": "TENNIS",
      "pickleball": "PICKLEBALL", 
      "padel": "PADDLE"
    };

    // Map format values to match backend enum
    const gameTypeMap: { [key: string]: string } = {
      "singles": "SINGLES",
      "doubles": "DOUBLES",
      "mixed": "DOUBLES" // Mixed doubles is still doubles
    };

    // Map status values to match backend enum
    const statusMap: { [key: string]: string } = {
      "draft": "UPCOMING",
      "active": "ACTIVE", 
      "upcoming": "UPCOMING"
    };

    // Map gender restriction values to match backend enum
    const genderRestrictionMap: { [key: string]: string } = {
      "open": "OPEN",
      "male": "MALE",
      "female": "FEMALE"
    };

    // Create league
    const leagueResponse = await axiosInstance.post(endpoints.league.create, {
      name: formData.leagueName,
      location: formData.location,
      description: formData.description,
      status: statusMap[formData.status] || "UPCOMING",
      sportType: sportTypeMap[formData.sport] || "TENNIS",
      registrationType: "OPEN", // Default to open registration
      gameType: gameTypeMap[formData.format] || "SINGLES",
      sponsorships: formData.hasSponsor && formData.sponsorCompanyId ? [{
        companyId: formData.sponsorCompanyId,
        packageTier: "BRONZE", // Default tier
        createdById: null // Will be set by backend from auth
      }] : []
    });

    const leagueId = leagueResponse.data.data.league.id;

    // Create category 
    if (formData.categoryName) {
      await axiosInstance.post(endpoints.categories.create, {
        leagueId,
        name: formData.categoryName,
        matchFormat: formData.matchFormat || formData.format,
        maxPlayers: formData.maxPlayers ? Number(formData.maxPlayers) : undefined,
        maxTeams: formData.maxTeams ? Number(formData.maxTeams) : undefined,
        genderRestriction: genderRestrictionMap[formData.genderRestriction] || "OPEN"
      });
    }

    toast.success("League and category created successfully!");
    resetModal();
    onOpenChange(false);
    onLeagueCreated?.(leagueResponse.data);

  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Something went wrong";
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};


  const getSportColor = (sport: string) => {
    switch (sport) {
      case "tennis":
        return "#ABFE4D";
      case "pickleball":
        return "#A04DFE";
      case "padel":
        return "#4DABFE";
      default:
        return "#6B7280";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "basic":
        return <IconTrophy className="h-5 w-5 text-primary" />;
      case "details":
        return <IconUsers className="h-5 w-5 text-primary" />;
      case "preview":
        return <IconEye className="h-5 w-5 text-primary" />;
      default:
        return <IconTrophy className="h-5 w-5 text-primary" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "basic":
        return "Create New League";
      case "details":
        return "League Details";
      case "preview":
        return "Confirm League Details";
      default:
        return "Create New League";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "basic":
        return "Set up the basic information for your new league";
      case "details":
        return "Configure additional settings and schedule";
      case "preview":
        return "Review all details before creating the league";
      default:
        return "Set up the basic information for your new league";
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {getStepIcon()}
            </div>
            <div className="flex flex-col">
              <span>{getStepTitle()}</span>
              {selectedTemplate && (
                <span className="text-sm font-normal text-muted-foreground">
                  Using template: {selectedTemplate.name}
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
                currentStep === "basic"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep === "basic"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
              <span>1. Basic Info</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors",
                currentStep === "details"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep === "details"
                    ? "bg-primary-foreground"
                    : "bg-muted-foreground"
                )}
              />
              <span>2. Details</span>
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
              <span>3. Confirm</span>
            </div>
          </div>

          {/* Basic Info Step */}
          {currentStep === "basic" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* League Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    League Information
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* League Name */}
                  <div className="space-y-2">
                    <Label htmlFor="leagueName" className="text-sm font-medium">
                      League Name *
                    </Label>
                    <Input
                      id="leagueName"
                      type="text"
                      placeholder="e.g., KL Tennis Championship"
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
                            {option.label}
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
                            {option.label}
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

                  {/* Sponsor */}
<div className="space-y-4">
    <div className="flex items-center space-x-2">
      <Checkbox
        id="hasSponsor"
        checked={formData.hasSponsor}
        onCheckedChange={(checked) => updateFormData("hasSponsor", checked)}
      />
      <Label htmlFor="hasSponsor" className="text-sm font-medium">
        This league has a sponsor
      </Label>
    </div>

    {formData.hasSponsor && (
      <div className="space-y-4 pl-6 border-l-2 border-muted">
        {sponsorsLoading ? (
          <div>Loading sponsors...</div>
        ) : Array.isArray(sponsors) && sponsors.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="sponsorCompany" className="text-sm font-medium">
              Select Sponsor *
            </Label>
            <Select
              value={formData.sponsorCompanyId}
              onValueChange={val => updateFormData("sponsorCompanyId", val)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select sponsor" />
              </SelectTrigger>
            <SelectContent
  className="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto"
  position="popper"
>
                {Array.isArray(sponsors) && sponsors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
                <div className="p-2 border-t text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs"
                    onClick={() => setSponsorModalOpen(true)}
                  >
                    + Create new sponsor
                  </Button>
                </div>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <div>No sponsors found.</div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSponsorModalOpen(true)}
              size="sm"
            >
              + Create Sponsor
            </Button>
          </div>
        )}
      </div>
    )}
    <SponsorCreateModal
      open={sponsorModalOpen}
      onOpenChange={setSponsorModalOpen}
      onSponsorCreated={sponsor => {
        setSponsors(s => Array.isArray(s) ? [...s, sponsor] : [sponsor]);
        updateFormData("sponsorCompanyId", sponsor.id);
      }}
    />
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
                    className="min-h-[80px]"
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
          )}

          {/* Details Step */}
          {currentStep === "details" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Competition Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Category Settings
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Format */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Format *</Label>
                    <Select value={formData.format} onValueChange={(value) => updateFormData("format", value)}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Max Players */}
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers" className="text-sm font-medium">
                      Maximum Players
                    </Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      placeholder="32"
                      value={formData.maxPlayers}
                      onChange={(e) => updateFormData("maxPlayers", e.target.value)}
                      className="h-11"
                      min="1"
                    />
                  </div>

                  {/* Divisions */}
                  <div className="space-y-2">
                    <Label htmlFor="divisions" className="text-sm font-medium">
                      Number of Divisions
                    </Label>
                    <Input
                      id="divisions"
                      type="number"
                      placeholder="2"
                      value={formData.divisions}
                      onChange={(e) => updateFormData("divisions", e.target.value)}
                      className="h-11"
                      min="1"
                    />
                  </div>
                </div>

              
                {/* Category Name */}
<div className="space-y-2">
  <Label htmlFor="categoryName" className="text-sm font-medium">
    Category Name *
  </Label>
  <Input
    id="categoryName"
    type="text"
    placeholder="e.g., Junior Singles"
    value={formData.categoryName}
    onChange={(e) => updateFormData("categoryName", e.target.value)}
    className="h-11"
  />
</div>

{/* Match Format */}
<div className="space-y-2">
  <Label htmlFor="matchFormat" className="text-sm font-medium">
    Match Format
  </Label>
  <Input
    id="matchFormat"
    type="text"
    placeholder="e.g., Best of 3 sets"
    value={formData.matchFormat}
    onChange={(e) => updateFormData("matchFormat", e.target.value)}
    className="h-11"
  />
</div>

{/* Max Players */}
<div className="space-y-2">
  <Label htmlFor="maxPlayers" className="text-sm font-medium">
    Maximum Players
  </Label>
  <Input
    id="maxPlayers"
    type="number"
    placeholder="32"
    value={formData.maxPlayers}
    onChange={(e) => updateFormData("maxPlayers", e.target.value)}
    className="h-11"
    min="1"
  />
</div>

{/* Max Teams */}
<div className="space-y-2">
  <Label htmlFor="maxTeams" className="text-sm font-medium">
    Maximum Teams
  </Label>
  <Input
    id="maxTeams"
    type="number"
    placeholder="8"
    value={formData.maxTeams}
    onChange={(e) => updateFormData("maxTeams", e.target.value)}
    className="h-11"
    min="1"
  />
</div>

{/* Gender Restriction */}
<div className="space-y-2">
  <Label htmlFor="genderRestriction" className="text-sm font-medium">
    Gender Restriction
  </Label>
  <Select
    value={formData.genderRestriction}
    onValueChange={(value) => updateFormData("genderRestriction", value)}
  >
    <SelectTrigger className="h-11 w-full">
      <SelectValue placeholder="Select gender restriction" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="open">Open</SelectItem>
      <SelectItem value="male">Male</SelectItem>
      <SelectItem value="female">Female</SelectItem>
    </SelectContent>
  </Select>
</div>
              </div>

              {/* Schedule Section */}
              {/* <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    Schedule
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Registration Deadline
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !formData.registrationDeadline && "text-muted-foreground"
                          )}
                        >
                          <IconCalendar className="mr-2 h-4 w-4" />
                          {formData.registrationDeadline
                            ? format(formData.registrationDeadline, "MMM dd, yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.registrationDeadline}
                          onSelect={(date) => updateFormData("registrationDeadline", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
 
                </div>
              </div> */}

              {/* Rules */}
              <div className="space-y-2">
                <Label htmlFor="rules" className="text-sm font-medium">
                  League Rules (Optional)
                </Label>
                <Textarea
                  id="rules"
                  placeholder="Specific rules and regulations for this league..."
                  value={formData.rules}
                  onChange={(e) => updateFormData("rules", e.target.value)}
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
              {/* League Header */}
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                    <IconTrophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{formData.leagueName}</h3>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {formData.description}
                    </p>
                  )}
                </div>

                {/* League Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Sport & Location
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="capitalize text-xs"
                        style={{
                          backgroundColor: getSportColor(formData.sport),
                          color: "white",
                          borderColor: getSportColor(formData.sport),
                        }}
                      >
                        {SPORTS_OPTIONS.find(s => s.value === formData.sport)?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <IconMapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {LOCATION_OPTIONS.find(l => l.value === formData.location)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Format & Fee
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {FORMAT_OPTIONS.find(f => f.value === formData.format)?.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <IconCurrencyDollar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          RM {formData.entryFee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.maxPlayers && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Maximum Players
                      </span>
                      <div className="flex items-center gap-1">
                        <IconUsers className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formData.maxPlayers} players</span>
                      </div>
                    </div>
                  )}

                  {formData.divisions && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Divisions
                      </span>
                      <span className="text-sm">{formData.divisions} divisions</span>
                    </div>
                  )}

                  {formData.hasSponsor && formData.sponsorName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Sponsor
                      </span>
                      <div className="flex items-center gap-2">
                        {sponsorLogoPreview && (
                          <div className="w-6 h-6 rounded-sm overflow-hidden bg-white border">
                            <img 
                              src={sponsorLogoPreview} 
                              alt="Sponsor logo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {formData.sponsorName}
                          </Badge>
                          {formData.sponsorWebsite && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {formData.sponsorWebsite}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Timeline */}
              {(formData.registrationDeadline || formData.startDate || formData.endDate) && (
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
                    {formData.registrationDeadline && (
                      <div className="relative flex items-center gap-4 pb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 z-10">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">Registration Deadline</h4>
                              <p className="text-xs text-muted-foreground">Last day to register</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {format(formData.registrationDeadline, "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(formData.registrationDeadline, "EEEE")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Start Date */}
                    {formData.startDate && (
                      <div className="relative flex items-center gap-4 pb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 z-10">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">League Start</h4>
                              <p className="text-xs text-muted-foreground">League begins</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {format(formData.startDate, "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(formData.startDate, "EEEE")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* End Date */}
                    {formData.endDate && (
                      <div className="relative flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 z-10">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">League End</h4>
                              <p className="text-xs text-muted-foreground">League concludes</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {format(formData.endDate, "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(formData.endDate, "EEEE")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Duration Summary */}
                  {formData.startDate && formData.endDate && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">League Duration</h4>
                          <p className="text-xs text-muted-foreground">
                            {Math.ceil(
                              (formData.endDate.getTime() - formData.startDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days total
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(formData.startDate, "MMM dd")} –{" "}
                            {format(formData.endDate, "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rules Preview */}
              {formData.rules && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-sm font-medium text-muted-foreground px-2">
                      League Rules
                    </span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formData.rules}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          {currentStep === "basic" ? (
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
                onClick={handleNextStep}
                disabled={loading || !isBasicStepValid}
                className="flex-1 sm:flex-none min-w-[120px]"
              >
                <IconArrowRight className="mr-2 h-4 w-4" />
                Next Step
              </Button>
            </>
          ) : currentStep === "details" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading || !isDetailsStepValid}
                className="flex-1 sm:flex-none min-w-[120px]"
              >
                <IconArrowRight className="mr-2 h-4 w-4" />
                Review Details
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={handleCreateLeague}
                disabled={loading}
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
