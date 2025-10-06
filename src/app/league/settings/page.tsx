"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
 
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconSettings,
  IconAlertCircle,
  IconDeviceFloppy,
  IconEye,
  IconRefresh,
  IconCopy,
  IconTrash,
  IconPlus,
  IconTrophy,
  IconCreditCard,
  IconUsers,
  IconCalendar,
  IconPalette,
  IconHistory,
  IconCheck,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";

// Types for configuration
interface LeagueSettings {
  general: {
    defaultDuration: number;
    durationUnit: "weeks" | "months";
    minPlayersPerDivision: number;
    maxPlayersPerDivision: number;
    registrationDeadlineDays: number;
    autoCreateDivisions: boolean;
    allowManualDivisionAssignment: boolean;
  };
  payment: {
    enablePaymentProcessing: boolean;
    defaultLeagueFee: number;
    currency: string;
    refundPolicy: "full" | "partial" | "none";
    refundDeadlineDays: number;
    acceptedPaymentMethods: string[];
    processingFeePercentage: number;
  };
  divisions: {
    ratingRanges: Array<{ min: number; max: number; name: string }>;
    allowCrossRatingPlay: boolean;
    maxRatingDifference: number;
    autoBalance: boolean;
  };
  playoffs: {
    enablePlayoffs: boolean;
    playoffFormat: "single-elimination" | "double-elimination" | "round-robin";
    qualificationPercentage: number;
    finalsFormat: "best-of-1" | "best-of-3" | "best-of-5";
  };
  workflow: {
    statusTransitions: Record<string, string[]>;
    requireApprovalForStatusChange: boolean;
    notifyAdminsOnStatusChange: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    customCss: string;
  };
  integrations: {
    enableExternalApi: boolean;
    webhookUrl: string;
    apiKeys: Record<string, string>;
  };
  audit: {
    enableAuditTrail: boolean;
    retentionDays: number;
    logUserActions: boolean;
  };
}

const defaultSettings: LeagueSettings = {
  general: {
    defaultDuration: 8,
    durationUnit: "weeks",
    minPlayersPerDivision: 4,
    maxPlayersPerDivision: 16,
    registrationDeadlineDays: 7,
    autoCreateDivisions: true,
    allowManualDivisionAssignment: true,
  },
  payment: {
    enablePaymentProcessing: true,
    defaultLeagueFee: 50,
    currency: "USD",
    refundPolicy: "partial",
    refundDeadlineDays: 3,
    acceptedPaymentMethods: ["credit_card", "paypal", "bank_transfer"],
    processingFeePercentage: 2.9,
  },
  divisions: {
    ratingRanges: [
      { min: 0, max: 2.5, name: "Beginner" },
      { min: 2.5, max: 3.5, name: "Intermediate" },
      { min: 3.5, max: 4.5, name: "Advanced" },
      { min: 4.5, max: 7.0, name: "Expert" },
    ],
    allowCrossRatingPlay: false,
    maxRatingDifference: 1.0,
    autoBalance: true,
  },
  playoffs: {
    enablePlayoffs: true,
    playoffFormat: "single-elimination",
    qualificationPercentage: 50,
    finalsFormat: "best-of-3",
  },
  workflow: {
    statusTransitions: {
      draft: ["registration", "cancelled"],
      registration: ["active", "cancelled"],
      active: ["completed", "suspended"],
      completed: ["archived"],
      suspended: ["active", "cancelled"],
      cancelled: ["draft"],
    },
    requireApprovalForStatusChange: true,
    notifyAdminsOnStatusChange: true,
  },
  branding: {
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    logoUrl: "",
    customCss: "",
  },
  integrations: {
    enableExternalApi: false,
    webhookUrl: "",
    apiKeys: {},
  },
  audit: {
    enableAuditTrail: true,
    retentionDays: 365,
    logUserActions: true,
  },
};

