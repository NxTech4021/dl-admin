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
import { Badge } from "@/components/ui/badge";
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
  IconBan,
  IconReceiptRefund,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useUpdatePaymentStatus } from "@/hooks/queries";
import type { PaymentRecord, PaymentStatus } from "@/constants/zod/payment-schema";
import { getPaymentStatusBadge } from "./payment-utils";

interface PaymentStatusModalProps {
  payment: PaymentRecord | null;
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
  {
    value: "CANCELLED",
    label: "Cancelled",
    icon: IconBan,
    className: "text-gray-600",
  },
  {
    value: "REFUNDED",
    label: "Refunded",
    icon: IconReceiptRefund,
    className: "text-purple-600",
  },
];

export function PaymentStatusModal({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: PaymentStatusModalProps) {
  const [newStatus, setNewStatus] = React.useState<PaymentStatus | "">("");
  const [notes, setNotes] = React.useState("");

  const updateStatus = useUpdatePaymentStatus();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open && payment) {
      setNewStatus("");
      setNotes("");
    }
  }, [open, payment]);

  const handleSubmit = async () => {
    if (!payment || !newStatus) return;

    try {
      await updateStatus.mutateAsync({
        membershipId: payment.id,
        data: {
          paymentStatus: newStatus,
          notes: notes || undefined,
        },
      });
      toast.success(`Payment status updated to ${newStatus === "COMPLETED" ? "Paid" : newStatus.toLowerCase()}`);
      onSuccess();
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  if (!payment) return null;

  const isValid = newStatus && newStatus !== payment.paymentStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>
            Change the payment status for {payment.user?.name || "this player"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Current Status</Label>
            <div className="flex items-center gap-2">
              {getPaymentStatusBadge(payment.paymentStatus)}
              <span className="text-sm text-muted-foreground">
                for {payment.season?.name}
              </span>
            </div>
          </div>

          {/* New Status Select */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as PaymentStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isCurrent = option.value === payment.paymentStatus;
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={isCurrent}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${option.className}`} />
                        <span>{option.label}</span>
                        {isCurrent && (
                          <span className="text-xs text-muted-foreground">(current)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add a note about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateStatus.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || updateStatus.isPending}
          >
            {updateStatus.isPending && (
              <IconLoader2 className="size-4 mr-2 animate-spin" />
            )}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
