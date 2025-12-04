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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Match } from "@/constants/zod/match-schema";
import { useMessageParticipants } from "@/hooks/use-queries";
import { IconMessage, IconLoader2, IconMail, IconBell } from "@tabler/icons-react";
import { toast } from "sonner";

interface MessageParticipantsModalProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MessageParticipantsModal({
  match,
  open,
  onOpenChange,
  onSuccess,
}: MessageParticipantsModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(true);

  const messageParticipants = useMessageParticipants();

  const handleSubmit = async () => {
    if (!match || !subject.trim() || !message.trim()) return;

    try {
      await messageParticipants.mutateAsync({
        matchId: match.id,
        subject: subject.trim(),
        message: message.trim(),
        sendEmail,
        sendPush,
      });
      toast.success("Message sent to participants");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch {
      toast.error("Failed to send message");
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setSendEmail(true);
    setSendPush(true);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  if (!match) return null;

  const participantNames = match.participants
    .map((p) => p.user?.name || p.user?.username || "Unknown")
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <IconMessage className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Message Participants</DialogTitle>
          </div>
          <DialogDescription>
            Send a message to all participants in this match.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipients Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <Label className="text-xs text-muted-foreground">Recipients</Label>
            <p className="text-sm mt-1">{participantNames}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Delivery Options</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                />
                <Label
                  htmlFor="send-email"
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <IconMail className="size-4 text-muted-foreground" />
                  Send via Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-push"
                  checked={sendPush}
                  onCheckedChange={(checked) => setSendPush(checked as boolean)}
                />
                <Label
                  htmlFor="send-push"
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <IconBell className="size-4 text-muted-foreground" />
                  Send Push Notification
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={messageParticipants.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              messageParticipants.isPending ||
              !subject.trim() ||
              !message.trim() ||
              (!sendEmail && !sendPush)
            }
          >
            {messageParticipants.isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
