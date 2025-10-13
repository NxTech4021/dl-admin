/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  IconMail,
  IconMapPin,
  IconCalendar,
  IconTrophy,
  IconUserCircle,
  IconListCheck,
  IconChevronDown,
  IconActivity,
  IconDatabase,
  IconPhone,
  IconCake,
  IconClock,
  IconShield,
  IconTarget,
  IconUserCheck,
  IconStar,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import axios from "axios";

interface PlayerProfileData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string;
  displayUsername: string | null;
  role: string;
  dateOfBirth: string | null;
  gender: string | null;
  area: string | null;
  bio: string | null;
  phoneNumber: string | null;
  completedOnboarding: boolean;
  lastActivityCheck: string | null;
  lastLogin: string | null;
  status: string;
  registeredDate: string;
  questionnaires: {
    sport: string;
    qVersion: number;
    qHash: string;
    completedAt: string | null;
    startedAt: string;
    answersJson: any;
    result: {
      rating: number;
      confidence: string;
      rd: number;
      singles?: number;
      doubles?: number;
      source?: string;
      detail?: any;
    } | null;
  }[];
  skillRatings: Record<
    string,
    { rating: number; confidence: string; rd: number }
  > | null;
  accounts: { providerId: string; createdAt: string }[];
  sessions: {
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: string;
    createdAt: string;
  }[];
  matches: {
    id: string;
    sport: string;
    matchType: string;
    playerScore: number;
    opponentScore: number;
    outcome: string;
    matchDate: string;
    location: string | null;
    notes: string | null;
    duration: number | null;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    category: string;
    points: number;
    unlockedAt: string;
  }[];
}

interface PlayerProfileProps {
  playerId: string;
}

// Helper function to format JSON keys into readable question text
const formatQuestionKey = (key: string) => {
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([A-Z])/g, " $1") // Add space before capital letters for camelCase
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

// Helper function to format various answer types into readable strings
const formatAnswerValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object" && value !== null) {
    // Handle objects like skills - format them nicely
    return Object.entries(value)
      .map(([key, val]) => {
        // Format key names (remove underscores, capitalize)
        const formattedKey = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        return `${formattedKey}: ${val}`;
      })
      .join("; ");
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return "N/A";
  }
  return String(value);
};

