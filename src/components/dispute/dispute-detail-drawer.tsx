"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconGavel,
  IconNotes,
  IconCalendar,
  IconUser,
  IconTrophy,
  IconMessage,
  IconClock,
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import { Dispute, getCategoryLabel, getResolutionActionLabel } from "@/constants/zod/dispute-schema";
import { DisputeStatusBadge } from "./dispute-status-badge";
import { DisputePriorityBadge } from "./dispute-priority-badge";
import { DisputeCategoryBadge } from "./dispute-category-badge";
import { formatTableDate } from "@/components/data-table/constants";
import Link from "next/link";

interface DisputeDetailDrawerProps {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: () => void;
  onAddNote: () => void;
}

export function DisputeDetailDrawer({
  dispute,
  open,
  onOpenChange,
  onResolve,
  onAddNote,
}: DisputeDetailDrawerProps) {
  if (!dispute) return null;

  const isResolved = dispute.status === "RESOLVED" || dispute.status === "REJECTED";
  const match = dispute.match;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get team participants
  const team1 = match?.participants?.filter((p) => p.team === "team1") || [];
  const team2 = match?.participants?.filter((p) => p.team === "team2") || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="size-6 text-destructive" />
            <SheetTitle>Dispute Details</SheetTitle>
          </div>
          <SheetDescription>
            Review dispute information and take action
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Status Overview */}
            <div className="flex flex-wrap items-center gap-2">
              <DisputeStatusBadge status={dispute.status} />
              <DisputePriorityBadge priority={dispute.priority} />
              <DisputeCategoryBadge category={dispute.disputeCategory} />
            </div>

            {/* Raised By */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconUser className="size-4" />
                  Raised By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={dispute.raisedByUser?.image || undefined} />
                    <AvatarFallback>
                      {getInitials(dispute.raisedByUser?.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{dispute.raisedByUser?.name}</p>
                    {dispute.raisedByUser?.username && (
                      <p className="text-sm text-muted-foreground">
                        @{dispute.raisedByUser.username}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <IconCalendar className="size-4" />
                  <span>Filed on {formatTableDate(dispute.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {dispute.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconMessage className="size-4" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{dispute.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Evidence */}
            {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dispute.evidenceUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <IconExternalLink className="size-4" />
                        Evidence {index + 1}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Match Context */}
            {match && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconTrophy className="size-4" />
                    Match Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Match ID</span>
                    <Link
                      href={`/matches?id=${match.id}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {match.id.slice(0, 12)}...
                    </Link>
                  </div>

                  {match.division && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Division</span>
                      <span className="text-sm font-medium">{match.division.name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Match Date</span>
                    <span className="text-sm">{formatTableDate(match.matchDate)}</span>
                  </div>

                  {match.team1Score !== null && match.team2Score !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reported Score</span>
                      <span className="font-mono font-medium">
                        {match.team1Score} - {match.team2Score}
                      </span>
                    </div>
                  )}

                  <Separator />

                  {/* Participants */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Team 1</p>
                      <div className="space-y-2">
                        {team1.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage src={p.user?.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(p.user?.name || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{p.user?.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Team 2</p>
                      <div className="space-y-2">
                        {team2.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage src={p.user?.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(p.user?.name || "?")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{p.user?.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Notes */}
            {dispute.adminNotes && dispute.adminNotes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconNotes className="size-4" />
                    Admin Notes ({dispute.adminNotes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dispute.adminNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {note.admin?.user?.name || "Admin"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTableDate(note.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                        {note.isInternalOnly && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Internal Only
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resolution (if resolved) */}
            {isResolved && dispute.resolutionAction && (
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
                    <IconCheck className="size-4" />
                    Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Action Taken</span>
                    <Badge variant="outline">
                      {getResolutionActionLabel(dispute.resolutionAction)}
                    </Badge>
                  </div>

                  {dispute.resolvedByAdmin && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resolved By</span>
                      <span className="text-sm font-medium">
                        {dispute.resolvedByAdmin.user?.name}
                      </span>
                    </div>
                  )}

                  {dispute.resolvedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resolved At</span>
                      <span className="text-sm">{formatTableDate(dispute.resolvedAt)}</span>
                    </div>
                  )}

                  {dispute.adminResolution && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Resolution Notes</p>
                        <p className="text-sm">{dispute.adminResolution}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconClock className="size-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 size-2 rounded-full bg-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Dispute Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTableDate(dispute.createdAt)}
                      </p>
                    </div>
                  </div>

                  {dispute.reviewedAt && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 size-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Under Review</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTableDate(dispute.reviewedAt)}
                          {dispute.reviewedByAdmin && (
                            <span> by {dispute.reviewedByAdmin.user?.name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {dispute.resolvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 size-2 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium">Resolved</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTableDate(dispute.resolvedAt)}
                          {dispute.resolvedByAdmin && (
                            <span> by {dispute.resolvedByAdmin.user?.name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" className="flex-1" onClick={onAddNote}>
            <IconNotes className="size-4 mr-2" />
            Add Note
          </Button>
          {!isResolved && (
            <Button className="flex-1" onClick={onResolve}>
              <IconGavel className="size-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
