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
import { Badge } from "@/components/ui/badge";
import { DetailField } from "@/components/ui/detail-field";
import {
  IconEdit,
  IconInfoCircle,
  IconMapPin,
  IconTrophy,
  IconCalendar,
  IconUser,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import LeagueEditModal from "@/components/modal/league-edit-modal";
import { getStatusBadgeVariant } from "@/components/data-table/constants";
import type { League } from "@/constants/types/league";
import { fadeInUp, fastTransition } from "@/lib/animation-variants";

interface LeagueDetailsSectionProps {
  league: League;
  onLeagueUpdated?: () => Promise<void>;
  formatLocation: (location: string) => string;
  getSportLabel: (sport: string) => string;
}

export function LeagueDetailsSection({
  league,
  onLeagueUpdated,
  formatLocation,
  getSportLabel,
}: LeagueDetailsSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEnumLabel = (value?: string | null) => {
    if (!value) return "Not set";
    return value
      .toString()
      .split("_")
      .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
      .join(" ");
  };

  // Calculate league age
  const getLeagueAge = (createdAt: string | null | undefined) => {
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
  const getLastUpdated = (updatedAt: string | null | undefined) => {
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={fastTransition}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconInfoCircle className="size-4" />
              League Information
            </CardTitle>
            <CardDescription>
              Overview of league details and configuration
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
              <DetailField label="League Name" value={league.name} />
              <DetailField
                label="Sport"
                icon={<IconTrophy className="size-3" />}
                value={
                  <Badge variant="outline" className="capitalize">
                    {getSportLabel(league.sportType)}
                  </Badge>
                }
              />
              <DetailField
                label="Location"
                icon={<IconMapPin className="size-3" />}
                value={formatLocation(league.location || "")}
              />
              <DetailField
                label="Status"
                value={
                  <Badge variant={getStatusBadgeVariant("LEAGUE", league.status)}>
                    {formatEnumLabel(league.status)}
                  </Badge>
                }
              />
            </div>

            {/* Right Column - Metadata & Stats */}
            <div className="space-y-4">
              <DetailField
                label="Created"
                icon={<IconCalendar className="size-3" />}
                value={formatDate(league.createdAt)}
              />
              <DetailField
                label="League Age"
                icon={<IconClock className="size-3" />}
                value={getLeagueAge(league.createdAt)}
              />
              <DetailField
                label="Last Updated"
                icon={<IconRefresh className="size-3" />}
                value={getLastUpdated(league.updatedAt)}
              />
              {league.createdBy && (
                <DetailField
                  label="Created By"
                  icon={<IconUser className="size-3" />}
                  value={league.createdBy.user?.name || "Unknown"}
                />
              )}
            </div>
          </div>

          {/* Description */}
          {league.description && (
            <div className="mt-6 pt-6 border-t">
              <DetailField
                label="Description"
                value={
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {league.description}
                  </p>
                }
              />
            </div>
          )}
        </CardContent>

        <LeagueEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          league={league}
          onLeagueUpdated={onLeagueUpdated}
        />
      </Card>
    </motion.div>
  );
}

export default LeagueDetailsSection;
