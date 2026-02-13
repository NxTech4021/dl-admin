import { Button } from "@/components/ui/button";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { WithdrawalRequestAdmin } from "@/constants/zod/partnership-admin-schema";
import { PartnershipAvatars } from "./partnership-avatars";

export interface ProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: WithdrawalRequestAdmin | null;
  processAction: "APPROVED" | "REJECTED";
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ProcessDialog({
  open,
  onOpenChange,
  selectedRequest,
  processAction,
  adminNotes,
  onAdminNotesChange,
  onConfirm,
  isPending,
}: ProcessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {processAction === "APPROVED" ? (
              <IconCheck className="size-5 text-emerald-600" />
            ) : (
              <IconX className="size-5 text-red-600" />
            )}
            {processAction === "APPROVED" ? "Approve Withdrawal" : "Reject Withdrawal"}
          </DialogTitle>
          <DialogDescription>
            {processAction === "APPROVED" ? (
              <>
                This will dissolve the partnership between{" "}
                <strong>{selectedRequest?.partnership?.captain?.name}</strong> and{" "}
                <strong>{selectedRequest?.partnership?.partner?.name}</strong>.
                The remaining player will be able to find a new partner.
              </>
            ) : (
              <>
                This will reject {selectedRequest?.user?.name}'s request to leave the partnership.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedRequest && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-3">
                <PartnershipAvatars
                  captain={selectedRequest.partnership?.captain || null}
                  partner={selectedRequest.partnership?.partner || null}
                  size="md"
                />
                <div>
                  <div className="font-medium">
                    {selectedRequest.partnership?.captain?.name} & {selectedRequest.partnership?.partner?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.partnership?.division?.name} {"\u2022"} {selectedRequest.season?.name}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">Reason for leaving:</div>
                <div className="text-sm">{selectedRequest.reason}</div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add any notes about this decision..."
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={processAction === "APPROVED" ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? "Processing..."
              : processAction === "APPROVED"
              ? "Approve & Dissolve"
              : "Reject Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
