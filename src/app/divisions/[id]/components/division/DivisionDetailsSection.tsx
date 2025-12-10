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
import { Badge } from "@/components/ui/badge";
import { Division } from "@/constants/zod/division-schema";
import { DetailField } from "@/components/ui/detail-field";
import {
  IconEdit,
  IconInfoCircle,
  IconTrophy,
  IconUsers,
  IconTarget,
} from "@tabler/icons-react";
import DivisionCreateModal from "@/components/modal/division-create-modal";

interface DivisionDetailsSectionProps {
  division: Division;
  onDivisionUpdated: () => Promise<void>;
}

export default function DivisionDetailsSection({
  division,
  onDivisionUpdated,
}: DivisionDetailsSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrizePool = (amount: number | null | undefined) => {
    if (!amount) return "Not set";
    return `MYR ${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <IconInfoCircle className="size-4" />
            Division Details
          </CardTitle>
          <CardDescription>
            Overview of division configuration and settings
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
            <DetailField label="Name" value={division.name} />
            <DetailField
              label="Level"
              icon={<IconTrophy className="size-3" />}
              value={
                <Badge variant="outline" className="capitalize">
                  {division.divisionLevel}
                </Badge>
              }
            />
            <DetailField
              label="Game Type"
              icon={<IconUsers className="size-3" />}
              value={
                <Badge variant="outline" className="capitalize">
                  {division.gameType}
                </Badge>
              }
            />
            <DetailField
              label="Rating Threshold"
              icon={<IconTarget className="size-3" />}
              value={
                division.threshold ? `${division.threshold} pts` : "No threshold"
              }
            />
          </div>

          {/* Capacity & Prize */}
          <div className="space-y-4">
            <DetailField
              label={
                division.gameType === "singles"
                  ? "Max Singles Players"
                  : "Max Doubles Teams"
              }
              value={
                division.gameType === "singles"
                  ? division.maxSingles || "Unlimited"
                  : division.maxDoublesTeams || "Unlimited"
              }
            />
            <DetailField
              label="Prize Pool"
              value={formatPrizePool(division.prizePoolTotal)}
              valueClassName={division.prizePoolTotal ? "text-green-600" : ""}
            />
            <DetailField
              label="Sponsor"
              value={division.sponsoredDivisionName || "No sponsor"}
            />
            <DetailField
              label="Status"
              value={
                <Badge
                  variant={division.isActive ? "default" : "secondary"}
                  className={
                    division.isActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : ""
                  }
                >
                  {division.isActive ? "Active" : "Inactive"}
                </Badge>
              }
            />
          </div>
        </div>

        {/* Description */}
        {division.description && (
          <div className="mt-6 pt-6 border-t">
            <DetailField
              label="Description"
              value={
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {division.description}
                </p>
              }
            />
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid gap-6 md:grid-cols-2">
            <DetailField
              label="Created"
              value={formatDate(division.createdAt)}
              labelClassName="text-xs"
            />
            <DetailField
              label="Last Updated"
              value={formatDate(division.updatedAt)}
              labelClassName="text-xs"
            />
          </div>
        </div>
      </CardContent>

      <DivisionCreateModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        division={division}
        onDivisionCreated={onDivisionUpdated}
      />
    </Card>
  );
}
