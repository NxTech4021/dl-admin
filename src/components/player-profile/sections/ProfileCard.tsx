import {
  IconMail,
  IconMapPin,
  IconCalendar,
  IconUserCircle,
  IconPhone,
  IconCake,
  IconClock,
  IconShield,
  IconUserCheck,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerProfileData } from "../types";
import { getInitials, formatDate } from "../utils";

interface ProfileCardProps {
  profile: PlayerProfileData;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={profile.image || undefined} alt={profile.name} />
            <AvatarFallback className="text-xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {profile.emailVerified && (
                <Badge variant="outline" className="text-green-600">
                  <IconShield className="size-3 mr-1" />
                  Verified
                </Badge>
              )}
              {profile.completedOnboarding && (
                <Badge variant="outline" className="text-blue-600">
                  <IconUserCheck className="size-3 mr-1" />
                  Onboarded
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconMail className="size-4" />
            <span>{profile.email}</span>
          </div>
          {profile.phoneNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconPhone className="size-4" />
              <span>{profile.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconMapPin className="size-4" />
            <span>{profile.area || "Location not set"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconUserCircle className="size-4" />
            <span className="capitalize">
              {profile.gender || "Gender not set"}
            </span>
          </div>
          {profile.dateOfBirth && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCake className="size-4" />
              <span>{formatDate(profile.dateOfBirth)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="size-4" />
            <span>Joined on {formatDate(profile.registeredDate)}</span>
          </div>
          {profile.lastLogin && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconClock className="size-4" />
              <span>Last login: {formatDate(profile.lastLogin)}</span>
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground italic">
              &quot;{profile.bio}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

