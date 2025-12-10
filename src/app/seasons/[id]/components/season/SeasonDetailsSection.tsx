"use client";

import { useState } from "react";
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
} from "@tabler/icons-react";
import SeasonEditModal from "@/components/modal/season-edit-modal";

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

  const formatEntryFee = (fee: number | null | undefined) => {
    if (fee == null || fee === 0) return "Free";
    return `RM ${fee.toFixed(2)}`;
  };

  return (
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
          {/* Basic Information */}
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
          </div>

          {/* Dates and Timeline */}
          <div className="space-y-4">
            <DetailField
              label="Start Date"
              icon={<IconCalendar className="size-3" />}
              value={formatDate(season.startDate)}
            />
            <DetailField
              label="End Date"
              icon={<IconCalendar className="size-3" />}
              value={formatDate(season.endDate)}
            />
            <DetailField
              label="Registration Deadline"
              icon={<IconCalendar className="size-3" />}
              value={formatDate(season.regiDeadline)}
            />
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
  );
}
