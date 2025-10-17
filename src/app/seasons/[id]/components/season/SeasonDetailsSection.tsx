"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Season } from "@/ZodSchema/season-schema";
import { format } from "date-fns";
import { IconEdit, IconInfoCircle } from "@tabler/icons-react";

interface SeasonDetailsSectionProps {
  season: Season;
}

const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined | React.ReactNode;
}) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
    <div className="text-sm font-medium">{value ?? "N/A"}</div>
  </div>
);

export default function SeasonDetailsSection({
  season,
}: SeasonDetailsSectionProps) {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  const formatEntryFee = (fee: string | null | undefined) => {
    if (!fee) return "Free";
    return `RM ${parseFloat(fee).toFixed(2)}`;
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
          // onClick={} Add the edit handler here 
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
              value={formatEntryFee(season.entryFee)}
            />
            {/* <DetailField label="Sport Type" value={season.sportType || 'N/A'} />
            <DetailField label="Season Type" value={season.seasonType || 'N/A'} /> */}
            <DetailField label="Created" value={formatDate(season.createdAt)} />
          </div>

          {/* Dates and Timeline */}
          <div className="space-y-4">
            <DetailField
              label="Start Date"
              value={formatDate(season.startDate)}
            />
            <DetailField label="End Date" value={formatDate(season.endDate)} />
            <DetailField
              label="Registration Deadline"
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
                <div className="text-sm leading-relaxed">
                  {season.description}
                </div>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
