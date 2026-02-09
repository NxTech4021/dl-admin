"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { IconNotes, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAddDisputeNote } from "@/hooks/queries";
import { Dispute } from "@/constants/zod/dispute-schema";

interface DisputeAddNoteModalProps {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DisputeAddNoteModal({
  dispute,
  open,
  onOpenChange,
  onSuccess,
}: DisputeAddNoteModalProps) {
  const [note, setNote] = useState("");
  const [isInternalOnly, setIsInternalOnly] = useState(true);

  const addNote = useAddDisputeNote();

  const handleSubmit = async () => {
    if (!dispute || !note.trim()) return;

    try {
      await addNote.mutateAsync({
        disputeId: dispute.id,
        note: note.trim(),
        isInternalOnly,
      });

      toast.success("Note added successfully");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const resetForm = () => {
    setNote("");
    setIsInternalOnly(true);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  if (!dispute) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconNotes className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Admin Note</DialogTitle>
              <DialogDescription>
                Add a note to this dispute for tracking and communication
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Note Content */}
          <div className="space-y-2">
            <Label htmlFor="note">Note *</Label>
            <Textarea
              id="note"
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Internal Only Toggle */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="internal-only"
              checked={isInternalOnly}
              onCheckedChange={(checked) => setIsInternalOnly(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="internal-only"
                className="text-sm font-medium cursor-pointer"
              >
                Internal note only
              </Label>
              <p className="text-xs text-muted-foreground">
                {isInternalOnly
                  ? "This note will only be visible to admins"
                  : "This note will be visible to the disputing player"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={addNote.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addNote.isPending || !note.trim()}
          >
            {addNote.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
