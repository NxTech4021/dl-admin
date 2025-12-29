"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconRefresh, IconBell, IconCalendar, IconFileText, IconSend } from "@tabler/icons-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/api-error";

// Schemas for each separate form
const maintenanceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDateTime: z.string().min(1, "Start date/time is required"),
  durationHours: z.number().min(0.5, "Duration must be at least 30 minutes").max(24, "Duration cannot exceed 24 hours"),
  affectedServices: z.array(z.string()).optional(),
});

const tosSchema = z.object({
  content: z.string().min(10, "Terms must be at least 10 characters"),
});

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  featureDetails: z.record(z.any()).optional(),
  releaseDate: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
type TOSFormValues = z.infer<typeof tosSchema>;
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export function AppControlsCard() {
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);
  const [isEditingTOS, setIsEditingTOS] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for existing data
  const [currentMaintenance, setCurrentMaintenance] = useState<any>(null);
  const [currentTOS, setCurrentTOS] = useState<string>("");
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null);
  const [draftAnnouncements, setDraftAnnouncements] = useState<any[]>([]);
  const [publishedAnnouncements, setPublishedAnnouncements] = useState<any[]>([]);

  // Separate forms for each functionality
  const maintenanceForm = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: "",
      description: "",
      startDateTime: "",
      durationHours: 1,
      affectedServices: [],
    },
  });

  // const tosForm = useForm<TOSFormValues>({
  //   resolver: zodResolver(tosSchema),
  //   defaultValues: {
  //     content: "",
  //   },
  // });

  const announcementForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      description: "",
      featureDetails: {},
      releaseDate: "",
      targetAudience: ["ALL"],
    },
  });

  // Load existing data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming maintenance
        const maintResponse = await axiosInstance.get(endpoints.admin.systemControls.maintenance.getUpcoming);
        const maintenance = maintResponse.data?.[0];
        if (maintenance) {
          setCurrentMaintenance(maintenance);
          // Calculate duration from start and end times
          const durationMs = new Date(maintenance.endDateTime).getTime() - new Date(maintenance.startDateTime).getTime();
          const durationHours = durationMs / (1000 * 60 * 60);
          
          maintenanceForm.reset({
            title: maintenance.title || "",
            description: maintenance.description || "",
            startDateTime: maintenance.startDateTime ? new Date(maintenance.startDateTime).toISOString().slice(0, 16) : "",
            durationHours: durationHours > 0 ? durationHours : 1,
            affectedServices: maintenance.affectedServices || [],
          });
        }

        // Fetch published announcements (backend doesn't have getAll endpoint yet)
        const publishedResponse = await axiosInstance.get(endpoints.admin.systemControls.announcements.getPublished);
        const published = publishedResponse.data || [];
        
        setDraftAnnouncements([]);
        setPublishedAnnouncements(published);
        
        // Set current announcement to latest published
        const currentAnnouncement = published[0];
        if (currentAnnouncement) {
          setCurrentAnnouncement(currentAnnouncement);
          announcementForm.reset({
            title: currentAnnouncement.title || "",
            description: currentAnnouncement.description || "",
            featureDetails: currentAnnouncement.featureDetails || {},
            releaseDate: currentAnnouncement.releaseDate ? new Date(currentAnnouncement.releaseDate).toISOString().slice(0, 16) : "",
            targetAudience: currentAnnouncement.targetAudience || ["ALL"],
          });
        }

        // TODO: Fetch TOS when backend endpoint is ready
        // try {
        //   const tosResponse = await axiosInstance.get(endpoints.admin.systemControls.termsOfService.get);
        //   setCurrentTOS(tosResponse.data.content || "");
        //   tosForm.reset({ content: tosResponse.data.content || "" });
        // } catch (tosError) {
        //   console.log("TOS endpoint not implemented yet");
        // }

      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load app controls: " + getErrorMessage(error));
      }
    };

    fetchData();
  }, [maintenanceForm, announcementForm]);

  // Maintenance form handlers
  const onSaveMaintenance = async (data: MaintenanceFormValues) => {
    setIsLoading(true);
    try {
      const startDate = new Date(data.startDateTime);
      const endDate = new Date(startDate.getTime() + (data.durationHours * 60 * 60 * 1000));
      
      const payload = {
        title: data.title,
        description: data.description,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        affectedServices: data.affectedServices || [],
      };

      if (currentMaintenance?.id) {
        // Update existing maintenance
        await axiosInstance.put(endpoints.admin.systemControls.maintenance.update(currentMaintenance.id), payload);
        toast.success("Maintenance updated successfully");
      } else {
        // Create new maintenance
        const response = await axiosInstance.post(endpoints.admin.systemControls.maintenance.create, payload);
        setCurrentMaintenance(response.data);
        toast.success("Maintenance scheduled successfully");
      }
      
      setIsEditingMaintenance(false);
    } catch (error) {
      toast.error("Failed to save maintenance: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMaintenance = async () => {
    if (!currentMaintenance?.id) return;
    
    setIsLoading(true);
    try {
      await axiosInstance.post(endpoints.admin.systemControls.maintenance.complete(currentMaintenance.id));
      toast.success("Maintenance marked as completed");
      setCurrentMaintenance(null);
      maintenanceForm.reset();
      setIsEditingMaintenance(false);
    } catch (error) {
      toast.error("Failed to complete maintenance: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelMaintenance = () => {
    if (currentMaintenance) {
      // Calculate duration from start and end times
      const durationMs = new Date(currentMaintenance.endDateTime).getTime() - new Date(currentMaintenance.startDateTime).getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      maintenanceForm.reset({
        title: currentMaintenance.title || "",
        description: currentMaintenance.description || "",
        startDateTime: currentMaintenance.startDateTime ? new Date(currentMaintenance.startDateTime).toISOString().slice(0, 16) : "",
        durationHours: durationHours > 0 ? durationHours : 1,
        affectedServices: currentMaintenance.affectedServices || [],
      });
    }
    setIsEditingMaintenance(false);
  };

  // TOS form handlers
  // const onSaveTOS = async (data: TOSFormValues) => {
  //   setIsLoading(true);
  //   try {
  //     await axiosInstance.put(endpoints.admin.systemControls.termsOfService.update, { content: data.content });
      
  //     setCurrentTOS(data.content);
  //     toast.success("Terms of Service updated successfully");
  //     setIsEditingTOS(false);
  //   } catch (error) {
  //     toast.error("Failed to update Terms of Service: " + getErrorMessage(error));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleCancelTOS = () => {
  //   tosForm.reset({ content: currentTOS });
  //   setIsEditingTOS(false);
  // };

  // Announcement form handlers
  const onSaveAnnouncement = async (data: AnnouncementFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        featureDetails: data.featureDetails || {},
        releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString() : undefined,
        targetAudience: data.targetAudience || ["ALL"],
      };

      if (currentAnnouncement?.id) {
        // Update existing announcement
        const response = await axiosInstance.put(endpoints.admin.systemControls.announcements.update(currentAnnouncement.id), payload);
        
        // Update in the appropriate list
        if (response.data.status === 'DRAFT') {
          setDraftAnnouncements(prev => prev.map(a => a.id === response.data.id ? response.data : a));
        } else if (response.data.status === 'PUBLISHED') {
          setPublishedAnnouncements(prev => prev.map(a => a.id === response.data.id ? response.data : a));
        }
        
        toast.success("Announcement updated successfully");
      } else {
        // Create new announcement (will be in DRAFT status)
        const response = await axiosInstance.post(endpoints.admin.systemControls.announcements.create, payload);
        setDraftAnnouncements(prev => [response.data, ...prev]);
        toast.success("Announcement created successfully");
      }
      
      setIsEditingAnnouncement(false);
      setCurrentAnnouncement(null);
    } catch (error) {
      toast.error("Failed to save announcement: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAnnouncement = async () => {
    if (!currentAnnouncement?.id) return;
    
    setIsLoading(true);
    try {
      await axiosInstance.post(endpoints.admin.systemControls.announcements.publish(currentAnnouncement.id));
      toast.success("Announcement published successfully");
      
      // Refresh published announcements
      const response = await axiosInstance.get(endpoints.admin.systemControls.announcements.getPublished);
      const publishedList = response.data || [];
      setPublishedAnnouncements(publishedList);
      setDraftAnnouncements([]);
      
      // Update current announcement with published status
      const publishedAnnouncement = publishedList.find((a: any) => a.id === currentAnnouncement.id);
      if (publishedAnnouncement) {
        setCurrentAnnouncement(publishedAnnouncement);
      }
      
      setIsEditingAnnouncement(false);
    } catch (error) {
      toast.error("Failed to publish announcement: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveAnnouncement = async () => {
    if (!currentAnnouncement?.id) return;
    
    setIsLoading(true);
    try {
      await axiosInstance.post(endpoints.admin.systemControls.announcements.archive(currentAnnouncement.id));
      toast.success("Announcement archived successfully");
      
      // Refresh published announcements
      const response = await axiosInstance.get(endpoints.admin.systemControls.announcements.getPublished);
      setPublishedAnnouncements(response.data || []);
      
      setCurrentAnnouncement(null);
      announcementForm.reset();
      setIsEditingAnnouncement(false);
    } catch (error) {
      toast.error("Failed to archive announcement: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAnnouncement = () => {
    if (currentAnnouncement) {
      announcementForm.reset({
        title: currentAnnouncement.title || "",
        description: currentAnnouncement.description || "",
        featureDetails: currentAnnouncement.featureDetails || {},
        releaseDate: currentAnnouncement.releaseDate ? new Date(currentAnnouncement.releaseDate).toISOString().slice(0, 16) : "",
        targetAudience: currentAnnouncement.targetAudience || ["ALL"],
      });
    }
    setIsEditingAnnouncement(false);
  };

  const handleCreateNewAnnouncement = () => {
    setCurrentAnnouncement(null);
    announcementForm.reset({
      title: "",
      description: "",
      featureDetails: {},
      releaseDate: "",
      targetAudience: ["ALL"],
    });
    setIsEditingAnnouncement(true);
  };

  const handleEditAnnouncement = (announcement: any) => {
    setCurrentAnnouncement(announcement);
    announcementForm.reset({
      title: announcement.title || "",
      description: announcement.description || "",
      featureDetails: announcement.featureDetails || {},
      releaseDate: announcement.releaseDate ? new Date(announcement.releaseDate).toISOString().slice(0, 16) : "",
      targetAudience: announcement.targetAudience || ["ALL"],
    });
    setIsEditingAnnouncement(true);
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
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Maintenance Mode Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCalendar className="size-5 text-blue-600" />
              <h4 className="text-sm font-medium">Maintenance Mode</h4>
            </div>
            {!isEditingMaintenance && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingMaintenance(true)}>
                {currentMaintenance ? "Edit Maintenance" : "Schedule Maintenance"}
              </Button>
            )}
          </div>

          {isEditingMaintenance ? (
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(onSaveMaintenance)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={maintenanceForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Scheduled System Maintenance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={maintenanceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of maintenance work" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={maintenanceForm.control}
                    name="startDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date/Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={maintenanceForm.control}
                    name="durationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Hours)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5" 
                            min="0.5" 
                            max="24" 
                            placeholder="e.g., 2" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {currentMaintenance ? "Update Maintenance" : "Schedule Maintenance"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelMaintenance} disabled={isLoading}>
                    Cancel
                  </Button>
                  {currentMaintenance && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleCompleteMaintenance}
                      disabled={isLoading}
                    >
                      <IconRefresh className="size-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          ) : (
            <div className="rounded-lg border p-3">
              {currentMaintenance ? (
                <div className="space-y-2">
                  <p className="font-medium">{currentMaintenance.title}</p>
                  <p className="text-sm text-muted-foreground">{currentMaintenance.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(currentMaintenance.startDateTime).toLocaleString()} - {new Date(currentMaintenance.endDateTime).toLocaleString()}
                    {(() => {
                      const durationMs = new Date(currentMaintenance.endDateTime).getTime() - new Date(currentMaintenance.startDateTime).getTime();
                      const hours = Math.floor(durationMs / (1000 * 60 * 60));
                      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                      return ` (${hours}h ${minutes}m)`;
                    })()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No maintenance scheduled</p>
              )}
            </div>
          )}
        </div>

        {/* Terms of Service Section */}
        {/* <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconFileText className="size-5 text-green-600" />
              <h4 className="text-sm font-medium">Terms of Service</h4>
            </div>
            {!isEditingTOS && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingTOS(true)}>
                Update Terms
              </Button>
            )}
          </div>

          {isEditingTOS ? (
            <Form {...tosForm}>
              <form onSubmit={tosForm.handleSubmit(onSaveTOS)} className="space-y-4">
                <FormField
                  control={tosForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms of Service Content</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={8}
                          placeholder="Paste or write your updated Terms of Service here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>
                    Save Terms
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelTOS} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">
                {currentTOS || "No Terms of Service set"}
              </p>
            </div>
          )}
        </div> */}

        {/* Feature Announcement Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBell className="size-5 text-orange-600" />
              <h4 className="text-sm font-medium">Feature Announcements</h4>
            </div>
            {!isEditingAnnouncement && (
              <Button variant="outline" size="sm" onClick={handleCreateNewAnnouncement}>
                Create New Announcement
              </Button>
            )}
          </div>

          {isEditingAnnouncement ? (
            <Form {...announcementForm}>
              <form onSubmit={announcementForm.handleSubmit(onSaveAnnouncement)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={announcementForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Announcement Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New Feature Available!" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={announcementForm.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={announcementForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe the new feature or announcement..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {currentAnnouncement ? "Update Announcement" : "Create Announcement"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelAnnouncement} disabled={isLoading}>
                    Cancel
                  </Button>
                  {currentAnnouncement && currentAnnouncement.status === 'DRAFT' && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={handlePublishAnnouncement}
                      disabled={isLoading}
                    >
                      <IconSend className="size-4 mr-2" />
                      Publish Announcement
                    </Button>
                  )}
                  {currentAnnouncement && currentAnnouncement.status === 'PUBLISHED' && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleArchiveAnnouncement}
                      disabled={isLoading}
                    >
                      Archive Announcement
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              {/* Drafts Section */}
              {draftAnnouncements.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase">Drafts ({draftAnnouncements.length})</h5>
                  <div className="grid gap-3">
                    {draftAnnouncements.map((announcement: any) => (
                      <div key={announcement.id} className="rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{announcement.title}</p>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                                DRAFT
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{announcement.description}</p>
                            {announcement.releaseDate && (
                              <p className="text-xs text-muted-foreground">
                                Release: {new Date(announcement.releaseDate).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="shrink-0"
                          >
                            <IconFileText className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Published Section */}
              {publishedAnnouncements.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase">Published ({publishedAnnouncements.length})</h5>
                  <div className="grid gap-3">
                    {publishedAnnouncements.map((announcement: any) => (
                      <div key={announcement.id} className="rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{announcement.title}</p>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                PUBLISHED
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{announcement.description}</p>
                            {announcement.announcementDate && (
                              <p className="text-xs text-muted-foreground">
                                Published: {new Date(announcement.announcementDate).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="shrink-0"
                          >
                            <IconFileText className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {draftAnnouncements.length === 0 && publishedAnnouncements.length === 0 && (
                <div className="rounded-lg border p-6 text-center">
                  <IconBell className="size-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first announcement to notify users about new features</p>
                </div>
              )}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}