export function PlayerProfile({ playerId }: PlayerProfileProps) {
  const [profile, setProfile] = React.useState<PlayerProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!playerId) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST_URL}/player/${playerId}`
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch profile");
        }
        const result = response.data;
        setProfile(result.data);
      } catch (error) {
        console.error("Error fetching player profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [playerId]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container p-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested player could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <IconUserCircle className="size-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <IconActivity className="size-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="matches" className="flex items-center gap-2">
          <IconTarget className="size-4" />
          Matches
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <IconStar className="size-4" />
          Achievements
        </TabsTrigger>
        <TabsTrigger value="raw_data" className="flex items-center gap-2">
          <IconDatabase className="size-4" />
          Raw Data
        </TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Main Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="size-20">
                    <AvatarImage
                      src={profile.image || undefined}
                      alt={profile.name}
                    />
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
                      {/* <Badge
                      variant={
                        profile.status === "active" ? "default" : "secondary"
                      }
                        className="capitalize"
                    >
                      {profile.status}
                      </Badge> */}
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
          </div>

          {/* Right Column: Ratings and History */}
          <div className="md:col-span-2 space-y-6">
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
                      <div
                        key={index}
                        className="rounded-lg border p-4 space-y-4"
                      >
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
                                  <span className="text-muted-foreground">
                                    Source:
                                  </span>
                                  <span className="text-xs capitalize font-medium">
                                    {q.result.source}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Started:
                                </span>
                                <span className="text-xs">
                                  {formatDate(q.startedAt)}
                                </span>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconListCheck className="size-5" />
                  Questionnaire History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sport</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Singles</TableHead>
                      <TableHead>Doubles</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.questionnaires.map((q, index) => (
                      <TableRow key={index}>
                        <TableCell className="capitalize font-medium">
                          {q.sport}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            v{q.qVersion}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(q.startedAt)}
                        </TableCell>
                        <TableCell>
                          {q.completedAt ? (
                            <div className="flex items-center gap-2">
                              <IconUserCheck className="size-4 text-green-600" />
                              <span className="text-sm">
                                {formatDate(q.completedAt)}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Incomplete
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {q.result?.singles || "N/A"}
                        </TableCell>
                        <TableCell className="font-mono">
                          {q.result?.doubles || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize text-xs ${
                              q.result?.confidence === "high"
                                ? "text-green-600"
                                : q.result?.confidence === "medium"
                                ? "text-yellow-600"
                                : q.result?.confidence === "low"
                                ? "text-red-600"
                                : ""
                            }`}
                          >
                            {q.result?.confidence || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* ACTIVITY & SECURITY TAB */}
      <TabsContent value="activity">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Login Methods Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconShield className="size-5 text-blue-600" />
                Login Methods
              </CardTitle>
              <CardDescription>
                Authentication providers linked to this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.accounts && profile.accounts.length > 0 ? (
                <div className="space-y-3">
                  {profile.accounts.map((acc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <IconShield className="size-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {acc.providerId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Linked on {formatDate(acc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IconShield className="size-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No login methods found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="size-5 text-green-600" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Current active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.sessions && profile.sessions.length > 0 ? (
                <div className="space-y-3">
                  {profile.sessions.map((sess, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                          </div>
                          <span className="text-sm font-medium">
                            Active Session
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(sess.expiresAt)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Device:</span>
                          <span className="truncate">
                            {sess.userAgent || "Unknown device"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">IP:</span>
                          <span className="font-mono text-xs">
                            {sess.ipAddress || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IconClock className="size-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No active sessions found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* MATCHES TAB */}
      <TabsContent value="matches">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTarget className="size-5" />
              Match History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.matches && profile.matches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sport</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="capitalize font-medium">
                        {match.sport}
                      </TableCell>
                      <TableCell className="capitalize">
                        {match.matchType}
                      </TableCell>
                      <TableCell className="font-mono">
                        {match.playerScore} - {match.opponentScore}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            match.outcome === "win"
                              ? "default"
                              : match.outcome === "loss"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {match.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(match.matchDate)}</TableCell>
                      <TableCell>{match.location || "N/A"}</TableCell>
                      <TableCell>
                        {match.duration ? `${match.duration} min` : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No match history found for this player.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ACHIEVEMENTS TAB */}
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

      {/* RAW QUESTIONNAIRE DATA TAB */}
      <TabsContent value="raw_data">
        <div className="space-y-6">
          {/* <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Questionnaire Responses</h2>
            <p className="text-muted-foreground">
              Detailed answers from player assessments
            </p>
          </div> */}

          {profile.questionnaires.length > 0 ? (
            <div className="space-y-6">
              {profile.questionnaires.map((q, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {q.sport} Questionnaire
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Version {q.qVersion}
                          </Badge>
                          <span>Started {formatDate(q.startedAt)}</span>
                          {q.completedAt && (
                            <>
                              <span>•</span>
                              <span>Completed {formatDate(q.completedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {q.completedAt ? (
                        <Badge className="bg-green-600 text-white">
                          <IconUserCheck className="size-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Collapsible>
                      <CollapsibleTrigger className="flex w-full items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium">
                          View Responses
                        </span>
                        <IconChevronDown className="size-4 transition-transform data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="space-y-4">
                          {Object.entries(q.answersJson).map(([key, value]) => (
                            <div key={key} className="border rounded-lg p-4">
                              <h4 className="font-medium text-sm mb-3 text-foreground">
                                {formatQuestionKey(key)}
                              </h4>
                              <div className="text-sm">
                                {typeof value === "object" && value !== null ? (
                                  <div className="space-y-3">
                                    {Object.entries(value).map(
                                      ([subKey, subValue]) => (
                                        <div
                                          key={subKey}
                                          className="flex items-start gap-3"
                                        >
                                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2"></div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-xs text-muted-foreground mb-1">
                                              {subKey
                                                .replace(/_/g, " ")
                                                .replace(/([A-Z])/g, " $1")
                                                .replace(/^./, (str) =>
                                                  str.toUpperCase()
                                                )}
                                            </div>
                                            <div className="text-sm break-words">
                                              {String(subValue)}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm break-words">
                                    {formatAnswerValue(value)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <IconDatabase className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Questionnaire Data
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  This player hasn&apos;t completed any questionnaires yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

const ProfileSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-3">
    <div className="md:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    </div>
    <div className="md:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);
