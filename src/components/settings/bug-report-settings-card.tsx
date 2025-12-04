"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  IconBrandGoogleDrive,
  IconExternalLink,
} from "@tabler/icons-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const bugReportSettingsSchema = z.object({
  syncEnabled: z.boolean(),
  googleSheetId: z.string().optional(),
  googleSheetName: z.string().optional(),
  enableScreenshots: z.boolean(),
  enableAutoCapture: z.boolean(),
  maxScreenshots: z.number().min(1).max(10),
});

type BugReportSettingsFormValues = z.infer<typeof bugReportSettingsSchema>;

interface BugReportSettings {
  id: string;
  appId: string;
  syncEnabled: boolean;
  googleSheetId: string | null;
  googleSheetName: string | null;
  enableScreenshots: boolean;
  enableAutoCapture: boolean;
  maxScreenshots: number;
  updatedAt: string;
}

export function BugReportSettingsCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<BugReportSettings | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BugReportSettingsFormValues>({
    resolver: zodResolver(bugReportSettingsSchema),
    defaultValues: {
      syncEnabled: false,
      googleSheetId: "",
      googleSheetName: "Bug Reports",
      enableScreenshots: true,
      enableAutoCapture: true,
      maxScreenshots: 5,
    },
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First get the DLA app ID
      const initRes = await fetch(`${API_URL}/api/bug/init/dla`, {
        credentials: "include",
      });
      if (!initRes.ok) throw new Error("Failed to initialize app");
      const initData = await initRes.json();
      setAppId(initData.appId);

      // Then fetch the settings
      const settingsRes = await fetch(`${API_URL}/api/bug/admin/apps/${initData.appId}/settings`, {
        credentials: "include",
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        form.reset({
          syncEnabled: settingsData.syncEnabled ?? false,
          googleSheetId: settingsData.googleSheetId ?? "",
          googleSheetName: settingsData.googleSheetName ?? "Bug Reports",
          enableScreenshots: settingsData.enableScreenshots ?? true,
          enableAutoCapture: settingsData.enableAutoCapture ?? true,
          maxScreenshots: settingsData.maxScreenshots ?? 5,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmit = async (data: BugReportSettingsFormValues) => {
    if (!appId) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/bug/admin/apps/${appId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Bug report settings updated successfully");
        setIsEditing(false);
        fetchSettings();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to update settings");
      }
    } catch {
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      form.reset({
        syncEnabled: settings.syncEnabled ?? false,
        googleSheetId: settings.googleSheetId ?? "",
        googleSheetName: settings.googleSheetName ?? "Bug Reports",
        enableScreenshots: settings.enableScreenshots ?? true,
        enableAutoCapture: settings.enableAutoCapture ?? true,
        maxScreenshots: settings.maxScreenshots ?? 5,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <IconAlertCircle className="size-5" />
            Error Loading Settings
          </CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={fetchSettings}>
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
            <CardTitle>Bug Report Settings</CardTitle>
            <CardDescription>
              Configure bug report widget and Google Sheets sync
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Google Sheets Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconBrandGoogleDrive className="size-5 text-green-600" />
                <h4 className="text-sm font-medium">Google Sheets Sync</h4>
              </div>

              <FormField
                control={form.control}
                name="syncEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Sync</FormLabel>
                      <FormDescription>
                        Automatically sync bug reports to Google Sheets
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

              {form.watch("syncEnabled") && (
                <>
                  <FormField
                    control={form.control}
                    name="googleSheetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Sheet ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1abc123xyz456..."
                            disabled={!isEditing}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The ID from your Google Sheet URL (between /d/ and /edit)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="googleSheetName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sheet Tab Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bug Reports"
                            disabled={!isEditing}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The name of the tab in your Google Sheet
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Info Box */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <IconInfoCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-300">
                      <p className="font-medium">Important Setup Step</p>
                      <p className="mt-1 text-amber-700 dark:text-amber-400">
                        Share your Google Sheet with:{" "}
                        <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">
                          deuceleague-bug-tracker@deuceleague.iam.gserviceaccount.com
                        </code>{" "}
                        and give it <strong>Editor</strong> access.
                      </p>
                    </div>
                  </div>

                  {settings?.googleSheetId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${settings.googleSheetId}/edit`, '_blank')}
                    >
                      <IconExternalLink className="mr-2 size-4" />
                      Open Google Sheet
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Widget Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Widget Settings</h4>

              <FormField
                control={form.control}
                name="enableScreenshots"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Screenshots</FormLabel>
                      <FormDescription>
                        Allow users to attach screenshots to bug reports
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
                name="enableAutoCapture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-capture Page Info</FormLabel>
                      <FormDescription>
                        Automatically capture browser and page information
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
                name="maxScreenshots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Screenshots per Report</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          className="max-w-[120px]"
                          disabled={!isEditing}
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? 1 : parseInt(val, 10));
                          }}
                        />
                        <span className="text-sm text-muted-foreground">screenshots</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
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
                  disabled={isSaving}
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
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
