"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  IconEdit, 
  IconAlertCircle, 
  IconDeviceFloppy, 
  IconX, 
  IconCheck, 
  IconArrowLeft,
  IconTrophy,
  IconTrash,
  IconHistory,
  IconUsers,
  IconCalendar,
  IconMapPin,
  IconUpload,
  IconPhoto,
  IconCurrencyDollar,
  IconLoader2,
  IconGift
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { PrizeStructureModal } from "@/components/modal";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { leagueService } from "@/lib/league-service";

// Add sports and format options
const SPORTS_OPTIONS = [
  { value: "tennis", label: "Tennis" },
  { value: "pickleball", label: "Pickleball" },
  { value: "padel", label: "Padel" },
];

const FORMAT_OPTIONS = [
  { value: "singles", label: "Singles" },
  { value: "doubles", label: "Doubles" },
  { value: "mixed-doubles", label: "Mixed Doubles" },
  { value: "team", label: "Team" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "registration", label: "Registration Open" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
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

interface FormData {
  leagueName: string;
  sport: string;
  status: string;
  location: string;
  format: string;
  entryFee: string;
  maxPlayers: string;
  divisions: string;
  hasSponsor: boolean;
  sponsorName: string;
  sponsorWebsite: string;
  sponsorEmail: string;
  sponsorLogo: string;
  description: string;
  rules: string;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
}

interface FormErrors {
  leagueName?: string;
  sport?: string;
  location?: string;
  format?: string;
  entryFee?: string;
  maxPlayers?: string;
  divisions?: string;
  sponsorName?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
}

interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: "draft" | "registration" | "active" | "completed" | "cancelled" | "archived";
  playerCount: number;
  maxPlayers: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  divisions: number;
  pendingRequests: number;
  format?: string;
  entryFee?: number;
  description?: string;
  rules?: string;
  sponsor?: {
    name: string;
    website?: string;
    email?: string;
    logo?: string;
  };
  prizes?: {
    id: string;
    position: number;
    title: string;
    type: "cash" | "voucher" | "trophy" | "medal" | "gift" | "other";
    value: number;
    description: string;
    sponsor?: string;
    quantity: number;
    currency: string;
  }[];
}

// Mock league data - in real app, this would come from API
const mockLeagues: Record<string, League> = {
  "1": {
    id: "1",
    name: "KL Tennis Championship",
    sport: "tennis",
    location: "kuala-lumpur",
    status: "active",
    playerCount: 24,
    maxPlayers: 32,
    registrationDeadline: "2024-01-15",
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    createdAt: "2024-01-01",
    createdBy: "Admin User",
    divisions: 3,
    pendingRequests: 5,
    format: "singles",
    entryFee: 150,
    description: "Premier tennis championship in Kuala Lumpur featuring multiple divisions for players of all skill levels.",
    rules: "Best of 3 sets format. 2-point advantage required. All matches must be played within scheduled timeframe.",
    sponsor: {
      name: "SportsTech Malaysia",
      website: "https://sportstech.my",
      email: "contact@sportstech.my",
      logo: "/sponsors/sportstech.png"
    },
    prizes: [
      {
        id: "1",
        position: 1,
        title: "Champion",
        type: "cash",
        value: 2000,
        description: "First place cash prize plus trophy",
        quantity: 1,
        currency: "RM"
      },
      {
        id: "2",
        position: 2,
        title: "Runner-up",
        type: "cash",
        value: 1000,
        description: "Second place cash prize plus medal",
        quantity: 1,
        currency: "RM"
      },
      {
        id: "3",
        position: 3,
        title: "Third Place",
        type: "cash",
        value: 500,
        description: "Third place cash prize plus medal",
        quantity: 1,
        currency: "RM"
      }
    ]
  },
  "2": {
    id: "2",
    name: "PJ Pickleball League",
    sport: "pickleball",
    location: "petaling-jaya",
    status: "registration",
    playerCount: 16,
    maxPlayers: 24,
    registrationDeadline: "2024-02-01",
    startDate: "2024-02-05",
    endDate: "2024-04-05",
    createdAt: "2024-01-10",
    createdBy: "Admin User",
    divisions: 2,
    pendingRequests: 12,
    format: "doubles",
    entryFee: 120,
    description: "Competitive pickleball league for intermediate to advanced players in Petaling Jaya.",
    rules: "Standard pickleball rules apply. Best of 3 games to 11 points. Win by 2 points.",
  },
};

export default function EditLeaguePage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState<FormData>({
    leagueName: "",
    sport: "",
    status: "active",
    location: "",
    format: "",
    entryFee: "",
    maxPlayers: "",
    divisions: "",
    hasSponsor: false,
    sponsorName: "",
    sponsorWebsite: "",
    sponsorEmail: "",
    sponsorLogo: "",
    description: "",
    rules: "",
    startDate: undefined,
    endDate: undefined,
    registrationDeadline: undefined,
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // File upload states
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load league data
  useEffect(() => {
    const loadLeague = async () => {
      setIsLoading(true);
      try {
        // Fetch league data from API
        const response = await leagueService.getLeagueById(leagueId);
        const apiLeague = response.data.league;

        if (!apiLeague) {
          toast.error("League not found");
          router.push("/league");
          return;
        }

        // Transform API data to component format
        const leagueData: League = {
          id: apiLeague.id,
          name: apiLeague.name,
          sport: apiLeague.sport.toLowerCase(),
          location: apiLeague.location,
          status: apiLeague.status.toLowerCase() as any,
          playerCount: 0,
          maxPlayers: apiLeague.settings?.maxPlayersPerDivision || 32,
          registrationDeadline: apiLeague.createdAt,
          startDate: apiLeague.createdAt,
          endDate: apiLeague.updatedAt,
          createdAt: apiLeague.createdAt,
          createdBy: "Admin User",
          divisions: 0,
          pendingRequests: apiLeague._count?.joinRequests || 0,
          format: "singles", // TODO: Get from settings
          entryFee: apiLeague.settings?.paymentSettings?.fees?.flat || 0,
          description: apiLeague.description,
          rules: apiLeague.settings?.customRulesText,
          sponsor: apiLeague.brandingLogoUrl ? {
            name: "Sponsor",
            logo: apiLeague.brandingLogoUrl
          } : undefined
        };

        setLeague(leagueData);
        const initialFormData = {
          leagueName: leagueData.name,
          sport: leagueData.sport,
          status: leagueData.status,
          location: leagueData.location,
          format: leagueData.format || "",
          entryFee: leagueData.entryFee?.toString() || "",
          maxPlayers: leagueData.maxPlayers?.toString() || "",
          divisions: leagueData.divisions?.toString() || "",
          hasSponsor: !!leagueData.sponsor,
          sponsorName: leagueData.sponsor?.name || "",
          sponsorWebsite: leagueData.sponsor?.website || "",
          sponsorEmail: leagueData.sponsor?.email || "",
          sponsorLogo: leagueData.sponsor?.logo || "",
          description: leagueData.description || "",
          rules: leagueData.rules || "",
          startDate: leagueData.startDate ? new Date(leagueData.startDate) : undefined,
          endDate: leagueData.endDate ? new Date(leagueData.endDate) : undefined,
          registrationDeadline: leagueData.registrationDeadline ? new Date(leagueData.registrationDeadline) : undefined,
        };
        setFormData(initialFormData);
        setOriginalData(initialFormData);

        // Set sponsor logo preview if exists
        if (leagueData.sponsor?.logo) {
          setSponsorLogoPreview(leagueData.sponsor.logo);
        }
      } catch (error: any) {
        console.error("Error loading league:", error);
        toast.error(error?.response?.data?.message || "Failed to load league data");
        // Fallback to mock data
        const leagueData = mockLeagues[leagueId];
        if (leagueData) {
          setLeague(leagueData);
          const initialFormData = {
            leagueName: leagueData.name,
            sport: leagueData.sport,
            status: leagueData.status,
            location: leagueData.location,
            format: leagueData.format || "",
            entryFee: leagueData.entryFee?.toString() || "",
            maxPlayers: leagueData.maxPlayers?.toString() || "",
            divisions: leagueData.divisions?.toString() || "",
            hasSponsor: !!leagueData.sponsor,
            sponsorName: leagueData.sponsor?.name || "",
            sponsorWebsite: leagueData.sponsor?.website || "",
            sponsorEmail: leagueData.sponsor?.email || "",
            sponsorLogo: leagueData.sponsor?.logo || "",
            description: leagueData.description || "",
            rules: leagueData.rules || "",
            startDate: leagueData.startDate ? new Date(leagueData.startDate) : undefined,
            endDate: leagueData.endDate ? new Date(leagueData.endDate) : undefined,
            registrationDeadline: leagueData.registrationDeadline ? new Date(leagueData.registrationDeadline) : undefined,
          };
          setFormData(initialFormData);
          setOriginalData(initialFormData);
        } else {
          router.push("/league");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (leagueId) {
      loadLeague();
    }
  }, [leagueId, router]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // League Name validation
    if (!formData.leagueName.trim()) {
      newErrors.leagueName = "League Name is required";
    } else if (formData.leagueName.trim().length > 255) {
      newErrors.leagueName = "League Name must be 255 characters or less";
    }

    // Sport validation
    if (!formData.sport) {
      newErrors.sport = "Sport selection is required";
    }

    // Location validation
    if (!formData.location) {
      newErrors.location = "Location selection is required";
    }

    // Format validation
    if (!formData.format) {
      newErrors.format = "Format selection is required";
    }

    // Entry Fee validation
    if (!formData.entryFee || formData.entryFee === "") {
      newErrors.entryFee = "Entry fee is required";
    } else if (isNaN(Number(formData.entryFee)) || Number(formData.entryFee) < 0) {
      newErrors.entryFee = "Entry fee must be a valid positive number";
    }

    // Max Players validation
    if (!formData.maxPlayers || formData.maxPlayers === "") {
      newErrors.maxPlayers = "Maximum players is required";
    } else if (isNaN(Number(formData.maxPlayers)) || Number(formData.maxPlayers) < 1) {
      newErrors.maxPlayers = "Maximum players must be at least 1";
    }

    // Divisions validation
    if (!formData.divisions || formData.divisions === "") {
      newErrors.divisions = "Number of divisions is required";
    } else if (isNaN(Number(formData.divisions)) || Number(formData.divisions) < 1) {
      newErrors.divisions = "Number of divisions must be at least 1";
    }

    // Start Date validation
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // End Date validation
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    // Date consistency validation
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.registrationDeadline && formData.startDate && formData.registrationDeadline >= formData.startDate) {
      newErrors.registrationDeadline = "Registration deadline must be before start date";
    }

    // Sponsor validation
    if (formData.hasSponsor && !formData.sponsorName.trim()) {
      newErrors.sponsorName = "Sponsor name is required when sponsor is enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update data for API
      const updateData = {
        name: formData.leagueName,
        sport: formData.sport,
        location: formData.location,
        status: formData.status.toUpperCase() as "DRAFT" | "REGISTRATION" | "ACTIVE" | "COMPLETED",
        description: formData.description || undefined,
        brandingLogoUrl: formData.sponsorLogo || undefined,
      };

      // Call backend API to update league
      await leagueService.updateLeague(leagueId, updateData);

      toast.success("League updated successfully!");
      setOriginalData(formData);
      setHasChanges(false);

      // Optionally redirect back to league list
      // router.push("/league");

    } catch (error: any) {
      console.error("Error updating league:", error);
      toast.error(error?.response?.data?.message || "Failed to update league. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
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
    handleInputChange("sponsorLogo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Show confirmation dialog if there are unsaved changes
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setHasChanges(false);
      toast.info("Form reset to original values");
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("League deleted successfully!");
      router.push("/league?tab=manage");
    } catch (error) {
      toast.error("Failed to delete league");
    }
  };

  const getSportLabel = (sportValue: string) => {
    return SPORTS_OPTIONS.find(sport => sport.value === sportValue)?.label || sportValue;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Loading league data...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!league) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">League Not Found</h2>
              <p className="text-muted-foreground mb-4">The requested league could not be found.</p>
              <Button onClick={() => router.push("/league")}>
                Back to Leagues
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader items={[{ label: "League", href: "/league" }, { label: league ? league.name : "Details", href: `/league/view/${leagueId}` }, { label: "Edit" }]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-gradient-to-r from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-8">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <IconArrowLeft className="size-4 mr-2" />
                        Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconEdit className="size-8 text-primary" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight">Edit League</h1>
                          <p className="text-muted-foreground">
                            Modify league details and settings
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Edit Form */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconEdit className="size-5" />
                          League Details
                          {hasChanges && (
                            <Badge variant="secondary" className="ml-2">
                              Unsaved Changes
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Update the league information below
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* League Name */}
                          <div className="space-y-2">
                            <Label htmlFor="leagueName" className="text-sm font-medium">
                              League Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="leagueName"
                              type="text"
                              placeholder="Enter league name"
                              value={formData.leagueName}
                              onChange={(e) => handleInputChange("leagueName", e.target.value)}
                              className={errors.leagueName ? "border-red-500" : ""}
                              maxLength={255}
                            />
                            {errors.leagueName && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.leagueName}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formData.leagueName.length}/255 characters
                            </p>
                          </div>

                          {/* Sport */}
                          <div className="space-y-2">
                            <Label htmlFor="sport" className="text-sm font-medium">
                              Sport <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.sport}
                              onValueChange={(value) => handleInputChange("sport", value)}
                            >
                              <SelectTrigger className={errors.sport ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select a sport" />
                              </SelectTrigger>
                              <SelectContent>
                                {SPORTS_OPTIONS.map((sport) => (
                                  <SelectItem key={sport.value} value={sport.value}>
                                    {sport.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.sport && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.sport}
                              </div>
                            )}
                          </div>

                          {/* League Status */}
                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">
                              League Status
                            </Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value) => handleInputChange("status", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">Draft</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="registration">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">Registration</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="active">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="default">Active</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">Completed</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="destructive">Cancelled</Badge>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Location */}
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium">
                              Location <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                              value={formData.location} 
                              onValueChange={(value) => handleInputChange("location", value)}
                            >
                              <SelectTrigger className={`w-full ${errors.location ? "border-red-500" : ""}`}>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                {LOCATION_OPTIONS.map((location) => (
                                  <SelectItem key={location.value} value={location.value}>
                                    {location.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.location && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.location}
                              </div>
                            )}
                          </div>

                          {/* Format */}
                          <div className="space-y-2">
                            <Label htmlFor="format" className="text-sm font-medium">
                              Format <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.format}
                              onValueChange={(value) => handleInputChange("format", value)}
                            >
                              <SelectTrigger className={errors.format ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent>
                                {FORMAT_OPTIONS.map((format) => (
                                  <SelectItem key={format.value} value={format.value}>
                                    {format.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.format && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.format}
                              </div>
                            )}
                          </div>

                          {/* Entry Fee */}
                          <div className="space-y-2">
                            <Label htmlFor="entryFee" className="text-sm font-medium">
                              Entry Fee (RM) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                              <Input
                                id="entryFee"
                                type="number"
                                placeholder="0"
                                value={formData.entryFee}
                                onChange={(e) => handleInputChange("entryFee", e.target.value)}
                                className={`pl-10 ${errors.entryFee ? "border-red-500" : ""}`}
                                min="0"
                                step="1"
                              />
                            </div>
                            {errors.entryFee && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.entryFee}
                              </div>
                            )}
                          </div>

                          {/* Max Players */}
                          <div className="space-y-2">
                            <Label htmlFor="maxPlayers" className="text-sm font-medium">
                              Maximum Players <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <IconUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                              <Input
                                id="maxPlayers"
                                type="number"
                                placeholder="32"
                                value={formData.maxPlayers}
                                onChange={(e) => handleInputChange("maxPlayers", e.target.value)}
                                className={`pl-10 ${errors.maxPlayers ? "border-red-500" : ""}`}
                                min="1"
                                step="1"
                              />
                            </div>
                            {errors.maxPlayers && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.maxPlayers}
                              </div>
                            )}
                          </div>

                          {/* Divisions */}
                          <div className="space-y-2">
                            <Label htmlFor="divisions" className="text-sm font-medium">
                              Number of Divisions <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <IconTrophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                              <Input
                                id="divisions"
                                type="number"
                                placeholder="1"
                                value={formData.divisions}
                                onChange={(e) => handleInputChange("divisions", e.target.value)}
                                className={`pl-10 ${errors.divisions ? "border-red-500" : ""}`}
                                min="1"
                                step="1"
                              />
                            </div>
                            {errors.divisions && (
                              <div className="flex items-center gap-2 text-sm text-red-500">
                                <IconAlertCircle className="size-4" />
                                {errors.divisions}
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Dates Section */}
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Dates & Timeline</h3>
                            
                            {/* Start Date */}
                            <div className="space-y-2">
                              <Label htmlFor="startDate" className="text-sm font-medium">
                                Start Date <span className="text-red-500">*</span>
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!formData.startDate && "text-muted-foreground"} ${errors.startDate ? "border-red-500" : ""}`}
                                  >
                                    <IconCalendar className="mr-2 h-4 w-4" />
                                    {formData.startDate ? format(formData.startDate, "PPP") : "Select start date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={formData.startDate}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.startDate && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <IconAlertCircle className="size-4" />
                                  {errors.startDate}
                                </div>
                              )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                              <Label htmlFor="endDate" className="text-sm font-medium">
                                End Date <span className="text-red-500">*</span>
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!formData.endDate && "text-muted-foreground"} ${errors.endDate ? "border-red-500" : ""}`}
                                  >
                                    <IconCalendar className="mr-2 h-4 w-4" />
                                    {formData.endDate ? format(formData.endDate, "PPP") : "Select end date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={formData.endDate}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.endDate && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <IconAlertCircle className="size-4" />
                                  {errors.endDate}
                                </div>
                              )}
                            </div>

                            {/* Registration Deadline */}
                            <div className="space-y-2">
                              <Label htmlFor="registrationDeadline" className="text-sm font-medium">
                                Registration Deadline (Optional)
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!formData.registrationDeadline && "text-muted-foreground"} ${errors.registrationDeadline ? "border-red-500" : ""}`}
                                  >
                                    <IconCalendar className="mr-2 h-4 w-4" />
                                    {formData.registrationDeadline ? format(formData.registrationDeadline, "PPP") : "Select registration deadline"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={formData.registrationDeadline}
                                    onSelect={(date) => setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {errors.registrationDeadline && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <IconAlertCircle className="size-4" />
                                  {errors.registrationDeadline}
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Sponsor Section */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hasSponsor"
                                checked={formData.hasSponsor}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasSponsor: checked as boolean }))}
                              />
                              <Label htmlFor="hasSponsor" className="text-sm font-medium">
                                This league has a sponsor
                              </Label>
                            </div>

                            {formData.hasSponsor && (
                              <div className="space-y-4 pl-6 border-l-2 border-muted">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Sponsor Name */}
                                  <div className="space-y-2">
                                    <Label htmlFor="sponsorName" className="text-sm font-medium">
                                      Sponsor Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      id="sponsorName"
                                      type="text"
                                      placeholder="Enter sponsor name"
                                      value={formData.sponsorName}
                                      onChange={(e) => handleInputChange("sponsorName", e.target.value)}
                                      className={errors.sponsorName ? "border-red-500" : ""}
                                    />
                                    {errors.sponsorName && (
                                      <div className="flex items-center gap-2 text-sm text-red-500">
                                        <IconAlertCircle className="size-4" />
                                        {errors.sponsorName}
                                      </div>
                                    )}
                                  </div>

                                  {/* Sponsor Website */}
                                  <div className="space-y-2">
                                    <Label htmlFor="sponsorWebsite" className="text-sm font-medium">
                                      Website (Optional)
                                    </Label>
                                    <Input
                                      id="sponsorWebsite"
                                      type="url"
                                      placeholder="https://sponsor-website.com"
                                      value={formData.sponsorWebsite}
                                      onChange={(e) => handleInputChange("sponsorWebsite", e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Sponsor Email */}
                                  <div className="space-y-2">
                                    <Label htmlFor="sponsorEmail" className="text-sm font-medium">
                                      Contact Email (Optional)
                                    </Label>
                                    <Input
                                      id="sponsorEmail"
                                      type="email"
                                      placeholder="contact@sponsor.com"
                                      value={formData.sponsorEmail}
                                      onChange={(e) => handleInputChange("sponsorEmail", e.target.value)}
                                    />
                                  </div>

                                  {/* Sponsor Logo Upload */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                      Logo (Optional)
                                    </Label>
                                    
                                    {!sponsorLogoPreview ? (
                                      <div className="space-y-2">
                                        <div 
                                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                                          onClick={() => fileInputRef.current?.click()}
                                        >
                                          <IconUpload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                          <p className="text-sm text-muted-foreground mb-1">
                                            Click to upload sponsor logo
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            PNG, JPG, GIF, WebP up to 5MB
                                          </p>
                                        </div>
                                        <input
                                          ref={fileInputRef}
                                          type="file"
                                          accept="image/*"
                                          onChange={handleFileSelect}
                                          className="hidden"
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="relative border rounded-lg p-4 bg-muted/30">
                                          <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-white border">
                                              <img 
                                                src={sponsorLogoPreview} 
                                                alt="Logo preview" 
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-sm font-medium">{sponsorLogoFile?.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {sponsorLogoFile && (sponsorLogoFile.size / 1024).toFixed(1)} KB
                                              </p>
                                            </div>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={handleRemoveLogo}
                                              className="h-8 w-8 p-0"
                                            >
                                              <IconX className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => fileInputRef.current?.click()}
                                          className="w-full"
                                        >
                                          <IconPhoto className="mr-2 h-4 w-4" />
                                          Change Logo
                                        </Button>
                                        <input
                                          ref={fileInputRef}
                                          type="file"
                                          accept="image/*"
                                          onChange={handleFileSelect}
                                          className="hidden"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Description */}
                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                              Description (Optional)
                            </Label>
                            <Textarea
                              id="description"
                              placeholder="Describe the league, its purpose, and any special features..."
                              value={formData.description}
                              onChange={(e) => handleInputChange("description", e.target.value)}
                              rows={4}
                              className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                              {formData.description.length}/500 characters
                            </p>
                          </div>

                          {/* Rules */}
                          <div className="space-y-2">
                            <Label htmlFor="rules" className="text-sm font-medium">
                              Rules & Regulations (Optional)
                            </Label>
                            <Textarea
                              id="rules"
                              placeholder="Enter league rules and regulations..."
                              value={formData.rules}
                              onChange={(e) => handleInputChange("rules", e.target.value)}
                              rows={4}
                              className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                              {formData.rules.length}/1000 characters
                            </p>
                          </div>

                          <Separator />

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <IconX className="size-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={!hasChanges}
                              >
                                Reset
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" type="button">
                                    <IconTrash className="size-4 mr-2" />
                                    Delete League
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete League</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{league.name}"? This action cannot be undone.
                                      All associated data including players, matches, and statistics will be permanently removed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDelete}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete League
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                type="submit"
                                disabled={isSubmitting || !hasChanges}
                                className="min-w-[120px]"
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center gap-2">
                                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Saving...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <IconDeviceFloppy className="size-4" />
                                    Save Changes
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar - League Info */}
                  <div className="space-y-6">
                    {/* Current League Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconTrophy className="size-4" />
                          Current League Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sport:</span>
                            <Badge variant="outline">{getSportLabel(league.sport)}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={league.status === 'active' ? 'default' : 'secondary'}>
                              {league.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Location:</span>
                            <span>{LOCATION_OPTIONS.find(loc => loc.value === league.location)?.label || league.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Players:</span>
                            <span>{league.playerCount}/{league.maxPlayers}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Divisions:</span>
                            <span>{league.divisions}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pending Requests:</span>
                            <Badge variant={league.pendingRequests > 0 ? "secondary" : "outline"}>
                              {league.pendingRequests}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* League Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconCalendar className="size-4" />
                          Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <IconHistory className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Created</div>
                            <div className="text-muted-foreground">{formatDate(league.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconUsers className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Registration Deadline</div>
                            <div className="text-muted-foreground">{formatDate(league.registrationDeadline)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconCalendar className="size-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">League Duration</div>
                            <div className="text-muted-foreground">
                              {formatDate(league.startDate)} - {formatDate(league.endDate)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => router.push(`/league/settings?leagueId=${league.id}`)}
                        >
                          <IconTrophy className="size-4 mr-2" />
                          League Settings
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => router.push(`/league/requests/${league.id}`)}
                        >
                          <IconUsers className="size-4 mr-2" />
                          Join Requests
                          {league.pendingRequests > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {league.pendingRequests}
                            </Badge>
                          )}
                        </Button>
                        <PrizeStructureModal
                          currentPrizes={league.prizes}
                          onPrizesUpdate={(prizes) => {
                            console.log("Prizes updated for league:", league.id, prizes);
                            toast.success("Prize structure updated!");
                          }}
                          leagueName={league.name}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <IconGift className="size-4 mr-2" />
                            Prize Structure
                          </Button>
                        </PrizeStructureModal>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => router.push(`/league/view/${league.id}`)}
                        >
                          <IconMapPin className="size-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
