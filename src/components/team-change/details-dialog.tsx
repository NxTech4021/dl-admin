import { Badge } from "@/components/ui/badge";
import {
  IconUserMinus,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconHistory,
  IconUserPlus,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  WithdrawalRequestAdmin,
  DissolvedPartnership,
  PartnershipStatus,
} from "@/constants/zod/partnership-admin-schema";
import {
  getWithdrawalStatusLabel,
  getWithdrawalStatusColor,
  getPartnershipStatusLabel,
} from "@/constants/zod/partnership-admin-schema";
import { PartnershipAvatars } from "./partnership-avatars";
import { formatDateTime, getInitials, getAvatarColor } from "./utils";

export interface DetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: WithdrawalRequestAdmin | null;
  selectedPartnership: DissolvedPartnership | null;
}

function WithdrawalRequestDetails({ request }: { request: WithdrawalRequestAdmin }) {
  return (
    <div className="space-y-5">
      {/* Partnership Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-2 bg-muted/40 border-b">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Partnership</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <PartnershipAvatars
              captain={request.partnership?.captain || null}
              partner={request.partnership?.partner || null}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {request.partnership?.captain?.name} & {request.partnership?.partner?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {request.partnership?.division?.name || "No division"} {"\u2022"} {request.season?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Timeline Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-2 bg-muted/40 border-b">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Request Timeline</span>
        </div>
        <div className="p-4">
          <div className="space-y-0">
            {/* Request Submitted */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <IconUserMinus className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="w-px flex-1 bg-border my-1" />
              </div>
              <div className="pb-4 flex-1">
                <div className="text-sm font-medium">Withdrawal Requested</div>
                <div className="text-xs text-muted-foreground mb-2">{formatDateTime(request.requestDate)}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="size-5">
                    {request.user?.image && (
                      <AvatarImage src={request.user.image} />
                    )}
                    <AvatarFallback className={cn("text-white text-[8px]", getAvatarColor(request.user?.name))}>
                      {getInitials(request.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{request.user?.name}</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 italic">
                  "{request.reason}"
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center",
                  request.status === "APPROVED"
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : request.status === "REJECTED"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-slate-100 dark:bg-slate-800"
                )}>
                  {request.status === "APPROVED" ? (
                    <IconCircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : request.status === "REJECTED" ? (
                    <IconCircleX className="size-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <IconClock className="size-4 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                {request.partnership?.successors && request.partnership.successors.length > 0 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className={cn("flex-1", request.partnership?.successors && request.partnership.successors.length > 0 ? "pb-4" : "")}>
                <div className="text-sm font-medium flex items-center gap-2">
                  {request.status === "APPROVED" ? "Approved" : request.status === "REJECTED" ? "Rejected" : "Pending Review"}
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", getWithdrawalStatusColor(request.status))}
                  >
                    {getWithdrawalStatusLabel(request.status)}
                  </Badge>
                </div>
                {request.processedByAdmin ? (
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(request.updatedAt)} by {request.processedByAdmin.name}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Awaiting admin review</div>
                )}
              </div>
            </div>

            {/* Successor Partnership */}
            {request.partnership?.successors && request.partnership.successors.length > 0 && (
              <SuccessorTimelineEntry
                successor={request.partnership.successors[0]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnershipLifecycleDetails({ partnership }: { partnership: DissolvedPartnership }) {
  return (
    <div className="space-y-5">
      {/* Original Partnership Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-2 bg-muted/40 border-b">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Original Partnership</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <PartnershipAvatars
              captain={partnership.captain}
              partner={partnership.partner}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {partnership.captain?.name} & {partnership.partner?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {partnership.division?.name || "No division"} {"\u2022"} {partnership.season?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-2 bg-muted/40 border-b">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lifecycle Timeline</span>
        </div>
        <div className="p-4">
          <div className="space-y-0">
            {/* Created */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <IconCircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="w-px flex-1 bg-border my-1" />
              </div>
              <div className="pb-4 flex-1">
                <div className="text-sm font-medium">Partnership Created</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(partnership.createdAt)}</div>
              </div>
            </div>

            {/* Withdrawal Request */}
            {partnership.withdrawalRequest && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <IconUserMinus className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="w-px flex-1 bg-border my-1" />
                </div>
                <div className="pb-4 flex-1">
                  <div className="text-sm font-medium">{partnership.withdrawalRequest.user?.name} Left</div>
                  <div className="text-xs text-muted-foreground mb-2">{formatDateTime(partnership.withdrawalRequest.requestDate)}</div>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 italic">
                    "{partnership.withdrawalRequest.reason}"
                  </div>
                </div>
              </div>
            )}

            {/* Dissolved */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <IconCircleX className="size-4 text-slate-600 dark:text-slate-400" />
                </div>
                {partnership.successors && partnership.successors.length > 0 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className={cn("flex-1", partnership.successors && partnership.successors.length > 0 ? "pb-4" : "")}>
                <div className="text-sm font-medium">Partnership Dissolved</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(partnership.dissolvedAt)}</div>
              </div>
            </div>

            {/* Successor */}
            {partnership.successors && partnership.successors.length > 0 && (
              <SuccessorTimelineEntry
                successor={partnership.successors[0]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared successor timeline entry used in both detail views
function SuccessorTimelineEntry({
  successor,
}: {
  successor: {
    id: string;
    status: string;
    createdAt: string;
    captain: { id: string; name: string | null; image?: string | null };
    partner: { id: string; name: string | null; image?: string | null } | null;
  };
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          "size-8 rounded-full flex items-center justify-center",
          successor.status === "ACTIVE"
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-amber-100 dark:bg-amber-900/30"
        )}>
          <IconUserPlus className={cn(
            "size-4",
            successor.status === "ACTIVE"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          )} />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">New Partnership Formed</div>
        <div className="text-xs text-muted-foreground mb-2">{formatDateTime(successor.createdAt)}</div>
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
          <PartnershipAvatars
            captain={successor.captain}
            partner={successor.partner}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {successor.captain?.name}
              {successor.partner
                ? ` & ${successor.partner.name}`
                : " (finding partner)"}
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] shrink-0",
              successor.status === "ACTIVE"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
            )}
          >
            {getPartnershipStatusLabel(successor.status as PartnershipStatus)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function DetailsDialog({
  open,
  onOpenChange,
  selectedRequest,
  selectedPartnership,
}: DetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedRequest ? (
              <>
                <IconUserMinus className="size-5" />
                Withdrawal Request Details
              </>
            ) : (
              <>
                <IconHistory className="size-5" />
                Partnership Lifecycle
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {selectedRequest && <WithdrawalRequestDetails request={selectedRequest} />}
        {selectedPartnership && <PartnershipLifecycleDetails partnership={selectedPartnership} />}
      </DialogContent>
    </Dialog>
  );
}
