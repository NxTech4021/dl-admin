import { IconTrophy, IconTarget, IconUserCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerProfileData } from "../types";
import { formatDate } from "../utils";

interface SkillRatingsCardProps {
  profile: PlayerProfileData;
}

export function SkillRatingsCard({ profile }: SkillRatingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTrophy className="size-5" />
          Skill Ratings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile.questionnaires && profile.questionnaires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.questionnaires.map((q, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                {/* Sport Header */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold capitalize text-primary">
                    {q.sport}
                  </h4>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      v{q.qVersion}
                    </Badge>
                    {q.completedAt ? (
                      <Badge
                        variant="default"
                        className="text-xs bg-green-600 text-white border-green-600"
                      >
                        <IconUserCheck className="size-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Ratings Display */}
                {q.result ? (
                  <div className="space-y-3">
                    {/* Singles Rating */}
                    {q.result.singles && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconTarget className="size-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Singles Rating
                            </span>
                          </div>
                          <span className="text-xl font-bold text-blue-600">
                            {q.result.singles}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Doubles Rating */}
                    {q.result.doubles && (
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconTarget className="size-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                              Doubles Rating
                            </span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {q.result.doubles}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Confidence:
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${
                            q.result.confidence === "high"
                              ? "text-green-600 border-green-200"
                              : q.result.confidence === "medium"
                                ? "text-yellow-600 border-yellow-200"
                                : q.result.confidence === "low"
                                  ? "text-red-600 border-red-200"
                                  : ""
                          }`}
                        >
                          {q.result.confidence}
                        </Badge>
                      </div>
                      {q.result.source && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Source:</span>
                          <span className="text-xs capitalize font-medium">
                            {q.result.source}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Started:</span>
                        <span className="text-xs">{formatDate(q.startedAt)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No rating data available
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started: {formatDate(q.startedAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconTrophy className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No questionnaire data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

