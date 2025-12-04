"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Match, MatchReportCategory } from "@/constants/zod/match-schema";
import { useReportMatchAbuse } from "@/hooks/use-queries";
import { IconFlag, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface ReportAbuseModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const REPORT_CATEGORIES: { value: MatchReportCategory; label: string; description: string }[] = [
  { value: "FAKE_MATCH", label: "Fake Match", description: "Match appears to be fabricated or not actually played" },
  { value: "RATING_MANIPULATION", label: "Rating Manipulation", description: "Players intentionally losing or inflating ratings" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content", description: "Offensive or inappropriate match content" },
  { value: "HARASSMENT", label: "Harassment", description: "Harassment or bullying behavior" },
  { value: "SPAM", label: "Spam", description: "Spam or irrelevant match entries" },
  { value: "OTHER", label: "Other", description: "Other abuse not listed above" },
];

export function ReportAbuseModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: ReportAbuseModalProps) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<MatchReportCategory | "">("");

  const reportAbuse = useReportMatchAbuse();

  const handleSubmit = async () => {
    if (!match || !reason.trim() || !category) return;

    try {
      await reportAbuse.mutateAsync({
        matchId: match.id,
        reason: reason.trim(),
        category: category as MatchReportCategory,
      });
      toast.success("Match reported for abuse");
      onOpenChange(false);
      setReason("");
      setCategory("");
      onSuccess?.();
    } catch {
      toast.error("Failed to report match");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReason("");
      setCategory("");
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20">
              <IconFlag className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Report Match Abuse</DialogTitle>
          </div>
          <DialogDescription>
            Report this match for suspected abuse or policy violation. This will
            flag the match for further investigation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Abuse Category *</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as MatchReportCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex flex-col">
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category && (
              <p className="text-xs text-muted-foreground">
                {REPORT_CATEGORIES.find((c) => c.value === category)?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report *</Label>
            <Textarea
              id="reason"
              placeholder="Describe the abuse or policy violation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={reportAbuse.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={reportAbuse.isPending || !reason.trim() || !category}
          >
            {reportAbuse.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Reporting...
              </>
            ) : (
              "Report Abuse"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
