"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance, { endpoints } from "@/lib/endpoints";

type PackageTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

const PACKAGE_TIER_OPTIONS: { value: PackageTier; label: string }[] = [
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
];

const getSportTypeBadgeVariant = (sportType: string) => {
  switch (sportType?.toUpperCase()) {
    case "PADEL":
      return "default";
    case "PICKLEBALL":
      return "secondary";
    case "TENNIS":
      return "outline";
    default:
      return "outline";
  }
};

interface League {
  id: string;
  name: string;
  sportType: string;
}

interface SponsorFormData {
  sponsoredName: string;
  packageTier: PackageTier;
  contractAmount: number | null;
  sponsorRevenue: number | null;
  leagueIds: string[];
}

interface SponsorCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSponsorCreated?: () => Promise<void>;
}

export function CreateSponsorModal({
  open,
  onOpenChange,
  onSponsorCreated,
}: SponsorCreateModalProps) {
  const [formData, setFormData] = useState<SponsorFormData>({
    sponsoredName: "",
    packageTier: "BRONZE",
    contractAmount: null,
    sponsorRevenue: null,
    leagueIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [leagueSelectOpen, setLeagueSelectOpen] = useState(false);
  const [leagueSearchTerm, setLeagueSearchTerm] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch leagues on mount
  useEffect(() => {
    if (open) {
      setLeaguesLoading(true);
      axiosInstance
        .get(endpoints.league.getAll)
        .then((res) => {
          console.log("Leagues API response:", res.data);
          // The leagues are nested under data.leagues
          const leaguesData = res.data?.data?.leagues || res.data?.leagues || [];
          // Ensure we always set an array
          if (Array.isArray(leaguesData)) {
            setLeagues(leaguesData);
          } else {
            console.warn("Leagues data is not an array:", leaguesData);
            setLeagues([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching leagues:", error);
          setLeagues([]);
        })
        .finally(() => setLeaguesLoading(false));
    }
  }, [open]);

  const toggleLeague = (leagueId: string) => {
    setFormData((prev) => ({
      ...prev,
      leagueIds: prev.leagueIds.includes(leagueId)
        ? prev.leagueIds.filter((id) => id !== leagueId)
        : [...prev.leagueIds, leagueId],
    }));
  };

  const removeLeague = (leagueId: string) => {
    setFormData((prev) => ({
      ...prev,
      leagueIds: prev.leagueIds.filter((id) => id !== leagueId),
    }));
  };

  const selectedLeagues = leagues.filter((league) => formData.leagueIds.includes(league.id));
  
  // Filter leagues based on search term
  const filteredLeagues = leagues.filter((league) =>
    league.name.toLowerCase().includes(leagueSearchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.sponsoredName || !formData.packageTier || formData.leagueIds.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(endpoints.sponsors.create, {
        sponsoredName: formData.sponsoredName,
        packageTier: formData.packageTier,
        contractAmount: formData.contractAmount,
        sponsorRevenue: formData.sponsorRevenue,
        leagueIds: formData.leagueIds,
      });

      toast.success("Sponsor created successfully!");
      onOpenChange(false);
      if (onSponsorCreated) {
        await onSponsorCreated();
      }
      
      // Reset form
      setFormData({
        sponsoredName: "",
        packageTier: "BRONZE",
        contractAmount: null,
        sponsorRevenue: null,
        leagueIds: [],
      });
    } catch (err: any) {
      console.error("Error creating sponsor:", err);
      toast.error(err.response?.data?.message || "Failed to create sponsor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Sponsor</DialogTitle>
          <DialogDescription>
            Create a new sponsorship package with league assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="sponsoredName">Sponsor Name *</Label>
            <Input
              id="sponsoredName"
              value={formData.sponsoredName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sponsoredName: e.target.value,
                }))
              }
              placeholder="Enter sponsor name"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageTier">Package Tier *</Label>
            <Select
              value={formData.packageTier}
              onValueChange={(value: PackageTier) =>
                setFormData((prev) => ({
                  ...prev,
                  packageTier: value,
                }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select package tier" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_TIER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contractAmount">Contract Amount (RM)</Label>
              <Input
                id="contractAmount"
                type="number"
                step="0.01"
                value={formData.contractAmount || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contractAmount: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="0.00"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorRevenue">Expected Revenue (RM)</Label>
              <Input
                id="sponsorRevenue"
                type="number"
                step="0.01"
                value={formData.sponsorRevenue || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sponsorRevenue: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="0.00"
                className="h-11"
              />
            </div>
          </div>

          {/* League Selection */}
          <div className="space-y-2">
            <Label>Select Leagues *</Label>
            <Popover open={leagueSelectOpen} onOpenChange={setLeagueSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={leagueSelectOpen}
                  className="w-full justify-between h-11"
                >
                  {selectedLeagues.length > 0
                    ? `${selectedLeagues.length} league(s) selected`
                    : "Select leagues..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" style={{ maxHeight: '400px' }}>
                <div className="p-2">
                  <Input 
                    placeholder="Search leagues..." 
                    className="mb-2"
                    value={leagueSearchTerm}
                    onChange={(e) => setLeagueSearchTerm(e.target.value)}
                  />
                  <div 
                    ref={scrollContainerRef}
                    className="max-h-64 overflow-y-auto overflow-x-hidden"
                    style={{ 
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6',
                      WebkitOverflowScrolling: 'touch'
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop += e.deltaY;
                      }
                    }}
                  >
                    {leaguesLoading ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Loading leagues...
                      </div>
                    ) : filteredLeagues.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {leagueSearchTerm ? "No leagues found matching your search." : "No leagues found."}
                      </div>
                    ) : (
                      filteredLeagues.map((league) => (
                        <div
                          key={league.id}
                          onClick={() => toggleLeague(league.id)}
                          className={cn(
                            "flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                            formData.leagueIds.includes(league.id) && "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.leagueIds.includes(league.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="font-medium">{league.name}</span>
                          </div>
                          <Badge 
                            variant={getSportTypeBadgeVariant(league.sportType)} 
                            className="text-xs capitalize"
                          >
                            {league.sportType?.toLowerCase() || "Unknown"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Selected Leagues */}
            {selectedLeagues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedLeagues.map((league) => (
                  <Badge key={league.id} variant="secondary" className="flex items-center gap-1">
                    {league.name}
                    <IconX
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeLeague(league.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.sponsoredName ||
              !formData.packageTier ||
              formData.leagueIds.length === 0
            }
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Sponsor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}