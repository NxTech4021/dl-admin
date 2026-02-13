import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconAlertTriangle,
  IconTargetArrow,
  IconPhoto,
  IconExternalLink,
} from "@tabler/icons-react";
import { getInitials } from "@/components/data-table/constants";
import { formatTableDate } from "@/components/data-table/constants";
import { cn } from "@/lib/utils";
import {
  formatDisputeCategory,
  formatDisputerScore,
} from "@/lib/utils/format";
import type { Match } from "@/constants/zod/match-schema";

/** Disputes Section */
export function MatchDisputesSection({ match }: { match: Match }) {
  if (!match.isDisputed || !match.disputes || match.disputes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wider text-destructive flex items-center gap-1.5">
        <IconAlertTriangle className="size-3.5" />
        Disputes
      </h4>
      {match.disputes.map((dispute) => {
        const filedByUser = dispute.raisedByUser || dispute.disputedBy;
        const filedByName = filedByUser?.name || filedByUser?.username || "Unknown";
        const filedByUsername = filedByUser?.username;
        const filedByImage = filedByUser?.image;
        const disputeReason = dispute.disputeComment ?? dispute.notes ?? "";
        const filedAt = dispute.submittedAt || dispute.createdAt;

        return (
          <div
            key={dispute.id}
            className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20 overflow-hidden"
          >
            {/* Header: User + Badges */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white/60 dark:bg-white/5 border-b border-orange-100 dark:border-orange-900/30">
              <Avatar className="size-7 ring-1 ring-orange-200 dark:ring-orange-800">
                <AvatarImage src={filedByImage as string | undefined} alt={filedByName} />
                <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 font-medium text-[10px]">
                  {getInitials(filedByName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs truncate text-orange-900 dark:text-orange-100">{filedByName}</span>
                  {filedByUsername && (
                    <span className="text-[10px] text-orange-600 dark:text-orange-400">@{filedByUsername}</span>
                  )}
                </div>
                <p className="text-[10px] text-orange-600 dark:text-orange-400">{formatTableDate(filedAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {dispute.priority && ["HIGH", "URGENT"].includes(dispute.priority) && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 font-semibold",
                      dispute.priority === "URGENT"
                        ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        : "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                    )}
                  >
                    {dispute.priority}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 h-4 font-medium",
                    dispute.status === "RESOLVED" && "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
                    dispute.status === "REJECTED" && "border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
                    dispute.status === "UNDER_REVIEW" && "border-sky-300 bg-sky-50 text-sky-600 dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
                    dispute.status === "OPEN" && "border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
                  )}
                >
                  {dispute.status?.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div className="px-3 py-2.5 space-y-2">
              {/* Category */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800 dark:text-orange-200">
                <IconAlertTriangle className="size-3.5" />
                {formatDisputeCategory(dispute.disputeCategory)}
              </div>

              {/* Description */}
              {disputeReason && (
                <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                  {disputeReason}
                </p>
              )}

              {/* Claimed Score & Evidence Row */}
              {(dispute.disputerScore != null || dispute.evidenceUrl) && (
                <div className="flex items-center gap-3 pt-1">
                  {dispute.disputerScore != null && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <IconTargetArrow className="size-3.5 text-orange-500 dark:text-orange-400" />
                      <span className="text-orange-600 dark:text-orange-400">Claimed:</span>
                      <span className="font-mono font-semibold text-orange-900 dark:text-orange-100">
                        {formatDisputerScore(dispute.disputerScore)}
                      </span>
                    </div>
                  )}
                  {dispute.evidenceUrl && (
                    <a
                      href={dispute.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100 hover:underline"
                    >
                      <IconPhoto className="size-3.5" />
                      Evidence
                      <IconExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
