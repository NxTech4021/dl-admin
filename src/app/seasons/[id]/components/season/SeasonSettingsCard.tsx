'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Season } from '@/constants/zod/season-schema';
import { toast } from 'sonner';

interface SeasonSettingsCardProps {
  season: Season;
}

type SeasonSettings = {
  isActive: boolean;
  registrationOpen: boolean;
  allowWithdrawals: boolean;
  requirePayment: boolean;
};

export default function SeasonSettingsCard({ season }: SeasonSettingsCardProps) {
  const [settings, setSettings] = useState<SeasonSettings>({
    isActive: season.status === 'ACTIVE',
    registrationOpen: true,
    allowWithdrawals: true,
    requirePayment: true,
  });
  
  const [isDirty, setIsDirty] = useState(false);

  const handleSwitchChange = (key: keyof SeasonSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // Implement your API call here
      // await axiosInstance.patch(`/api/seasons/${season.id}/settings`, settings);
      setIsDirty(false);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="flex flex-col">
                <span className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={() => handleSwitchChange(key as keyof SeasonSettings)}
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
            <Button className="w-full" disabled={!isDirty}>
              Save Changes
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