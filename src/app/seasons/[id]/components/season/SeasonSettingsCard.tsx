// app/seasons/[id]/components/SeasonSettingsCard.tsx
'use client';

import { useState } from 'react';
import { FullSeason } from '@/MockData/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SeasonSettingsCardProps {
  season: FullSeason;
}

export default function SeasonSettingsCard({ season }: SeasonSettingsCardProps) {
  const [settings, setSettings] = useState({
    isActive: season.isActive,
    paymentRequired: season.paymentRequired,
    promoCodeSupported: season.promoCodeSupported,
    withdrawalEnabled: season.withdrawalEnabled,
  });
  
  const [isDirty, setIsDirty] = useState(false);

  const handleSwitchChange = (key: keyof typeof settings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Implement API call to update settings here
    console.log('Saving new settings:', settings);
    setIsDirty(false);
  };

  const SettingRow = ({ label, keyName }: { label: string; keyName: keyof typeof settings }) => (
    <div className="flex items-center justify-between p-2 border-b last:border-b-0">
      <Label htmlFor={keyName} className="flex flex-col space-y-1">
        <span>{label}</span>
      </Label>
      <Switch
        id={keyName}
        checked={settings[keyName]}
        onCheckedChange={(checked) => handleSwitchChange(keyName, checked)}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <SettingRow label="Season is Active" keyName="isActive" />
          <SettingRow label="Payment Required" keyName="paymentRequired" />
          <SettingRow label="Promo Codes Supported" keyName="promoCodeSupported" />
          <SettingRow label="Withdrawal Enabled" keyName="withdrawalEnabled" />
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="mt-4 w-full" disabled={!isDirty}>
              Confirm & Save Changes
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will immediately update the season settings. Ensure the changes are correct before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}