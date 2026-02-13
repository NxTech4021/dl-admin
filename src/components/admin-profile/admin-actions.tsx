import * as React from "react";
import {
  IconBan,
  IconCheck,
  IconHistory,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useSuspendAdmin,
  useActivateAdmin,
} from "@/hooks/queries/use-admin-mutations";
import { useAdminStatusHistory } from "@/hooks/queries/use-admin-queries";
import type { AdminStatus, AdminStatusHistoryItem } from "./utils/types";
import { getAdminStatusConfig, formatDate } from "./utils/utils";

interface AdminActionsProps {
  adminId: string;
  adminName: string;
  currentStatus: AdminStatus;
  isSuperAdmin: boolean;
  isSelf: boolean;
}

export function AdminActions({
  adminId,
  adminName,
  currentStatus,
  isSuperAdmin,
  isSelf,
}: AdminActionsProps) {
  const [suspendDialogOpen, setSuspendDialogOpen] = React.useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = React.useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [suspendReason, setSuspendReason] = React.useState("");
  const [suspendNotes, setSuspendNotes] = React.useState("");
  const [activateNotes, setActivateNotes] = React.useState("");

  const suspendMutation = useSuspendAdmin();
  const activateMutation = useActivateAdmin();
  const { data: statusHistory, isLoading: historyLoading } =
    useAdminStatusHistory(adminId, historyDialogOpen);

  const handleSuspend = () => {
    if (!suspendReason.trim()) return;
    suspendMutation.mutate(
      {
        adminId,
        reason: suspendReason.trim(),
        notes: suspendNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuspendDialogOpen(false);
          setSuspendReason("");
          setSuspendNotes("");
        },
      }
    );
  };

  const handleActivate = () => {
    activateMutation.mutate(
      {
        adminId,
        notes: activateNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setActivateDialogOpen(false);
          setActivateNotes("");
        },
      }
    );
  };

  const statusConfig = getAdminStatusConfig(currentStatus);
  const canSuspend =
    isSuperAdmin && !isSelf && currentStatus === "ACTIVE";
  const canActivate =
    isSuperAdmin && currentStatus === "SUSPENDED";

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Quick Actions</span>
            <Badge
              variant={statusConfig.variant}
              className={statusConfig.className}
            >
              {statusConfig.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {canSuspend && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setSuspendDialogOpen(true)}
              >
                <IconBan className="mr-2 size-4" />
                Suspend Admin
              </Button>
            )}
            {canActivate && (
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                onClick={() => setActivateDialogOpen(true)}
              >
                <IconCheck className="mr-2 size-4" />
                Activate Admin
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryDialogOpen(true)}
            >
              <IconHistory className="mr-2 size-4" />
              Status History
            </Button>
          </div>
          {isSelf && isSuperAdmin && currentStatus === "ACTIVE" && (
            <p className="text-xs text-muted-foreground mt-2">
              You cannot suspend your own account.
            </p>
          )}
          {!isSuperAdmin && (
            <p className="text-xs text-muted-foreground mt-2">
              Only super admins can suspend or activate admins.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <IconBan className="size-5" />
              Suspend Admin
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{adminName}</strong>?
              They will no longer be able to access admin functions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="suspend-reason"
                placeholder="Enter the reason for suspending this admin..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-notes">
                Additional Notes (optional)
              </Label>
              <Textarea
                id="suspend-notes"
                placeholder="Any additional notes..."
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspendDialogOpen(false)}
              disabled={suspendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={suspendMutation.isPending || !suspendReason.trim()}
            >
              {suspendMutation.isPending && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Suspend Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <AlertDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
              <IconCheck className="size-5" />
              Activate Admin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate <strong>{adminName}</strong>?
              They will regain access to admin functions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 mb-4">
            <Label htmlFor="activate-notes">Notes (optional)</Label>
            <Textarea
              id="activate-notes"
              placeholder="Any notes about reactivating this admin..."
              value={activateNotes}
              onChange={(e) => setActivateNotes(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={activateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivate}
              disabled={activateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {activateMutation.isPending && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              Activate Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconHistory className="size-5" />
              Status History for {adminName}
            </DialogTitle>
            <DialogDescription>
              View all status changes for this admin
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : !statusHistory || statusHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No status changes recorded
              </div>
            ) : (
              <div className="space-y-4">
                {statusHistory.map((item: AdminStatusHistoryItem) => {
                  const prevConfig = getAdminStatusConfig(item.previousStatus);
                  const newConfig = getAdminStatusConfig(item.newStatus);
                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={prevConfig.variant}
                            className={prevConfig.className}
                          >
                            {prevConfig.label}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge
                            variant={newConfig.variant}
                            className={newConfig.className}
                          >
                            {newConfig.label}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Reason:</span>{" "}
                        <span className="capitalize">
                          {item.reason.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                      {item.notes && (
                        <div className="text-sm text-muted-foreground">
                          {item.notes}
                        </div>
                      )}
                      {item.triggeredBy && (
                        <div className="text-xs text-muted-foreground">
                          Changed by: {item.triggeredBy.name} (
                          {item.triggeredBy.email})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
