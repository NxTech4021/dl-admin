"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconCheck,
  IconAlertTriangle,
  IconFileText,
} from "@tabler/icons-react";
import Image from "next/image";

interface SponsorUploadProps {
  currentSponsor?: {
    name: string;
    logo?: string;
    website?: string;
    contactEmail?: string;
  };
  onSponsorUpdate: (sponsor: {
    name: string;
    logo?: string;
    website?: string;
    contactEmail?: string;
  }) => void;
  children?: React.ReactNode;
}

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

export default function SponsorUploadModal({ 
  currentSponsor, 
  onSponsorUpdate, 
  children 
}: SponsorUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [sponsorData, setSponsorData] = useState({
    name: currentSponsor?.name || "",
    website: currentSponsor?.website || "",
    contactEmail: currentSponsor?.contactEmail || "",
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error("File size too large. Please upload an image smaller than 5MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedFile({
          file,
          preview: e.target.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!sponsorData.name.trim()) {
      toast.error("Sponsor name is required");
      return;
    }

    setUploading(true);
    
    try {
      // TODO: Upload file to server and get URL
      let logoUrl = currentSponsor?.logo;
      
      if (uploadedFile) {
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        logoUrl = `/uploads/sponsors/${Date.now()}-${uploadedFile.name}`;
        toast.success("Logo uploaded successfully!");
      }

      // Update sponsor data
      onSponsorUpdate({
        name: sponsorData.name,
        logo: logoUrl,
        website: sponsorData.website,
        contactEmail: sponsorData.contactEmail,
      });

      toast.success("Sponsor information updated successfully!");
      setIsOpen(false);
      
    } catch (error) {
      toast.error("Failed to update sponsor information");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetModal = () => {
    setSponsorData({
      name: currentSponsor?.name || "",
      website: currentSponsor?.website || "",
      contactEmail: currentSponsor?.contactEmail || "",
    });
    setUploadedFile(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetModal();
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPhoto className="size-5" />
            Sponsor Management
          </DialogTitle>
          <DialogDescription>
            Upload sponsor logo and manage sponsor information for this league.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Sponsor Display */}
          {currentSponsor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Sponsor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {currentSponsor.logo ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <Image
                        src={currentSponsor.logo}
                        alt={currentSponsor.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <IconPhoto className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium">{currentSponsor.name}</p>
                    {currentSponsor.website && (
                      <p className="text-sm text-muted-foreground">{currentSponsor.website}</p>
                    )}
                    {currentSponsor.contactEmail && (
                      <p className="text-sm text-muted-foreground">{currentSponsor.contactEmail}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sponsor Information Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorName">Sponsor Name *</Label>
              <Input
                id="sponsorName"
                value={sponsorData.name}
                onChange={(e) => setSponsorData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter sponsor name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={sponsorData.website}
                onChange={(e) => setSponsorData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://sponsor-website.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={sponsorData.contactEmail}
                onChange={(e) => setSponsorData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@sponsor.com"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-4">
            <div>
              <Label>Sponsor Logo</Label>
              <p className="text-sm text-muted-foreground">
                Upload a logo image (JPEG, PNG, GIF, WebP) up to 5MB
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <Image
                        src={uploadedFile.preview}
                        alt="Upload preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <IconCheck className="size-4 text-green-600" />
                        <span className="font-medium">{uploadedFile.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(uploadedFile.size)}</span>
                        <Badge variant="outline">{uploadedFile.type}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <IconUpload className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Drag and drop your logo here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconFileText className="size-4" />
                  Logo Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <IconCheck className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use high-resolution images for best quality</span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCheck className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Square or rectangular logos work best</span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCheck className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Transparent backgrounds are recommended</span>
                </div>
                <div className="flex items-start gap-2">
                  <IconAlertTriangle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Ensure you have rights to use the logo</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || !sponsorData.name.trim()}
            >
              {uploading ? (
                <>
                  <IconUpload className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <IconCheck className="size-4 mr-2" />
                  Save Sponsor
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

