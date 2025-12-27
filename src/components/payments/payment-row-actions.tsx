"use client";

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useUpdatePaymentStatus } from "@/hooks/use-queries";
import type { PaymentRecord, PaymentStatus } from "@/constants/zod/payment-schema";

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

  const handleQuickStatusUpdate = React.useCallback(
    async (newStatus: PaymentStatus) => {
      try {
        await updateStatus.mutateAsync({
          membershipId: payment.id,
          data: { paymentStatus: newStatus },
        });
        toast.success(`Payment status updated to ${newStatus === "COMPLETED" ? "Paid" : newStatus.toLowerCase()}`);
      } catch {
        toast.error("Failed to update payment status");
      }
    },
    [payment.id, updateStatus]
  );

  const handleViewPlayer = React.useCallback(() => {
    navigate({ to: "/players/$playerId", params: { playerId: payment.userId } });
  }, [navigate, payment.userId]);

  const handleViewSeason = React.useCallback(() => {
    navigate({ to: "/seasons/$seasonId", params: { seasonId: payment.seasonId } });
  }, [navigate, payment.seasonId]);

  const currentStatus = payment.paymentStatus;

  return (
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
            onClick={() => handleQuickStatusUpdate("COMPLETED")}
            className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
            disabled={updateStatus.isPending}
          >
            <IconCircleCheck className="size-4 mr-2" />
            Mark as Paid
          </DropdownMenuItem>
        )}

        {currentStatus === "COMPLETED" && (
          <DropdownMenuItem
            onClick={() => handleQuickStatusUpdate("PENDING")}
            className="cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50"
            disabled={updateStatus.isPending}
          >
            <IconClock className="size-4 mr-2" />
            Mark as Pending
          </DropdownMenuItem>
        )}

        {currentStatus !== "FAILED" && (
          <DropdownMenuItem
            onClick={() => handleQuickStatusUpdate("FAILED")}
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
  );
}
