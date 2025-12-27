"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IconAlertCircle, IconRefresh, IconBell, IconCalendar, IconFileText, IconSend } from "@tabler/icons-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const appControlsSchema = z.object({
  maintenanceEnabled: z.boolean(),
  maintenanceMessage: z.string().optional(),
  maintenanceDate: z.string().optional(),
  termsOfService: z.string().min(10, "Terms must be at least 10 characters"),
  featureAnnouncement: z.string().optional(),
});

type AppControlsFormValues = z.infer<typeof appControlsSchema>;

export function AppControlsCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder for fetching/saving settings
  // Replace with real hooks/api as needed
  const [settings, setSettings] = useState<AppControlsFormValues | null>(null);

  const form = useForm<AppControlsFormValues>({
    resolver: zodResolver(appControlsSchema),
    defaultValues: {
      maintenanceEnabled: false,
      maintenanceMessage: "",
      maintenanceDate: "",
      termsOfService: "",
      featureAnnouncement: "",
    },
  });

  // Load settings (simulate fetch)
  // useEffect(() => { ... }, []);

  // Update form when settings are loaded
  // useEffect(() => { if (settings) { form.reset(settings); } }, [settings, form]);

  const onSubmit = async (data: AppControlsFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 800));
      setSettings(data);
      toast.success("App controls updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update app controls. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      form.reset(settings);
    }
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>App Controls</CardTitle>
            <CardDescription>
              Manage maintenance mode, Terms of Service, and feature announcements
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Controls
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Maintenance Mode Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-5 text-blue-600" />
                <h4 className="text-sm font-medium">Maintenance Mode</h4>
              </div>
              <FormField
                control={form.control}
                name="maintenanceEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Maintenance</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Schedule downtime for mobile app users
                      </div>
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
              {form.watch("maintenanceEnabled") && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maintenanceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date/Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maintenanceMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="We will be undergoing scheduled maintenance..."
                            {...field}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Terms of Service Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <IconFileText className="size-5 text-green-600" />
                <h4 className="text-sm font-medium">Terms of Service</h4>
              </div>
              <FormField
                control={form.control}
                name="termsOfService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms of Service</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Paste or write your updated Terms of Service here..."
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Feature Announcement Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <IconBell className="size-5 text-orange-600" />
                <h4 className="text-sm font-medium">Feature Announcement</h4>
              </div>
              <FormField
                control={form.control}
                name="featureAnnouncement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Announce a new feature to all users..."
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEditing && (
                <Button type="submit" variant="default" disabled={isLoading}>
                  <IconSend className="size-4 mr-2" />
                  {isLoading ? "Sending..." : "Send Announcement"}
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" variant="default" disabled={isLoading}>
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
