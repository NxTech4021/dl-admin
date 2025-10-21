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

interface League {
  id: string;
  name: string;
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
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search leagues..." />
                  <CommandEmpty>
                    {leaguesLoading ? "Loading leagues..." : "No leagues found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {leagues.map((league) => (
                      <CommandItem
                        key={league.id}
                        value={league.name}
                        onSelect={() => toggleLeague(league.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.leagueIds.includes(league.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {league.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
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