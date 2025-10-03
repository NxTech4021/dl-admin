"use client";

import * as React from "react";
import {
  IconMail,
  IconMapPin,
  IconUserCircle,
  IconActivity,
  IconDatabase,
  IconDashboard,
} from "@tabler/icons-react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  area: string | null;
  gender: string | null;
  status: string | null;
  accounts: { providerId: string; createdAt: string }[];
}

interface AdminProfileProps {
  adminId: string;
  initialData?: AdminProfileData;
}

export function AdminProfile({ adminId }: AdminProfileProps) {
  const [profile, setProfile] = React.useState<AdminProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/profile/${adminId}`
        );
        const data = res.data;

        // to shape the backend with frontend interface
        const mappedProfile: AdminProfileData = {
          id: data.id,
          name: data.user?.name ?? "N/A",
          email: data.user?.email ?? "N/A",
          image: data.user?.image ?? null,
          area: null, // or map if backend provides it
          gender: data.user?.gender ?? null,
          status: data.status ?? null,
          accounts: data.user?.accounts ?? [],
        };

        setProfile(mappedProfile);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [adminId]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested admin data could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "NA";

  // const formatDate = (dateString: string) =>
  //   new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //   });

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="complaints">Complaints</TabsTrigger>
        <TabsTrigger value="leagues">Leagues</TabsTrigger>
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Ratings and History */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconDashboard className="size-5" />
                  Future modules section
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p> Coming soon.... </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconActivity className="size-5" />
                  Future modules section
                </CardTitle>
              </CardHeader>

              <CardContent>
                {/* <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sport</TableHead>
                      <TableHead>Completed On</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      
                  </TableBody>
                </Table> */}
                <p> Coming soon.... </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Future tabs*/}
      <TabsContent value="leagues">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDatabase className="size-5" />
              Future League & Matches Module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p> Coming soon.... </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="complaints">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconDatabase className="size-5" />
              Future Monitoring & Reports Module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p> Coming soon.... </p>
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
