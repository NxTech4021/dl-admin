"use client";

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconEye,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconUser,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useUpdatePaymentStatus } from "@/hooks/queries";
import type { PaymentRecord, PaymentStatus } from "@/constants/zod/payment-schema";

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
};

interface PaymentRowActionsProps {
  payment: PaymentRecord;
  onViewDetail: () => void;
  onUpdateStatus: () => void;
}

export function PaymentRowActions({
  payment,
  onViewDetail,
  onUpdateStatus,
}: PaymentRowActionsProps) {
  const navigate = useNavigate();
  const updateStatus = useUpdatePaymentStatus();
  const [pendingAction, setPendingAction] = React.useState<PaymentStatus | null>(null);

  const handleConfirmStatusUpdate = React.useCallback(async () => {
    if (!pendingAction) return;
    try {
      await updateStatus.mutateAsync({
        membershipId: payment.id,
        data: { paymentStatus: pendingAction },
      });
      toast.success(`Payment status updated to ${STATUS_LABELS[pendingAction] ?? pendingAction.toLowerCase()}`);
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setPendingAction(null);
    }
  }, [payment.id, pendingAction, updateStatus]);

  const handleViewPlayer = React.useCallback(() => {
    navigate({ to: "/players/$playerId", params: { playerId: payment.userId } });
  }, [navigate, payment.userId]);

  const handleViewSeason = React.useCallback(() => {
    navigate({ to: "/seasons/$seasonId", params: { seasonId: payment.seasonId } });
  }, [navigate, payment.seasonId]);

  const currentStatus = payment.paymentStatus;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={onViewDetail} className="cursor-pointer">
            <IconEye className="size-4 mr-2" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Quick status updates */}
          {currentStatus !== "COMPLETED" && (
            <DropdownMenuItem
              onClick={() => setPendingAction("COMPLETED")}
              className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
              disabled={updateStatus.isPending}
            >
              <IconCircleCheck className="size-4 mr-2" />
              Mark as Paid
            </DropdownMenuItem>
          )}

          {currentStatus === "COMPLETED" && (
            <DropdownMenuItem
              onClick={() => setPendingAction("PENDING")}
              className="cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50"
              disabled={updateStatus.isPending}
            >
              <IconClock className="size-4 mr-2" />
              Mark as Pending
            </DropdownMenuItem>
          )}

          {currentStatus !== "FAILED" && (
            <DropdownMenuItem
              onClick={() => setPendingAction("FAILED")}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              disabled={updateStatus.isPending}
            >
              <IconAlertTriangle className="size-4 mr-2" />
              Mark as Failed
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={onUpdateStatus} className="cursor-pointer">
            <IconClock className="size-4 mr-2" />
            Update Status...
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleViewPlayer} className="cursor-pointer">
            <IconUser className="size-4 mr-2" />
            View Player Profile
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewSeason} className="cursor-pointer">
            <IconCalendar className="size-4 mr-2" />
            View Season
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {payment.user?.name || "this player"}&apos;s
              payment as <strong>{STATUS_LABELS[pendingAction ?? ""] ?? pendingAction?.toLowerCase()}</strong>?
              {pendingAction === "FAILED" && " This may affect their membership status."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusUpdate}
              disabled={updateStatus.isPending}
              className={
                pendingAction === "FAILED"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  : pendingAction === "COMPLETED"
                    ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
                    : ""
              }
            >
              {updateStatus.isPending && <IconLoader2 className="size-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
