"use client";

import { IconBuilding, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sponsor } from "./types";

interface SponsorCardProps {
  sponsors: Sponsor[];
  onEditSponsor?: (sponsor: Sponsor) => void; 
  onDeleteSponsor?: (sponsorId: string) => void;
}

export function SponsorCard({ 
  sponsors, 
  onEditSponsor, 
  onDeleteSponsor,
}: SponsorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBuilding className="size-5" />
          Sponsors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sponsors.length > 0 ? (
          <div className="space-y-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <IconBuilding className="size-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {sponsor.company?.name || sponsor.sponsoredName}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {sponsor.packageTier.toLowerCase()} tier
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {sponsor.contractAmount && (
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${sponsor.contractAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {onEditSponsor && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditSponsor(sponsor)}
                      className="flex items-center gap-1"
                    >
                      <IconEdit className="size-4" />
                      Edit Info
                    </Button>
                  )}

                    {onDeleteSponsor && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <IconTrash className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this sponsor? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => onDeleteSponsor(sponsor.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconBuilding className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No sponsors yet
            </p>
            <Button variant="outline" size="sm">
              <IconPlus className="size-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
