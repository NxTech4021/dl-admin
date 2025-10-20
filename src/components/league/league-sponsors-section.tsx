"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconBuilding, IconPlus, IconCurrencyDollar, IconCalendar, IconTrophy, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeagueSponsorsSectionProps {
  sponsorships: Array<any>;
  leagueId?: string;
  onAssignSponsor?: () => void;
}

export function LeagueSponsorsSection({ sponsorships, leagueId, onAssignSponsor }: LeagueSponsorsSectionProps) {
  const router = useRouter();
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [available, setAvailable] = React.useState<Array<{ id: string; label: string }>>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);


  console.log("LeagueSponsorsSection props:", { sponsorships, leagueId, onAssignSponsor });
  console.log("Sponsorships data:", sponsorships);
  console.log("Sponsorships type:", typeof sponsorships);
  console.log("Sponsorships is array:", Array.isArray(sponsorships));
  console.log("Sponsorships length:", sponsorships?.length);

  const handleAssign = () => {
    // Open inline modal to assign
    setIsAssignOpen(true);
    // Fetch sponsorships list for selection
    setLoading(true);
    axiosInstance
      .get(endpoints.sponsors.getAll)
      .then((res) => {
        const api = res.data;
        const sponsorships = (api?.data?.sponsorships || api?.data || api || []) as any[];
        const mapped = sponsorships.map((s: any) => ({
          id: s.id,
          label: s.company?.name || s.sponsoredName || "Unnamed Sponsor",
        }));
        setAvailable(mapped);
      })
      .catch(() => setAvailable([]))
      .finally(() => setLoading(false));
  };

  const handleViewSponsor = (sponsorId?: string) => {
    if (!sponsorId) return;
    router.push(`/sponsors/view/${sponsorId}`);
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM':
        return 'default';
      case 'GOLD':
        return 'secondary';
      case 'SILVER':
        return 'outline';
      case 'BRONZE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM':
        return 'text-slate-700 bg-slate-100 border-slate-300';
      case 'GOLD':
        return 'text-yellow-700 bg-yellow-50 border-yellow-300';
      case 'SILVER':
        return 'text-gray-600 bg-gray-50 border-gray-300';
      case 'BRONZE':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Sponsors</h3>
          {sponsorships?.length > 0 && (
            <span className="text-xs text-muted-foreground">({sponsorships.length})</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAssign}
          className="h-8 px-2 text-xs"
        >
          <IconPlus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Debug: Log rendering condition */}
      {console.log("Rendering condition check:", { 
        hasSponsorships: !!sponsorships, 
        isArray: Array.isArray(sponsorships), 
        length: sponsorships?.length,
        condition: sponsorships && sponsorships.length > 0
      })}
      
      {sponsorships && sponsorships.length > 0 ? (
        <div className="space-y-2">
          {console.log("Rendering sponsorships list:", sponsorships)}
          {sponsorships.map((s: any, index: number) => {
            console.log(`Sponsorship ${index}:`, s);
            return (
              <div
                key={s.id}
                className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleViewSponsor(s.company?.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <IconBuilding className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {s.company?.name || s.sponsoredName || "Sponsor"}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${getTierColor(s.tier || s.packageTier)}`}
                      >
                        {s.tier || s.packageTier || "Standard"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {(s.amount || s.contractAmount) && (
                        <span className="font-medium">
                          {formatCurrency(Number(s.amount || s.contractAmount))}
                        </span>
                      )}
                      {s.startDate && (
                        <span>{formatDate(s.startDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info("Remove sponsor functionality");
                  }}
                >
                  <IconTrash className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {console.log("Rendering no sponsors fallback")}
          <div className="text-center py-6">
            <div className="w-8 h-8 rounded-md bg-muted mx-auto mb-2 flex items-center justify-center">
              <IconBuilding className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No sponsors assigned</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Add" to assign sponsors
            </p>
          </div>
        </>
      )}

      {/* Assign Sponsor Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Assign Sponsor</DialogTitle>
            <DialogDescription>
              Select a sponsorship to assign to this league.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sponsorship</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={loading ? "Loading..." : "Choose sponsorship"} />
                </SelectTrigger>
                <SelectContent>
                  {available.length > 0 ? (
                    available.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">{loading ? "Loading..." : "No sponsorships found"}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedId || !leagueId}
                onClick={async () => {
                  if (!selectedId || !leagueId) return;
                  try {
                    console.log("Assigning sponsor:", { selectedId, leagueId });
                    console.log("API endpoint:", endpoints.sponsors.update(selectedId));
                    console.log("Payload:", { leagueId });
                    
                    const response = await axiosInstance.put(endpoints.sponsors.update(selectedId), {
                      leagueId: leagueId,
                    });
                    
                    console.log("Assignment response:", response.data);
                    toast.success("Sponsor assigned to league");
                    setIsAssignOpen(false);
                    setSelectedId("");
                    
                    // Force page reload to refresh data
                    window.location.reload();
                  } catch (err: any) {
                    console.error("Assignment error:", err);
                    console.error("Error response:", err?.response?.data);
                    toast.error(err?.response?.data?.message || "Failed to assign sponsor");
                  }
                }}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LeagueSponsorsSection;


