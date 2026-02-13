"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/endpoints";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Loader2, UserPlus } from "lucide-react";
import { logger } from "@/lib/logger";

interface AdminInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function AdminInviteModal({
  open,
  onOpenChange,
  children,
}: AdminInviteModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSendInvite = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // username is a must for creating users in the backend
      const tempUsername =
        email.split("@")[0] + Math.floor(Math.random() * 1000);

      const res = await axiosInstance.post(
        "/api/admin/invite",
        {
          email,
          name,
          username: tempUsername,
        }
      );
      logger.debug("Success toast about to fire");
      toast.success(res.data.message || "Invitation sent successfully!");

      logger.debug("email", res.data);
      setSuccess(res.data.message);
      setEmail("");
      setName("");
      // Close modal after successful invite
      onOpenChange(false);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to send invite");
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite a New Admin
          </DialogTitle>
          <DialogDescription>
            Send an invitation to a new admin user. They will receive an email
            with setup instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter admin's full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendInvite}
            disabled={loading || !email || !name}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
