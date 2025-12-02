"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bug, X, Upload, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface BugReportWidgetProps {
  apiUrl?: string;
}

export function BugReportWidget({ apiUrl = process.env.NEXT_PUBLIC_API_URL || "" }: BugReportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    module: "",
    title: "",
    description: "",
    reportType: "BUG",
    severity: "MEDIUM",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
  });

  // Initialize DLA app on mount (auto-creates if needed)
  useEffect(() => {
    const initApp = async () => {
      try {
        if (!apiUrl) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Bug reporting: API URL not configured");
          }
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${apiUrl}/api/bug/init/dla`, {
          credentials: "include",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Bug reporting: Failed to initialize -", res.status);
          }
          return;
        }

        const data = await res.json();
        setAppId(data.appId);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Bug reporting ready");
        }
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          if (error.name === "AbortError") {
            console.warn("Bug reporting: Request timeout");
          } else {
            console.warn("Bug reporting:", error.message);
          }
        }
      }
    };

    initApp();
  }, [apiUrl]);

  // Auto-capture browser context
  const captureContext = () => {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "";
    let osName = "Unknown";
    let osVersion = "";

    // Parse browser
    if (ua.includes("Firefox")) {
      browserName = "Firefox";
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || "";
    } else if (ua.includes("Chrome")) {
      browserName = "Chrome";
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || "";
    } else if (ua.includes("Safari")) {
      browserName = "Safari";
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || "";
    } else if (ua.includes("Edge")) {
      browserName = "Edge";
      browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || "";
    }

    // Parse OS
    if (ua.includes("Windows")) {
      osName = "Windows";
      osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || "";
    } else if (ua.includes("Mac")) {
      osName = "macOS";
      osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace("_", ".") || "";
    } else if (ua.includes("Linux")) {
      osName = "Linux";
    } else if (ua.includes("Android")) {
      osName = "Android";
      osVersion = ua.match(/Android (\d+)/)?.[1] || "";
    } else if (ua.includes("iOS")) {
      osName = "iOS";
      osVersion = ua.match(/OS (\d+)/)?.[1] || "";
    }

    return {
      pageUrl: window.location.href,
      userAgent: ua,
      browserName,
      browserVersion,
      osName,
      osVersion,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (screenshots.length + files.length > 5) {
      toast.error("Maximum 5 screenshots allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setScreenshots((prev) => [...prev, ...validFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appId) {
      toast.error("App not configured");
      return;
    }

    if (!formData.module || !formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture context
      const context = captureContext();

      // Create bug report
      const reportRes = await fetch(`${apiUrl}/api/bug/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          appId,
          ...formData,
          ...context,
        }),
      });

      if (!reportRes.ok) {
        const error = await reportRes.json();
        throw new Error(error.error || "Failed to create bug report");
      }

      const report = await reportRes.json();

      // Upload screenshots if any
      // Note: In production, you'd upload to cloud storage first, then save URL
      // For now, we'll skip screenshot upload as it requires cloud storage setup

      toast.success(`Bug report ${report.reportNumber} created successfully`);

      // Reset form
      setFormData({
        module: "",
        title: "",
        description: "",
        reportType: "BUG",
        severity: "MEDIUM",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
      });
      setScreenshots([]);
      setScreenshotPreviews([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit bug report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        size="icon"
        variant="default"
      >
        <Bug className="h-6 w-6" />
      </Button>

      {/* Report Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Report a Bug
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Module/Feature Input */}
            <div className="space-y-2">
              <Label htmlFor="module">
                Module/Feature <span className="text-red-500">*</span>
              </Label>
              <Input
                id="module"
                name="module"
                value={formData.module}
                onChange={handleInputChange}
                placeholder="e.g. Matches, Dashboard, Login, Chat, Payments..."
                maxLength={100}
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of what happened..."
                rows={4}
              />
            </div>

            {/* Type and Severity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={formData.reportType}
                  onValueChange={(value) => handleSelectChange("reportType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUG">Bug</SelectItem>
                    <SelectItem value="FEEDBACK">Feedback</SelectItem>
                    <SelectItem value="SUGGESTION">Suggestion</SelectItem>
                    <SelectItem value="QUESTION">Question</SelectItem>
                    <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => handleSelectChange("severity", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Steps to Reproduce */}
            <div className="space-y-2">
              <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
              <Textarea
                id="stepsToReproduce"
                name="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={handleInputChange}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                rows={3}
              />
            </div>

            {/* Expected vs Actual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                <Textarea
                  id="expectedBehavior"
                  name="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={handleInputChange}
                  placeholder="What should happen..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualBehavior">Actual Behavior</Label>
                <Textarea
                  id="actualBehavior"
                  name="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={handleInputChange}
                  placeholder="What actually happens..."
                  rows={2}
                />
              </div>
            </div>

            {/* Screenshots */}
            <div className="space-y-2">
              <Label>Screenshots (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {screenshotPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Screenshot ${index + 1}`}
                      className="h-20 w-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {screenshots.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="h-6 w-6" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Max 5 screenshots, 5MB each
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
