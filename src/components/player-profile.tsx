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
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  image: string | null;
  area: string | null;
  gender: string | null;
  status: string | null;
  registeredDate: string;
  questionnaires: {
    sport: string;
    completedAt: string | null;
    answersJson: any;
    result: {
      rating: number;
      confidence: string;
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
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">N/A</span>;
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
          `${process.env.NEXT_PUBLIC_HOST_URL}/api/player/${playerId}`
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
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity & Security</TabsTrigger>
        <TabsTrigger value="raw_data">Raw Questionnaire Data</TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Main Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage
                      src={profile.image || undefined}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <Badge
                      variant={
                        profile.status === "active" ? "default" : "secondary"
                      }
                      className="capitalize mt-1"
                    >
                      {profile.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconMail className="size-4" />
                  <span>{profile.email}</span>
                </div>
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconCalendar className="size-4" />
                  <span>Joined on {formatDate(profile.registeredDate)}</span>
                </div>
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
                {profile.skillRatings ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(profile.skillRatings).map(
                      ([sport, rating]) => (
                        <div
                          key={sport}
                          className="rounded-lg border p-3 text-center"
                        >
                          <p className="text-xs uppercase text-muted-foreground">
                            {sport}
                          </p>
                          <p className="text-2xl font-bold">
                            {rating.rating.toFixed(1)}
                          </p>
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {rating.confidence}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No skill ratings available.
                  </p>
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
                      <TableHead>Completed On</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.questionnaires.map((q, index) => (
                      <TableRow key={index}>
                        <TableCell className="capitalize font-medium">
                          {q.sport}
                        </TableCell>
                        <TableCell>
                          {q.completedAt
                            ? formatDate(q.completedAt)
                            : "Incomplete"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {q.result?.confidence || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {q.result?.rating
                            ? (q.result.rating / 1000).toFixed(1)
                            : "N/A"}
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
          <Card>
            <CardHeader>
              <CardTitle>Login Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Linked On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.accounts.map((acc, i) => (
                    <TableRow key={i}>
                      <TableCell className="capitalize font-medium">
                        {acc.providerId}
                      </TableCell>
                      <TableCell>{formatDate(acc.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.sessions.map((sess, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground">
                        {sess.userAgent}
                      </TableCell>
                      <TableCell>{sess.ipAddress}</TableCell>
                      <TableCell>{formatDate(sess.expiresAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* RAW QUESTIONNAIRE DATA TAB */}
      <TabsContent value="raw_data">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDatabase className="size-5" />
              Raw Questionnaire Answers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.questionnaires.length > 0 ? (
              profile.questionnaires.map((q, index) => (
                <Collapsible key={index} className="rounded-lg border">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                    <div className="font-medium">
                      <span className="capitalize">{q.sport}</span>{" "}
                      Questionnaire
                      <span className="ml-4 text-sm text-muted-foreground">
                        {q.completedAt
                          ? `(Completed on ${formatDate(q.completedAt)})`
                          : "(Incomplete)"}
                      </span>
                    </div>
                    <IconChevronDown className="size-5 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t bg-muted/40 p-0">
                      {/* --- REPLACEMENT for the <pre> block --- */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Question</TableHead>
                            <TableHead>Answer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(q.answersJson).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium text-muted-foreground">
                                {formatQuestionKey(key)}
                              </TableCell>
                              <TableCell>{formatAnswerValue(value)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-4">
                No questionnaire data found for this player.
              </p>
            )}
          </CardContent>
        </Card>
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
