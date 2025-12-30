"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Season } from "@/constants/zod/season-schema";
import { DetailField } from "@/components/ui/detail-field";
import { format } from "date-fns";
import {
  IconEdit,
  IconInfoCircle,
  IconCalendar,
  IconCurrencyDollar,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import SeasonEditModal from "@/components/modal/season-edit-modal";
import { staggerContainer, fastTransition } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

interface SeasonDetailsSectionProps {
  season: Season;
  onSeasonUpdated?: () => Promise<void>;
}

export default function SeasonDetailsSection({
  season,
  onSeasonUpdated,
}: SeasonDetailsSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  const formatShortDate = (date: Date | null | undefined) => {
    if (!date) return "TBD";
    return format(new Date(date), "MMM d, yyyy");
  };

  const formatEntryFee = (fee: number | null | undefined) => {
    if (fee == null || fee === 0) return "Free";
    return `RM ${fee.toFixed(2)}`;
  };

  // Calculate season age
  const getSeasonAge = (createdAt: Date | null | undefined) => {
    if (!createdAt) return "N/A";
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 60) return "1 month";
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    if (diffDays < 730) return "1 year";
    return `${Math.floor(diffDays / 365)} years`;
  };

  // Format relative time for last updated
  const getLastUpdated = (updatedAt: Date | null | undefined) => {
    if (!updatedAt) return "N/A";
    const updated = new Date(updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(updatedAt);
  };

  // Check timeline status for each milestone
  // Returns: "active" (current period), "upcoming" (in the future), "soon" (within 7 days), "completed" (past)
  const getTimelineStatus = (
    date: Date | null | undefined,
    nextDate?: Date | null | undefined
  ): "active" | "upcoming" | "soon" | "completed" => {
    if (!date) return "upcoming";
    const now = new Date();
    const targetDate = new Date(date);
    const nextTargetDate = nextDate ? new Date(nextDate) : null;

    // If we're past this date
    if (now >= targetDate) {
      // If there's a next date and we haven't reached it yet, this milestone is "active"
      if (nextTargetDate && now < nextTargetDate) {
        return "active";
      }
      return "completed";
    }

    // If we're before this date, check if it's coming soon (within 7 days)
    const daysUntil = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      return "soon";
    }

    return "upcoming";
  };

  // Registration status: green if open, red if closed/past
  const regiActualStatus = (() => {
    if (!season.regiDeadline) return "upcoming";
    const now = new Date();
    const deadline = new Date(season.regiDeadline);
    if (now >= deadline) return "closed"; // Past deadline = red
    return "active"; // Registration is open = green
  })() as "active" | "upcoming" | "soon" | "completed" | "closed";

  const startStatus = getTimelineStatus(season.startDate, season.endDate);
  const endStatus = getTimelineStatus(season.endDate);

  // Get dot color based on status
  const getDotColor = (status: "active" | "upcoming" | "soon" | "completed" | "closed") => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "soon":
        return "bg-amber-500";
      case "completed":
        return "bg-slate-400";
      case "closed":
        return "bg-red-500";
      case "upcoming":
      default:
        return "bg-muted-foreground/30";
    }
  };

  // Get row background based on status
  const getRowBg = (status: "active" | "upcoming" | "soon" | "completed", isAlt: boolean) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/5";
      case "soon":
        return "bg-amber-500/5";
      case "completed":
        return isAlt ? "bg-muted/20" : "";
      case "upcoming":
      default:
        return isAlt ? "bg-muted/20" : "";
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      transition={fastTransition}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconInfoCircle className="size-4" />
              Season Information
            </CardTitle>
            <CardDescription>
              Overview of season details and configuration
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Core Information */}
            <div className="space-y-4">
              <DetailField label="Season Name" value={season.name} />
              <DetailField
                label="Entry Fee"
                icon={<IconCurrencyDollar className="size-3" />}
                value={formatEntryFee(season.entryFee)}
              />
              <DetailField
                label="Created"
                icon={<IconCalendar className="size-3" />}
                value={formatDate(season.createdAt)}
              />
              <DetailField
                label="Season Age"
                icon={<IconClock className="size-3" />}
                value={getSeasonAge(season.createdAt)}
              />
              <DetailField
                label="Last Updated"
                icon={<IconRefresh className="size-3" />}
                value={getLastUpdated(season.updatedAt)}
              />
            </div>

            {/* Right Column - Timeline */}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Timeline</span>

              <div className="relative mt-6 ml-1">
                {/* Vertical line */}
                <div className="absolute left-[3px] top-1 bottom-1 w-px bg-border" />

                <div className="space-y-6">
                  {/* Registration Deadline */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "relative z-10 mt-0.5 size-[7px] rounded-full shrink-0",
                      getDotColor(regiActualStatus)
                    )} />
                    <div className="flex-1 flex items-baseline justify-between gap-2 -mt-0.5">
                      <span className="text-sm text-foreground">Registration Deadline</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatShortDate(season.regiDeadline)}
                      </span>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "relative z-10 mt-0.5 size-[7px] rounded-full shrink-0",
                      getDotColor(startStatus)
                    )} />
                    <div className="flex-1 flex items-baseline justify-between gap-2 -mt-0.5">
                      <span className="text-sm text-foreground">Start Date</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatShortDate(season.startDate)}
                      </span>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "relative z-10 mt-0.5 size-[7px] rounded-full shrink-0",
                      getDotColor(endStatus)
                    )} />
                    <div className="flex-1 flex items-baseline justify-between gap-2 -mt-0.5">
                      <span className="text-sm text-foreground">End Date</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatShortDate(season.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {season.description && (
            <div className="mt-6 pt-6 border-t">
              <DetailField
                label="Description"
                value={
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {season.description}
                  </p>
                }
              />
            </div>
          )}
        </CardContent>

        <SeasonEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          season={season}
          onSeasonUpdated={onSeasonUpdated}
        />
      </Card>
    </motion.div>
  );
}
