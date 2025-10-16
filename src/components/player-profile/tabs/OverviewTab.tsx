import { TabsContent } from "@/components/ui/tabs";
import { PlayerProfileData } from "../types";
import { ProfileCard } from "../sections/ProfileCard";
import { SkillRatingsCard } from "../sections/SkillRatingsCard";
import { QuestionnaireHistoryCard } from "../sections/QuestionnaireHistoryCard";

interface OverviewTabProps {
  profile: PlayerProfileData;
}

export function OverviewTab({ profile }: OverviewTabProps) {
  return (
    <TabsContent value="overview">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Main Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <ProfileCard profile={profile} />
        </div>

        {/* Right Column: Ratings and History */}
        <div className="md:col-span-2 space-y-6">
          <SkillRatingsCard profile={profile} />
          <QuestionnaireHistoryCard profile={profile} />
        </div>
      </div>
    </TabsContent>
  );
}

