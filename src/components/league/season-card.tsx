import { useState, lazy, Suspense } from "react";
import {
  IconCalendar,
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Season, FormatDateFunction, Category } from "./types";
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

const SeasonCreateModal = lazy(() => import("@/components/modal/season-create-modal"));

interface SeasonCardProps {
  seasons: Season[];
  leagueId: string;
  categories: Category[];
  formatDate: FormatDateFunction;
  onSeasonCreated?: () => void;
  onDeleteSeason?: (seasonId: string) => void;
  onViewSeason?: (seasonId: string) => void;
  onEditSeason?: (season: Season) => void;
}

export function SeasonCard({
  seasons,
  leagueId,
  categories,
  formatDate,
  onSeasonCreated,
  onDeleteSeason,
  onViewSeason,
  onEditSeason,
}: SeasonCardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSeasonCreated = async () => {
    setIsCreateModalOpen(false);
    onSeasonCreated?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-5" aria-hidden="true" />
            Seasons
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <IconPlus className="size-4 mr-2" aria-hidden="true" />
            Create Season
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {seasons.length > 0 ? (
          <div className="space-y-3">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                    <IconCalendar className="size-4 text-yellow-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">{season.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(season.startDate)} -{" "}
                      {formatDate(season.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      season.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {season.status}
                  </span>

                  {/* View Button */}
                  {onViewSeason && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewSeason(season.id)}
                    >
                      <IconEye className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  )}

                  {/* Edit Button */}
                  {onEditSeason && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditSeason(season)}
                    >
                      <IconEdit className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  )}

                  {/* Existing Delete Button */}
                  {onDeleteSeason && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <IconTrash className="size-4 text-destructive" aria-hidden="true" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Season</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this season? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => onDeleteSeason(season.id)}
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
            <IconCalendar className="size-12 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No seasons yet.</p>
          </div>
        )}
      </CardContent>

      {/* SeasonCreateModal */}
      <Suspense fallback={null}>
        <SeasonCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          leagueId={leagueId}
          categories={categories}
          onSeasonCreated={handleSeasonCreated}
        />
      </Suspense>
    </Card>
  );
}
