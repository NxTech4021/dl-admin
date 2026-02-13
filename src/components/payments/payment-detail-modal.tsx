"use client";

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconUser,
  IconCalendar,
  IconMail,
} from "@tabler/icons-react";
import type { PaymentRecord } from "@/constants/zod/payment-schema";
import { getPaymentStatusBadge, getMembershipStatusBadge, getInitials, getAvatarColor } from "./payment-utils";
import { formatCurrency } from "@/lib/utils/format";

interface PaymentDetailModalProps {
  payment: PaymentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: () => void;
}

export function PaymentDetailModal({
  payment,
  open,
  onOpenChange,
  onUpdateStatus,
}: PaymentDetailModalProps) {
  const navigate = useNavigate();

  if (!payment) return null;

  const handleViewPlayer = () => {
    onOpenChange(false);
    navigate({ to: "/players/$playerId", params: { playerId: payment.userId } });
  };

  const handleViewSeason = () => {
    onOpenChange(false);
    navigate({ to: "/seasons/$seasonId", params: { seasonId: payment.seasonId } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            View payment information and membership status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Player Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <Avatar className="size-14 ring-2 ring-background">
              <AvatarImage src={payment.user?.image || undefined} />
              <AvatarFallback
                className={`text-white font-semibold text-lg ${getAvatarColor(
                  payment.user?.name || "Unknown"
                )}`}
              >
                {getInitials(payment.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">
                {payment.user?.name || "Unknown"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @{payment.user?.username || "unknown"}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <IconMail className="size-3.5" />
                <span className="truncate">{payment.user?.email || "No email"}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Season</p>
              <p className="font-medium">{payment.season?.name || "Unknown"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Entry Fee</p>
              <p className="font-semibold tabular-nums">
                {payment.season?.entryFee != null ? formatCurrency(payment.season.entryFee) : "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Status</p>
              <div>{getPaymentStatusBadge(payment.paymentStatus)}</div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Membership</p>
              <div>{getMembershipStatusBadge(payment.status)}</div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Joined Date</p>
              <p className="font-medium">
                {payment.joinedAt
                  ? new Date(payment.joinedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>

            {payment.divisionId && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Division</p>
                <p className="font-medium">Assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleViewPlayer} className="flex-1">
            <IconUser className="size-4 mr-2" />
            View Player
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewSeason} className="flex-1">
            <IconCalendar className="size-4 mr-2" />
            View Season
          </Button>
          <Button size="sm" onClick={onUpdateStatus} className="flex-1">
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
