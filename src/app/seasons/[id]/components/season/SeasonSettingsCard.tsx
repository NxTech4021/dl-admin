'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Season } from '@/constants/zod/season-schema';
import { toast } from 'sonner';
import axiosInstance, { endpoints } from '@/lib/endpoints';
import { getErrorMessage } from '@/lib/api-error';

interface SeasonSettingsCardProps {
  season: Season;
  onSeasonUpdated?: () => Promise<void>;
}

type SeasonSettings = {
  isActive: boolean;
  withdrawalEnabled: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
};

const settingLabels: Record<keyof SeasonSettings, { label: string; description: string }> = {
  isActive: {
    label: "Season Active",
    description: "Controls whether this season is live and accepting registrations",
  },
  withdrawalEnabled: {
    label: "Allow Withdrawals",
    description: "Players can submit withdrawal requests from this season",
  },
  paymentRequired: {
    label: "Payment Required",
    description: "Players must pay the entry fee to complete registration",
  },
  promoCodeSupported: {
    label: "Promo Codes",
    description: "Allow promotional codes for discounted registration",
  },
};

export default function SeasonSettingsCard({ season, onSeasonUpdated }: SeasonSettingsCardProps) {
  const [settings, setSettings] = useState<SeasonSettings>({
    isActive: season.status === 'ACTIVE',
    withdrawalEnabled: season.withdrawalEnabled ?? false,
    paymentRequired: season.paymentRequired ?? false,
    promoCodeSupported: season.promoCodeSupported ?? false,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSwitchChange = (key: keyof SeasonSettings) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // If entry fee is 0, payment can't be required
      if (key === 'paymentRequired' && updated.paymentRequired && Number(season.entryFee ?? 0) === 0) {
        toast.info("Payment cannot be required for free seasons");
        return prev;
      }
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put(endpoints.season.update(season.id), {
        isActive: settings.isActive,
        status: settings.isActive ? 'ACTIVE' : 'UPCOMING',
        withdrawalEnabled: settings.withdrawalEnabled,
        paymentRequired: settings.paymentRequired,
        promoCodeSupported: settings.promoCodeSupported,
      });
      setIsDirty(false);
      toast.success('Season settings updated');
      await onSeasonUpdated?.();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update settings'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Settings</CardTitle>
        <CardDescription>Configure season behavior and visibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {(Object.entries(settingLabels) as [keyof SeasonSettings, { label: string; description: string }][]).map(([key, { label, description }]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={key} className="flex flex-col gap-0.5">
                <span className="font-medium">{label}</span>
                <span className="text-xs text-muted-foreground font-normal">{description}</span>
              </Label>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => handleSwitchChange(key)}
                disabled={isSaving}
              />
            </div>
          ))}
        </div>

        {/* TODO(#048): Add "Lock Ratings" / "Unlock Ratings" toggle here.
          Backend ready:
            - GET  endpoints.admin.ratings.getLockStatus(season.id) → { locked: boolean }
            - POST endpoints.admin.ratings.lockSeason(season.id)   → prevents rating changes
            - POST endpoints.admin.ratings.unlockSeason(season.id) → re-enables rating changes
          UX: Show lock status badge + toggle button with confirmation dialog.
          Use case: Lock ratings at end of season to prevent accidental changes during awards/reporting.
        */}

        {/* TODO(#048): Add "Recalculate Season Ratings" button here.
          Backend ready:
            - POST endpoints.admin.ratings.recalculateSeason(season.id)
          UX: Confirmation dialog showing affected division/player count.
          Use case: After voiding/editing multiple match results, recalculate all standings at once.
        */}

        {/* TODO(#048): Add "Export Ratings" button here.
          Backend ready:
            - GET endpoints.admin.ratings.exportSeason(season.id) → CSV/JSON download
          UX: Simple download button, maybe with format selector (CSV vs JSON).
          Use case: End-of-season reporting, sharing standings with stakeholders.
        */}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={!isDirty || isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Settings Update</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to update these settings? This will affect how users interact with this season.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>
                Update Settings
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
