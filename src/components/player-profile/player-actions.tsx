"use client";

import * as React from "react";
import {
  IconBan,
  IconCheck,
  IconTrash,
  IconHistory,
  IconAlertCircle,
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
import axiosInstance, { endpoints } from "@/lib/endpoints";
import { toast } from "sonner";

type PlayerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";

interface StatusHistoryItem {
  id: string;
  previousStatus: PlayerStatus;
  newStatus: PlayerStatus;
  reason: string;
  notes: string | null;
  createdAt: string;
  triggeredBy: {
    name: string;
    email: string;
  } | null;
  relatedMatch: {
    id: string;
    matchDate: string;
  } | null;
}

interface PlayerActionsProps {
  playerId: string;
  playerName: string;
  currentStatus: PlayerStatus;
  onStatusChange?: (newStatus: PlayerStatus) => void;
}

export function PlayerActions({
  playerId,
  playerName,
  currentStatus,
  onStatusChange,
}: PlayerActionsProps) {
  const [banDialogOpen, setBanDialogOpen] = React.useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [statusHistory, setStatusHistory] = React.useState<StatusHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [banReason, setBanReason] = React.useState("");
  const [banNotes, setBanNotes] = React.useState("");
  const [unbanNotes, setUnbanNotes] = React.useState("");
  const [deleteReason, setDeleteReason] = React.useState("");

  const fetchStatusHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await axiosInstance.get(
        endpoints.admin.players.getStatusHistory(playerId)
      );
      if (response.data.success) {
        setStatusHistory(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch status history:", error);
      toast.error("Failed to load status history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      toast.error("Ban reason is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        endpoints.admin.players.ban(playerId),
        {
          reason: banReason.trim(),
          notes: banNotes.trim() || undefined,
        }
      );

      if (response.data.success) {
        toast.success("Player banned successfully");
        setBanDialogOpen(false);
        setBanReason("");
        setBanNotes("");
        onStatusChange?.("BANNED");
      }
    } catch (error: any) {
      console.error("Failed to ban player:", error);
      toast.error(error.response?.data?.message || "Failed to ban player");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnban = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        endpoints.admin.players.unban(playerId),
        {
          notes: unbanNotes.trim() || undefined,
        }
      );

      if (response.data.success) {
        toast.success("Player unbanned successfully");
        setUnbanDialogOpen(false);
        setUnbanNotes("");
        onStatusChange?.("ACTIVE");
      }
    } catch (error: any) {
      console.error("Failed to unban player:", error);
      toast.error(error.response?.data?.message || "Failed to unban player");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      toast.error("Deletion reason is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(
        endpoints.admin.players.delete(playerId),
        {
          data: { reason: deleteReason.trim() },
        }
      );

      if (response.data.success) {
        toast.success("Player deleted successfully");
        setDeleteDialogOpen(false);
        setDeleteReason("");
        onStatusChange?.("DELETED");
      }
    } catch (error: any) {
      console.error("Failed to delete player:", error);
      toast.error(error.response?.data?.message || "Failed to delete player");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: PlayerStatus) => {
    const variants: Record<PlayerStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      ACTIVE: { variant: "default", className: "bg-green-600" },
      INACTIVE: { variant: "secondary" },
      SUSPENDED: { variant: "outline", className: "text-yellow-600 border-yellow-600" },
      BANNED: { variant: "destructive" },
      DELETED: { variant: "outline", className: "text-gray-500 border-gray-500" },
    };
    const config = variants[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  const isBanned = currentStatus === "BANNED";
  const isDeleted = currentStatus === "DELETED";

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Quick Actions</span>
            {getStatusBadge(currentStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {!isBanned && !isDeleted && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBanDialogOpen(true)}
              >
                <IconBan className="mr-2 size-4" />
                Ban Player
              </Button>
            )}
            {isBanned && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => setUnbanDialogOpen(true)}
              >
                <IconCheck className="mr-2 size-4" />
                Unban Player
              </Button>
            )}
            {!isDeleted && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <IconTrash className="mr-2 size-4" />
                Delete Player
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHistoryDialogOpen(true);
                fetchStatusHistory();
              }}
            >
              <IconHistory className="mr-2 size-4" />
              Status History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <IconBan className="size-5" />
              Ban Player
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to ban <strong>{playerName}</strong>? They
              will no longer be able to participate in matches or leagues.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ban-reason"
                placeholder="Enter the reason for banning this player..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-notes">Additional Notes (optional)</Label>
              <Textarea
                id="ban-notes"
                placeholder="Any additional notes..."
                value={banNotes}
                onChange={(e) => setBanNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={isLoading || !banReason.trim()}
            >
              {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Ban Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Dialog */}
      <AlertDialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <IconCheck className="size-5" />
              Unban Player
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban <strong>{playerName}</strong>? They
              will be able to participate in matches and leagues again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 mb-4">
            <Label htmlFor="unban-notes">Notes (optional)</Label>
            <Textarea
              id="unban-notes"
              placeholder="Any notes about lifting the ban..."
              value={unbanNotes}
              onChange={(e) => setUnbanNotes(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnban}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Unban Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <IconAlertCircle className="size-5" />
              Delete Player
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{playerName}</strong>?
              This will mark the player as deleted and they will no longer be
              able to access their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="delete-reason"
              placeholder="Enter the reason for deleting this player..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || !deleteReason.trim()}
            >
              {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              Delete Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconHistory className="size-5" />
              Status History for {playerName}
            </DialogTitle>
            <DialogDescription>
              View all status changes for this player
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : statusHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No status changes recorded
              </div>
            ) : (
              <div className="space-y-4">
                {statusHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.previousStatus)}
                        <span className="text-muted-foreground">→</span>
                        {getStatusBadge(item.newStatus)}
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
                        Changed by: {item.triggeredBy.name} ({item.triggeredBy.email})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
