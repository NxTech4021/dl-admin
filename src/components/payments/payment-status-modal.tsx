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
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useUpdatePaymentStatus } from "@/hooks/queries";
import type { PaymentRecord, PaymentStatus } from "@/constants/zod/payment-schema";

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
];

const getPaymentStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
        >
          <IconCircleCheck className="size-3 mr-1" />
          Paid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
        >
          <IconClock className="size-3 mr-1" />
          Pending
        </Badge>
      );
    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
        >
          <IconAlertTriangle className="size-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Unknown
        </Badge>
      );
  }
};

export function PaymentStatusModal({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: PaymentStatusModalProps) {
  const [newStatus, setNewStatus] = React.useState<PaymentStatus | "">("");
  const [reason, setReason] = React.useState("");

  const updateStatus = useUpdatePaymentStatus();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open && payment) {
      setNewStatus("");
      setReason("");
    }
  }, [open, payment]);

  const handleSubmit = async () => {
    if (!payment || !newStatus) return;

    try {
      await updateStatus.mutateAsync({
        membershipId: payment.id,
        data: {
          paymentStatus: newStatus,
          reason: reason || undefined,
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

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Add a note about this status change..."
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
