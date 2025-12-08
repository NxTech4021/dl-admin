"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconInfoCircle,
  IconUsers,
  IconUserX,
  IconBell,
  IconPlayerPlay,
  IconRotate,
} from "@tabler/icons-react";
import {
  useInactivitySettings,
  useInactivityStats,
  useUpdateInactivitySettings,
  useDeleteInactivitySettings,
  useTriggerInactivityCheck,
} from "@/hooks/use-queries";
import { inactivitySettingsFormSchema, type InactivitySettingsFormValues } from "@/constants/zod/inactivity-settings-schema";
import { toast } from "sonner";

export function InactivitySettingsCard() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useInactivitySettings();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useInactivityStats();
  const updateMutation = useUpdateInactivitySettings();
  const deleteMutation = useDeleteInactivitySettings();
  const triggerCheckMutation = useTriggerInactivityCheck();

  const form = useForm<InactivitySettingsFormValues>({
    resolver: zodResolver(inactivitySettingsFormSchema),
    defaultValues: {
      inactivityThresholdDays: 14,
      warningThresholdDays: null,
      autoMarkInactive: true,
      excludeFromPairing: true,
      sendReminderEmail: true,
      reminderDaysBefore: null,
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        inactivityThresholdDays: settings.inactivityThresholdDays,
        warningThresholdDays: settings.warningThresholdDays ?? null,
        autoMarkInactive: settings.autoMarkInactive,
        excludeFromPairing: settings.excludeFromPairing,
        sendReminderEmail: settings.sendReminderEmail,
        reminderDaysBefore: settings.reminderDaysBefore ?? null,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: InactivitySettingsFormValues) => {
    try {
      await updateMutation.mutateAsync({
        inactivityThresholdDays: data.inactivityThresholdDays,
        warningThresholdDays: data.warningThresholdDays ?? undefined,
        autoMarkInactive: data.autoMarkInactive,
        excludeFromPairing: data.excludeFromPairing,
        sendReminderEmail: data.sendReminderEmail,
        reminderDaysBefore: data.reminderDaysBefore ?? undefined,
      });
      toast.success("Inactivity settings updated successfully");
      setIsEditing(false);
      refetchSettings();
    } catch {
      toast.error("Failed to update settings. Please try again.");
    }
  };

  const handleCancel = () => {
    if (settings) {
      form.reset({
        inactivityThresholdDays: settings.inactivityThresholdDays,
        warningThresholdDays: settings.warningThresholdDays ?? null,
        autoMarkInactive: settings.autoMarkInactive,
        excludeFromPairing: settings.excludeFromPairing,
        sendReminderEmail: settings.sendReminderEmail,
        reminderDaysBefore: settings.reminderDaysBefore ?? null,
      });
    }
    setIsEditing(false);
  };

  const handleTriggerCheck = async () => {
    try {
      await triggerCheckMutation.mutateAsync();
      toast.success("Inactivity check triggered successfully. Players have been updated.");
      refetchStats();
    } catch {
      toast.error("Failed to trigger inactivity check. Please try again.");
    }
  };

  const handleResetToDefaults = async () => {
    if (!settings?.id) {
      toast.error("No settings to reset");
      return;
    }
    try {
      await deleteMutation.mutateAsync(settings.id);
      toast.success("Settings reset to defaults");
      refetchSettings();
    } catch {
      toast.error("Failed to reset settings. Please try again.");
    }
  };

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (settingsError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <IconAlertCircle className="size-5" />
            Error Loading Settings
          </CardTitle>
          <CardDescription>
            Failed to load inactivity settings. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetchSettings()}>
            <IconRefresh className="mr-2 size-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Global Inactivity Settings</CardTitle>
            <CardDescription>
              Configure when players are marked as inactive based on their last activity
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Summary */}
        {stats && !statsLoading && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <IconUsers className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Players</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <IconUserX className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.inactiveUsers}</p>
                <p className="text-xs text-muted-foreground">Inactive Players</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <IconBell className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.warningUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground">Warning Status</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Inactivity Threshold */}
            <FormField
              control={form.control}
              name="inactivityThresholdDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inactivity Threshold (Days)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        placeholder="14"
                        className="max-w-[120px]"
                        disabled={!isEditing}
                        value={field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? 0 : parseInt(val, 10));
                        }}
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Players without activity for this many days will be marked as inactive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning Threshold */}
            <FormField
              control={form.control}
              name="warningThresholdDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warning Threshold (Days)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={364}
                        placeholder="7"
                        className="max-w-[120px]"
                        disabled={!isEditing}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? null : parseInt(val, 10));
                        }}
                      />
                      <span className="text-sm text-muted-foreground">days (optional)</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Players approaching inactivity will receive a warning after this many days
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Behavior Toggles */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Behavior Options</h4>

              <FormField
                control={form.control}
                name="autoMarkInactive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-mark as Inactive</FormLabel>
                      <FormDescription>
                        Automatically update player status when threshold is reached
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excludeFromPairing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Exclude from Pairing</FormLabel>
                      <FormDescription>
                        Inactive players won&apos;t be paired for new matches
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendReminderEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Send Reminder Emails</FormLabel>
                      <FormDescription>
                        Email players when they&apos;re about to become inactive
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Reminder Days Before */}
            {form.watch("sendReminderEmail") && (
              <FormField
                control={form.control}
                name="reminderDaysBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Days Before</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          placeholder="3"
                          className="max-w-[120px]"
                          disabled={!isEditing}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? null : parseInt(val, 10));
                          }}
                        />
                        <span className="text-sm text-muted-foreground">days before threshold</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How many days before the inactivity threshold to send reminders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <IconInfoCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">Inactivity Check Schedule</p>
                <p className="mt-1 text-blue-700 dark:text-blue-400">
                  The system automatically checks for inactive players daily at 2:00 AM.
                  Changes to these settings will be applied during the next scheduled check.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {!isEditing && (
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerCheck}
                  disabled={triggerCheckMutation.isPending}
                >
                  {triggerCheckMutation.isPending ? (
                    <>
                      <IconRefresh className="mr-2 size-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <IconPlayerPlay className="mr-2 size-4" />
                      Run Check Now
                    </>
                  )}
                </Button>
                {settings?.id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToDefaults}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <IconRefresh className="mr-2 size-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <IconRotate className="mr-2 size-4" />
                        Reset to Defaults
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <IconRefresh className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconCheck className="mr-2 size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Form>

        {/* Last Updated */}
        {settings?.updatedAt && !isEditing && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(settings.updatedAt).toLocaleDateString()} at{" "}
              {new Date(settings.updatedAt).toLocaleTimeString()}
              {settings.updatedBy?.user?.name && (
                <> by {settings.updatedBy.user.name}</>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
