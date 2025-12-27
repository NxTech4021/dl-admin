"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useBulkUpdatePaymentStatus } from "@/hooks/use-queries";
import type { PaymentStatus } from "@/constants/zod/payment-schema";

interface BulkPaymentModalProps {
  membershipIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: PaymentStatus; label: string; icon: React.ElementType; className: string }[] = [
  {
    value: "COMPLETED",
    label: "Paid",
    icon: IconCircleCheck,
    className: "text-emerald-600",
  },
  {
    value: "PENDING",
    label: "Pending",
    icon: IconClock,
    className: "text-amber-600",
  },
  {
    value: "FAILED",
    label: "Failed",
    icon: IconAlertTriangle,
    className: "text-red-600",
  },
];

export function BulkPaymentModal({
  membershipIds,
  open,
  onOpenChange,
  onSuccess,
}: BulkPaymentModalProps) {
  const [newStatus, setNewStatus] = React.useState<PaymentStatus | "">("");
  const [reason, setReason] = React.useState("");

  const bulkUpdate = useBulkUpdatePaymentStatus();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setNewStatus("");
      setReason("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newStatus || membershipIds.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        membershipIds,
        paymentStatus: newStatus,
        reason: reason || undefined,
      });
      toast.success(`Updated ${membershipIds.length} payment${membershipIds.length !== 1 ? "s" : ""} to ${newStatus === "COMPLETED" ? "Paid" : newStatus.toLowerCase()}`);
      onSuccess();
    } catch {
      toast.error("Failed to update payment statuses");
    }
  };

  const count = membershipIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update {count} Payment{count !== 1 ? "s" : ""}</DialogTitle>
          <DialogDescription>
            This will update the status for all selected payments at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <IconAlertCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Bulk Update
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                You are about to update {count} payment record{count !== 1 ? "s" : ""} at once.
                This action can be undone by updating individual records.
              </p>
            </div>
          </div>

          {/* New Status Select */}
          <div className="space-y-2">
            <Label htmlFor="bulk-status">Set Status To</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as PaymentStatus)}
            >
              <SelectTrigger id="bulk-status">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${option.className}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="bulk-reason">
              Reason <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="bulk-reason"
              placeholder="Add a note about this bulk update..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkUpdate.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newStatus || bulkUpdate.isPending}
          >
            {bulkUpdate.isPending && (
              <IconLoader2 className="size-4 mr-2 animate-spin" />
            )}
            Update {count} Item{count !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
