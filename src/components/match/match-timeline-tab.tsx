import React from "react";
import {
  IconPlus,
  IconClipboardCheck,
  IconShieldCheck,
  IconTrophy,
  IconX,
  IconWalk,
  IconAlertTriangle,
  IconCheck,
  IconBan,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  formatCancellationReason,
  formatDisputeCategory,
  formatTimelineDate,
} from "@/lib/utils/format";
import type { Match } from "@/constants/zod/match-schema";

/** Timeline Event interface */
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  user?: { name: string; image?: string };
  details?: string;
}

/** Build timeline events from match data */
export const buildTimelineEvents = (match: Match): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Match Created
  if (match.createdAt) {
    events.push({
      id: 'created',
      timestamp: new Date(match.createdAt),
      icon: <IconPlus className="size-3.5" />,
      iconColor: 'text-muted-foreground bg-muted',
      title: 'created this match',
      user: match.createdBy ? {
        name: match.createdBy.name || match.createdBy.username || 'Unknown',
        image: (match.createdBy as { image?: string }).image,
      } : undefined,
    });
  }

  // Result Submitted
  if (match.resultSubmittedAt) {
    // Find who submitted - use resultSubmittedBy if available, else find by resultSubmittedById
    const submitter = match.resultSubmittedBy
      || match.participants?.find(p => p.userId === match.resultSubmittedById)?.user;

    events.push({
      id: 'result-submitted',
      timestamp: new Date(match.resultSubmittedAt),
      icon: <IconClipboardCheck className="size-3.5" />,
      iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
      title: 'submitted the result',
      user: submitter ? {
        name: submitter.name || submitter.username || 'Unknown',
        image: (submitter as { image?: string }).image,
      } : undefined,
      details: match.team1Score !== null && match.team2Score !== null
        ? `Score: ${match.team1Score} - ${match.team2Score}`
        : undefined,
    });
  }

  // Result Confirmed (by opponent or auto-approved)
  if (match.resultConfirmedAt) {
    // Find opponent - must exclude the submitter AND the creator (if same person)
    const submitterId = match.resultSubmittedById || match.createdById;
    const confirmingPlayer = submitterId
      ? match.participants?.find(
          p => p.userId !== submitterId && p.invitationStatus === 'ACCEPTED'
        )
      : null; // If we can't identify submitter, don't guess

    events.push({
      id: 'result-confirmed',
      timestamp: new Date(match.resultConfirmedAt),
      icon: <IconShieldCheck className="size-3.5" />,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      title: match.isAutoApproved
        ? 'Result auto-confirmed'
        : confirmingPlayer?.user
          ? 'confirmed the result'
          : 'Result confirmed',
      user: !match.isAutoApproved && confirmingPlayer?.user ? {
        name: confirmingPlayer.user.name || confirmingPlayer.user.username || 'Opponent',
        image: confirmingPlayer.user.image || undefined,
      } : undefined,
    });
  }

  // Always show final status as last event
  if (match.status === 'COMPLETED') {
    const completedTime = match.resultConfirmedAt || match.resultSubmittedAt || match.updatedAt;
    events.push({
      id: 'completed',
      timestamp: new Date(completedTime),
      icon: <IconTrophy className="size-3.5" />,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      title: 'Match completed',
    });
  }

  // Cancelled - find who cancelled
  if (match.status === 'CANCELLED' && match.cancelledAt) {
    const cancelledByPlayer = match.participants?.find(
      p => p.userId === match.cancelledById
    );

    events.push({
      id: 'cancelled',
      timestamp: new Date(match.cancelledAt),
      icon: <IconX className="size-3.5" />,
      iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      title: cancelledByPlayer?.user ? 'cancelled the match' : 'Match cancelled',
      user: cancelledByPlayer?.user ? {
        name: cancelledByPlayer.user.name || cancelledByPlayer.user.username || 'Unknown',
        image: cancelledByPlayer.user.image || undefined,
      } : undefined,
      details: match.cancellationReason
        ? formatCancellationReason(match.cancellationReason)
        : undefined,
    });
  }

  // Walkover - find who recorded it
  if (match.isWalkover && match.walkover?.recordedAt) {
    const recordedByPlayer = match.participants?.find(
      p => p.userId === match.walkover?.recordedById
    );

    events.push({
      id: 'walkover',
      timestamp: new Date(match.walkover.recordedAt),
      icon: <IconWalk className="size-3.5" />,
      iconColor: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      title: recordedByPlayer?.user ? 'recorded walkover' : 'Walkover recorded',
      user: recordedByPlayer?.user ? {
        name: recordedByPlayer.user.name || recordedByPlayer.user.username || 'Unknown',
        image: recordedByPlayer.user.image || undefined,
      } : undefined,
      details: match.walkover.reason
        ? formatCancellationReason(match.walkover.reason)
        : undefined,
    });
  }

  // Disputes
  match.disputes?.forEach((dispute, idx) => {
    // Use submittedAt with fallback to createdAt
    const filedAt = dispute.submittedAt || dispute.createdAt;
    // Use raisedByUser with fallback to disputedBy
    const filedByUser = dispute.raisedByUser || dispute.disputedBy;

    if (filedAt) {
      events.push({
        id: `dispute-${idx}`,
        timestamp: new Date(filedAt),
        icon: <IconAlertTriangle className="size-3.5" />,
        iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
        title: filedByUser ? 'filed a dispute' : 'Dispute filed',
        user: filedByUser ? {
          name: filedByUser.name || filedByUser.username || 'Unknown',
        } : undefined,
        details: dispute.disputeCategory
          ? formatDisputeCategory(dispute.disputeCategory)
          : undefined,
      });
    }

    if (dispute.resolvedAt) {
      const statusText = dispute.status?.toLowerCase() || 'resolved';
      events.push({
        id: `dispute-resolved-${idx}`,
        timestamp: new Date(dispute.resolvedAt),
        icon: <IconCheck className="size-3.5" />,
        iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        title: `Dispute ${statusText}`,
      });
    }
  });

  // Voided (admin action)
  if (match.status === 'VOID') {
    events.push({
      id: 'voided',
      timestamp: new Date(match.updatedAt),
      icon: <IconBan className="size-3.5" />,
      iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      title: 'Match voided by admin',
      details: match.adminNotes || undefined,
    });
  }

  // Sort by timestamp ascending
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

/** Timeline Item Component */
export function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {/* Connecting line - positioned absolutely to run behind the icon */}
      {!isLast && (
        <div
          className="absolute left-3 top-6 w-px bg-border -translate-x-1/2"
          style={{ height: "calc(100% - 6px)" }}
        />
      )}

      {/* Icon dot */}
      <div className="relative z-10 flex-shrink-0">
        <div className={cn(
          "size-6 rounded-full flex items-center justify-center",
          event.iconColor
        )}>
          {event.icon}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", !isLast && "pb-4")}>
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm min-w-0">
            {event.user ? (
              <>
                <span className="font-medium">{event.user.name}</span>
                <span className="text-muted-foreground"> {event.title}</span>
              </>
            ) : (
              <span className="font-medium">{event.title}</span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
            {formatTimelineDate(event.timestamp)}
          </span>
        </div>
        {event.details && (
          <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
        )}
      </div>
    </div>
  );
}

/** Match Activity Timeline Section */
export function MatchTimelineSection({ match }: { match: Match }) {
  const events = buildTimelineEvents(match);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Activity
      </h4>
      <div className="rounded-lg border border-border/50 p-4">
        {events.length > 0 ? (
          <div className="space-y-0">
            {events.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No activity recorded
          </p>
        )}
      </div>
    </div>
  );
}
