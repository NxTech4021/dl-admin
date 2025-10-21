import { IconStar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { PlayerProfileData } from "../utils/types";
import { formatDate } from "../utils/utils";

interface AchievementsTabProps {
  profile: PlayerProfileData;
}

export function AchievementsTab({ profile }: AchievementsTabProps) {
  return (
    <TabsContent value="achievements">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconStar className="size-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.achievements && profile.achievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profile.achievements.map((achievement) => (
                <Card key={achievement.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="secondary" className="capitalize">
                        {achievement.category}
                      </Badge>
                      <span>
                        Unlocked: {formatDate(achievement.unlockedAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No achievements unlocked yet.
            </p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