export default function LeagueSettingsPage() {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId');
  
  const [settings, setSettings] = useState<LeagueSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewChanges, setPreviewChanges] = useState<Partial<LeagueSettings>>({});

  // Load league-specific settings if leagueId is provided
  useEffect(() => {
    if (leagueId) {
      // TODO: Load settings for specific league
      console.log("Loading settings for league:", leagueId);
      // For now, use default settings
    }
  }, [leagueId]);

  const updateSettings = (section: keyof LeagueSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
    toast.info("Settings reset to default values");
  };

  const handlePreview = () => {
    setPreviewChanges(settings);
    setShowPreview(true);
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave without saving?"
      );
      if (!confirmLeave) return;
    }
    
    if (leagueId) {
      // If we came from a specific league, go back to that league's view
      window.history.back();
    } else {
      // Otherwise go to the main league page
      window.location.href = "/league";
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                      >
                        <IconArrowLeft className="size-4 mr-2" />
                        Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <IconSettings className="size-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">League Settings</h1>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">
                            {leagueId 
                              ? `Configure settings for League ${leagueId}`
                              : "Configure default league behavior, rules, and platform settings"
                            }
                          </p>
                          {leagueId && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">League ID: {leagueId}</Badge>
                            </div>
                          )}
                        </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreview}
                        >
                          <IconEye className="mr-2 size-4" />
                          Preview Changes
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <IconRefresh className="mr-2 size-4" />
                              Reset to Default
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset Settings</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will reset all settings to their default values. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleReset}>
                                Reset Settings
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          onClick={handleSave}
                          disabled={!hasChanges || isLoading}
                          className="min-w-[120px]"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Saving...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <IconDeviceFloppy className="size-4" />
                              Save Changes
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {hasChanges && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <IconAlertCircle className="size-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          You have unsaved changes. Don't forget to save your settings.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 px-4 lg:px-6 pb-6">
                <Tabs defaultValue="general" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="divisions">Divisions</TabsTrigger>
                    <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  {/* General Settings */}
                  <TabsContent value="general" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconTrophy className="size-5" />
                          League Duration Settings
                        </CardTitle>
                        <CardDescription>
                          Configure default league duration and timing settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="defaultDuration">Default League Duration</Label>
                            <div className="flex gap-2">
                              <Input
                                id="defaultDuration"
                                type="number"
                                min="1"
                                max="52"
                                value={settings.general.defaultDuration}
                                onChange={(e) => updateSettings("general", {
                                  defaultDuration: parseInt(e.target.value) || 1
                                })}
                                className="flex-1"
                              />
                              <Select
                                value={settings.general.durationUnit}
                                onValueChange={(value) => updateSettings("general", {
                                  durationUnit: value as "weeks" | "months"
                                })}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="weeks">Weeks</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="registrationDeadline"
                                type="number"
                                min="0"
                                max="30"
                                value={settings.general.registrationDeadlineDays}
                                onChange={(e) => updateSettings("general", {
                                  registrationDeadlineDays: parseInt(e.target.value) || 0
                                })}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground">days before start</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-medium mb-4">Players per Division</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="minPlayers">Minimum Players</Label>
                              <Input
                                id="minPlayers"
                                type="number"
                                min="2"
                                max="100"
                                value={settings.general.minPlayersPerDivision}
                                onChange={(e) => updateSettings("general", {
                                  minPlayersPerDivision: parseInt(e.target.value) || 2
                                })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="maxPlayers">Maximum Players</Label>
                              <Input
                                id="maxPlayers"
                                type="number"
                                min="2"
                                max="100"
                                value={settings.general.maxPlayersPerDivision}
                                onChange={(e) => updateSettings("general", {
                                  maxPlayersPerDivision: parseInt(e.target.value) || 2
                                })}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Division Management</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="autoCreate">Auto-create divisions</Label>
                                <p className="text-sm text-muted-foreground">
                                  Automatically create divisions based on registration numbers
                                </p>
                              </div>
                              <Switch
                                id="autoCreate"
                                checked={settings.general.autoCreateDivisions}
                                onCheckedChange={(checked) => updateSettings("general", {
                                  autoCreateDivisions: checked
                                })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="manualAssignment">Allow manual division assignment</Label>
                                <p className="text-sm text-muted-foreground">
                                  Admins can manually assign players to specific divisions
                                </p>
                              </div>
                              <Switch
                                id="manualAssignment"
                                checked={settings.general.allowManualDivisionAssignment}
                                onCheckedChange={(checked) => updateSettings("general", {
                                  allowManualDivisionAssignment: checked
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Payment Settings */}
                  <TabsContent value="payment" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconCreditCard className="size-5" />
                          Payment Processing Settings
                        </CardTitle>
                        <CardDescription>
                          Configure payment methods, fees, and refund policies
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enablePayments">Enable Payment Processing</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow players to pay league fees through the platform
                            </p>
                          </div>
                          <Switch
                            id="enablePayments"
                            checked={settings.payment.enablePaymentProcessing}
                            onCheckedChange={(checked) => updateSettings("payment", {
                              enablePaymentProcessing: checked
                            })}
                          />
                        </div>

                        {settings.payment.enablePaymentProcessing && (
                          <>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="defaultFee">Default League Fee</Label>
                                <div className="flex gap-2">
                                  <Select
                                    value={settings.payment.currency}
                                    onValueChange={(value) => updateSettings("payment", {
                                      currency: value
                                    })}
                                  >
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                      <SelectItem value="GBP">GBP</SelectItem>
                                      <SelectItem value="CAD">CAD</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    id="defaultFee"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settings.payment.defaultLeagueFee}
                                    onChange={(e) => updateSettings("payment", {
                                      defaultLeagueFee: parseFloat(e.target.value) || 0
                                    })}
                                    className="flex-1"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="processingFee">Processing Fee (%)</Label>
                                <Input
                                  id="processingFee"
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={settings.payment.processingFeePercentage}
                                  onChange={(e) => updateSettings("payment", {
                                    processingFeePercentage: parseFloat(e.target.value) || 0
                                  })}
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <Label>Accepted Payment Methods</Label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                  { id: "credit_card", label: "Credit/Debit Cards" },
                                  { id: "paypal", label: "PayPal" },
                                  { id: "bank_transfer", label: "Bank Transfer" },
                                  { id: "apple_pay", label: "Apple Pay" },
                                  { id: "google_pay", label: "Google Pay" },
                                  { id: "venmo", label: "Venmo" },
                                ].map((method) => (
                                  <div key={method.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={method.id}
                                      checked={settings.payment.acceptedPaymentMethods.includes(method.id)}
                                      onCheckedChange={(checked) => {
                                        const methods = checked
                                          ? [...settings.payment.acceptedPaymentMethods, method.id]
                                          : settings.payment.acceptedPaymentMethods.filter(m => m !== method.id);
                                        updateSettings("payment", { acceptedPaymentMethods: methods });
                                      }}
                                    />
                                    <Label htmlFor={method.id}>{method.label}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Refund Policy</h4>
                              <RadioGroup
                                value={settings.payment.refundPolicy}
                                onValueChange={(value) => updateSettings("payment", {
                                  refundPolicy: value as "full" | "partial" | "none"
                                })}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="full" id="refund-full" />
                                  <Label htmlFor="refund-full">
                                    <div>
                                      <div className="font-medium">Full Refund</div>
                                      <div className="text-sm text-muted-foreground">
                                        Players receive 100% refund before deadline
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="partial" id="refund-partial" />
                                  <Label htmlFor="refund-partial">
                                    <div>
                                      <div className="font-medium">Partial Refund</div>
                                      <div className="text-sm text-muted-foreground">
                                        Players receive partial refund minus processing fees
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="none" id="refund-none" />
                                  <Label htmlFor="refund-none">
                                    <div>
                                      <div className="font-medium">No Refunds</div>
                                      <div className="text-sm text-muted-foreground">
                                        All sales are final
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              </RadioGroup>

                              {settings.payment.refundPolicy !== "none" && (
                                <div className="space-y-2">
                                  <Label htmlFor="refundDeadline">Refund Deadline</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="refundDeadline"
                                      type="number"
                                      min="0"
                                      max="30"
                                      value={settings.payment.refundDeadlineDays}
                                      onChange={(e) => updateSettings("payment", {
                                        refundDeadlineDays: parseInt(e.target.value) || 0
                                      })}
                                      className="w-24"
                                    />
                                    <span className="text-sm text-muted-foreground">days before league start</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Division Settings */}
                  <TabsContent value="divisions" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconUsers className="size-5" />
                          Division Configuration
                        </CardTitle>
                        <CardDescription>
                          Set up rating ranges and division creation rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Rating Ranges</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newRange = { min: 0, max: 1, name: "New Division" };
                                updateSettings("divisions", {
                                  ratingRanges: [...settings.divisions.ratingRanges, newRange]
                                });
                              }}
                            >
                              <IconPlus className="size-4 mr-2" />
                              Add Range
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {settings.divisions.ratingRanges.map((range, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <Input
                                  placeholder="Division name"
                                  value={range.name}
                                  onChange={(e) => {
                                    const newRanges = [...settings.divisions.ratingRanges];
                                    newRanges[index] = { ...range, name: e.target.value };
                                    updateSettings("divisions", { ratingRanges: newRanges });
                                  }}
                                  className="flex-1"
                                />
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="7"
                                    value={range.min}
                                    onChange={(e) => {
                                      const newRanges = [...settings.divisions.ratingRanges];
                                      newRanges[index] = { ...range, min: parseFloat(e.target.value) || 0 };
                                      updateSettings("divisions", { ratingRanges: newRanges });
                                    }}
                                    className="w-20"
                                  />
                                  <span className="text-muted-foreground">to</span>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="7"
                                    value={range.max}
                                    onChange={(e) => {
                                      const newRanges = [...settings.divisions.ratingRanges];
                                      newRanges[index] = { ...range, max: parseFloat(e.target.value) || 0 };
                                      updateSettings("divisions", { ratingRanges: newRanges });
                                    }}
                                    className="w-20"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newRanges = settings.divisions.ratingRanges.filter((_, i) => i !== index);
                                    updateSettings("divisions", { ratingRanges: newRanges });
                                  }}
                                >
                                  <IconTrash className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Cross-Rating Play</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="crossRating">Allow cross-rating play</Label>
                                <p className="text-sm text-muted-foreground">
                                  Players can play against others outside their rating range
                                </p>
                              </div>
                              <Switch
                                id="crossRating"
                                checked={settings.divisions.allowCrossRatingPlay}
                                onCheckedChange={(checked) => updateSettings("divisions", {
                                  allowCrossRatingPlay: checked
                                })}
                              />
                            </div>

                            {settings.divisions.allowCrossRatingPlay && (
                              <div className="space-y-2">
                                <Label htmlFor="maxRatingDiff">Maximum rating difference</Label>
                                <div className="flex items-center gap-4">
                                  <Slider
                                    id="maxRatingDiff"
                                    min={0.5}
                                    max={3.0}
                                    step={0.1}
                                    value={[settings.divisions.maxRatingDifference]}
                                    onValueChange={([value]) => updateSettings("divisions", {
                                      maxRatingDifference: value
                                    })}
                                    className="flex-1"
                                  />
                                  <span className="text-sm font-medium w-12">
                                    {settings.divisions.maxRatingDifference.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoBalance">Auto-balance divisions</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically balance division sizes and skill levels
                            </p>
                          </div>
                          <Switch
                            id="autoBalance"
                            checked={settings.divisions.autoBalance}
                            onCheckedChange={(checked) => updateSettings("divisions", {
                              autoBalance: checked
                            })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Playoff Settings */}
                  <TabsContent value="playoffs" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconTrophy className="size-5" />
                          Playoff Configuration
                        </CardTitle>
                        <CardDescription>
                          Configure playoff formats and qualification rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enablePlayoffs">Enable Playoffs</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow leagues to have playoff tournaments
                            </p>
                          </div>
                          <Switch
                            id="enablePlayoffs"
                            checked={settings.playoffs.enablePlayoffs}
                            onCheckedChange={(checked) => updateSettings("playoffs", {
                              enablePlayoffs: checked
                            })}
                          />
                        </div>

                        {settings.playoffs.enablePlayoffs && (
                          <>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="playoffFormat">Playoff Format</Label>
                                <Select
                                  value={settings.playoffs.playoffFormat}
                                  onValueChange={(value) => updateSettings("playoffs", {
                                    playoffFormat: value as any
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single-elimination">Single Elimination</SelectItem>
                                    <SelectItem value="double-elimination">Double Elimination</SelectItem>
                                    <SelectItem value="round-robin">Round Robin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="finalsFormat">Finals Format</Label>
                                <Select
                                  value={settings.playoffs.finalsFormat}
                                  onValueChange={(value) => updateSettings("playoffs", {
                                    finalsFormat: value as any
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="best-of-1">Best of 1</SelectItem>
                                    <SelectItem value="best-of-3">Best of 3</SelectItem>
                                    <SelectItem value="best-of-5">Best of 5</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="qualification">Qualification Percentage</Label>
                              <div className="flex items-center gap-4">
                                <Slider
                                  id="qualification"
                                  min={25}
                                  max={100}
                                  step={5}
                                  value={[settings.playoffs.qualificationPercentage]}
                                  onValueChange={([value]) => updateSettings("playoffs", {
                                    qualificationPercentage: value
                                  })}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium w-12">
                                  {settings.playoffs.qualificationPercentage}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Percentage of players who qualify for playoffs
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Workflow Settings */}
                  <TabsContent value="workflow" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconCalendar className="size-5" />
                          League Status Workflow
                        </CardTitle>
                        <CardDescription>
                          Configure league status transitions and approval rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Status Transitions</h4>
                          <div className="space-y-3">
                            {Object.entries(settings.workflow.statusTransitions).map(([status, transitions]) => (
                              <div key={status} className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="capitalize">
                                    {status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">can transition to:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {transitions.map((transition) => (
                                    <Badge key={transition} variant="secondary" className="capitalize">
                                      {transition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="requireApproval">Require approval for status changes</Label>
                              <p className="text-sm text-muted-foreground">
                                Admin approval required for critical status transitions
                              </p>
                            </div>
                            <Switch
                              id="requireApproval"
                              checked={settings.workflow.requireApprovalForStatusChange}
                              onCheckedChange={(checked) => updateSettings("workflow", {
                                requireApprovalForStatusChange: checked
                              })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notifyAdmins">Notify admins on status changes</Label>
                              <p className="text-sm text-muted-foreground">
                                Send notifications when league status changes
                              </p>
                            </div>
                            <Switch
                              id="notifyAdmins"
                              checked={settings.workflow.notifyAdminsOnStatusChange}
                              onCheckedChange={(checked) => updateSettings("workflow", {
                                notifyAdminsOnStatusChange: checked
                              })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Branding Settings */}
                  <TabsContent value="branding" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconPalette className="size-5" />
                          League Branding Options
                        </CardTitle>
                        <CardDescription>
                          Customize the visual appearance of leagues
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="primaryColor"
                                type="color"
                                value={settings.branding.primaryColor}
                                onChange={(e) => updateSettings("branding", {
                                  primaryColor: e.target.value
                                })}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={settings.branding.primaryColor}
                                onChange={(e) => updateSettings("branding", {
                                  primaryColor: e.target.value
                                })}
                                className="flex-1"
                                placeholder="#3b82f6"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Secondary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="secondaryColor"
                                type="color"
                                value={settings.branding.secondaryColor}
                                onChange={(e) => updateSettings("branding", {
                                  secondaryColor: e.target.value
                                })}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={settings.branding.secondaryColor}
                                onChange={(e) => updateSettings("branding", {
                                  secondaryColor: e.target.value
                                })}
                                className="flex-1"
                                placeholder="#64748b"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="logoUrl">Logo URL</Label>
                          <Input
                            id="logoUrl"
                            type="url"
                            value={settings.branding.logoUrl}
                            onChange={(e) => updateSettings("branding", {
                              logoUrl: e.target.value
                            })}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customCss">Custom CSS</Label>
                          <Textarea
                            id="customCss"
                            value={settings.branding.customCss}
                            onChange={(e) => updateSettings("branding", {
                              customCss: e.target.value
                            })}
                            placeholder="/* Custom CSS rules */"
                            rows={6}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Advanced: Add custom CSS to override default styles
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Advanced Settings */}
                  <TabsContent value="advanced" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconHistory className="size-5" />
                          Advanced Settings
                        </CardTitle>
                        <CardDescription>
                          Integration settings, audit trails, and advanced options
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Audit Trail</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="enableAudit">Enable audit trail</Label>
                                <p className="text-sm text-muted-foreground">
                                  Track all configuration changes and user actions
                                </p>
                              </div>
                              <Switch
                                id="enableAudit"
                                checked={settings.audit.enableAuditTrail}
                                onCheckedChange={(checked) => updateSettings("audit", {
                                  enableAuditTrail: checked
                                })}
                              />
                            </div>

                            {settings.audit.enableAuditTrail && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="retentionDays">Log retention (days)</Label>
                                  <Input
                                    id="retentionDays"
                                    type="number"
                                    min="30"
                                    max="2555"
                                    value={settings.audit.retentionDays}
                                    onChange={(e) => updateSettings("audit", {
                                      retentionDays: parseInt(e.target.value) || 365
                                    })}
                                    className="w-32"
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label htmlFor="logUserActions">Log user actions</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Include detailed user activity in audit logs
                                    </p>
                                  </div>
                                  <Switch
                                    id="logUserActions"
                                    checked={settings.audit.logUserActions}
                                    onCheckedChange={(checked) => updateSettings("audit", {
                                      logUserActions: checked
                                    })}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">External Integrations</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="enableApi">Enable external API</Label>
                                <p className="text-sm text-muted-foreground">
                                  Allow third-party systems to integrate with leagues
                                </p>
                              </div>
                              <Switch
                                id="enableApi"
                                checked={settings.integrations.enableExternalApi}
                                onCheckedChange={(checked) => updateSettings("integrations", {
                                  enableExternalApi: checked
                                })}
                              />
                            </div>

                            {settings.integrations.enableExternalApi && (
                              <div className="space-y-2">
                                <Label htmlFor="webhookUrl">Webhook URL</Label>
                                <Input
                                  id="webhookUrl"
                                  type="url"
                                  value={settings.integrations.webhookUrl}
                                  onChange={(e) => updateSettings("integrations", {
                                    webhookUrl: e.target.value
                                  })}
                                  placeholder="https://api.example.com/webhooks/league"
                                />
                                <p className="text-xs text-muted-foreground">
                                  URL to receive league event notifications
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Configuration Changes</DialogTitle>
              <DialogDescription>
                Review your settings before applying changes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{settings.general.defaultDuration} {settings.general.durationUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Players per division:</span>
                      <span>{settings.general.minPlayersPerDivision}-{settings.general.maxPlayersPerDivision}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration deadline:</span>
                      <span>{settings.general.registrationDeadlineDays} days</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment processing:</span>
                      <span>
                        {settings.payment.enablePaymentProcessing ? (
                          <IconCheck className="size-4 text-green-500" />
                        ) : (
                          <IconX className="size-4 text-red-500" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Default fee:</span>
                      <span>{settings.payment.currency} {settings.payment.defaultLeagueFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund policy:</span>
                      <span className="capitalize">{settings.payment.refundPolicy}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
