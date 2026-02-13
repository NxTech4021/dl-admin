

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { IconBuilding, IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";
import { useConfirmationModal } from "@/hooks/use-confirmation-modal";
import { ConfirmationModal } from "@/components/modal/confirmation-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Sponsorship, type SponsorTier } from "@/constants/types/league";
import { formatDateShort, formatCurrencyMYR } from "./types";

/** Available sponsor option for selection dropdown */
interface SponsorSelectOption {
  id: string;
  label: string;
}

interface LeagueSponsorsSectionProps {
  sponsorships: Sponsorship[];
  leagueId?: string;
  /** Callback triggered after sponsor changes (assign/remove) to refresh data */
  onSponsorChanged?: () => void | Promise<void>;
}

export function LeagueSponsorsSection({
  sponsorships,
  leagueId,
  onSponsorChanged,
}: LeagueSponsorsSectionProps) {
  const navigate = useNavigate();
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [available, setAvailable] = React.useState<SponsorSelectOption[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Confirmation modal hook
  const confirmation = useConfirmationModal();

  // Reset selection and fetch sponsors when modal opens
  React.useEffect(() => {
    if (!isAssignOpen) return;
    setSelectedId("");

    const abortController = new AbortController();

    const fetchSponsors = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(endpoints.sponsors.getAll, {
          signal: abortController.signal,
        });
        const api = res.data;
        const rawSponsorships = (api?.data?.sponsorships ||
          api?.data ||
          api ||
          []) as Sponsorship[];
        const mapped: SponsorSelectOption[] = rawSponsorships.map((s) => ({
          id: s.id,
          label: s.company?.name || s.sponsoredName || "Unnamed Sponsor",
        }));
        setAvailable(mapped);
      } catch {
        if (abortController.signal.aborted) return;
        setAvailable([]);
        toast.error("Failed to load sponsors");
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSponsors();

    return () => {
      abortController.abort();
    };
  }, [isAssignOpen]);

  const handleAssign = () => {
    setIsAssignOpen(true);
  };

  const handleViewSponsor = (sponsorId?: string) => {
    if (!sponsorId) return;
    navigate({ to: `/utilities/sponsors/view/${sponsorId}` });
  };

  const handleDeleteSponsorClick = React.useCallback(
    (sponsorshipId: string, sponsorName: string) => {
      confirmation.showConfirmation({
        title: "Remove Sponsor",
        description: `Are you sure you want to remove "${sponsorName}" from this league?`,
        variant: "destructive",
        confirmText: "Remove",
        cancelText: "Cancel",
        onConfirm: async () => {
          confirmation.setLoading(true);
          try {
            await axiosInstance.delete(endpoints.sponsors.delete(sponsorshipId));
            toast.success(`"${sponsorName}" has been removed from the league`);
            confirmation.hideConfirmation();
            if (onSponsorChanged) {
              await onSponsorChanged();
            }
          } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Failed to remove sponsor from league"));
          } finally {
            confirmation.setLoading(false);
          }
        },
      });
    },
    [confirmation, onSponsorChanged]
  );

  const getTierColor = (tier: SponsorTier | string | undefined) => {
    switch (tier?.toUpperCase()) {
      case "PLATINUM":
        return "text-slate-700 bg-slate-100 border-slate-300";
      case "GOLD":
        return "text-yellow-700 bg-yellow-50 border-yellow-300";
      case "SILVER":
        return "text-gray-600 bg-gray-50 border-gray-300";
      case "BRONZE":
        return "text-orange-700 bg-orange-50 border-orange-300";
      default:
        return "text-gray-600 bg-gray-50 border-gray-300";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Sponsors
          </h3>
          {sponsorships?.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({sponsorships.length})
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAssign}
          className="h-8 px-2 text-xs"
          aria-label="Add sponsor to league"
        >
          <IconPlus className="w-3 h-3 mr-1" aria-hidden="true" />
          Add
        </Button>
      </div>

      {sponsorships && sponsorships.length > 0 ? (
        <div className="space-y-2" role="list" aria-label="Assigned sponsors">
          {sponsorships.map((s) => {
            const sponsorName = s.company?.name || s.sponsoredName || "Sponsor";
            return (
              <div
                key={s.id}
                className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleViewSponsor(s.company?.id)}
                role="listitem"
                aria-label={`Sponsor: ${sponsorName}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleViewSponsor(s.company?.id);
                  }
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <IconBuilding className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {sponsorName}
                      </h4>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${getTierColor(
                          s.tier || s.packageTier
                        )}`}
                      >
                        {s.tier || s.packageTier || "Standard"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {(s.amount || s.contractAmount) && (
                        <span className="font-medium">
                          {formatCurrencyMYR(Number(s.amount || s.contractAmount))}
                        </span>
                      )}
                      {s.startDate && <span>{formatDateShort(s.startDate)}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSponsorClick(s.id, sponsorName);
                  }}
                  aria-label={`Remove ${sponsorName} from league`}
                >
                  <IconTrash className="w-3 h-3" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6" role="status" aria-label="No sponsors assigned">
          <div className="w-8 h-8 rounded-md bg-muted mx-auto mb-2 flex items-center justify-center">
            <IconBuilding className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">No sponsors assigned</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &quot;Add&quot; to assign sponsors
          </p>
        </div>
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
                  <SelectValue
                    placeholder={loading ? "Loading..." : "Choose sponsorship"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {available.length > 0 ? (
                    available.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      {loading ? "Loading..." : "No sponsorships found"}
                    </SelectItem>
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
                disabled={!selectedId || !leagueId || submitting}
                onClick={async () => {
                  if (!selectedId || !leagueId || submitting) return;
                  setSubmitting(true);
                  try {
                    // Fetch sponsor's existing leagues to avoid overwriting them
                    // Backend PUT uses .set() (REPLACE), not .connect() (APPEND)
                    const sponsorRes = await axiosInstance.get(
                      endpoints.sponsors.getById(selectedId)
                    );
                    const existingLeagues: { id: string }[] =
                      sponsorRes.data?.data?.leagues || [];
                    const existingIds = existingLeagues.map((l) => l.id);

                    // Merge current league with existing ones (deduplicated)
                    const mergedIds = [
                      ...new Set([...existingIds, leagueId]),
                    ];

                    await axiosInstance.put(
                      endpoints.sponsors.update(selectedId),
                      {
                        leagueIds: mergedIds,
                      }
                    );

                    toast.success("Sponsor assigned to league");
                    setIsAssignOpen(false);
                    setSelectedId("");

                    // Refresh via callback instead of page reload
                    if (onSponsorChanged) {
                      await onSponsorChanged();
                    }
                  } catch (err: unknown) {
                    toast.error(getErrorMessage(err, "Failed to assign sponsor"));
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmation.open}
        onOpenChange={(open) => {
          if (!open) {
            confirmation.hideConfirmation();
          }
        }}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        onConfirm={confirmation.onConfirm}
        isLoading={confirmation.isLoading}
        variant={confirmation.variant}
      />
    </div>
  );
}

export default LeagueSponsorsSection;
