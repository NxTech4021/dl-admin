"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NavDocuments } from "@/components/nav-documents";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession();

  // If still loading session, show a skeleton or loading state
  if (isPending) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex h-12 items-center px-4">
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="h-16 bg-gray-200 animate-pulse rounded" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  // If no session, show basic sidebar without user info
  if (!session) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex h-12 items-center px-4">
            <h2 className="text-lg font-semibold">DeuceLeague</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Please sign in to continue</p>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }

  // Main navigation data - you can customize this based on your needs
  const navData = {
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: "🏠",
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/",
          },
          {
            title: "Analytics",
            url: "/analytics",
          },
        ],
      },
      {
        title: "Users",
        url: "/users",
        icon: "👥",
        items: [
          {
            title: "All Users",
            url: "/users",
          },
          {
            title: "User Roles",
            url: "/users/roles",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: "⚙️",
        items: [
          {
            title: "General",
            url: "/settings",
          },
          {
            title: "Security",
            url: "/settings/security",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "/support",
        icon: "💬",
      },
      {
        title: "Feedback",
        url: "/feedback",
        icon: "📝",
      },
    ],
    documents: [
      {
        name: "Introduction",
        url: "/docs/introduction",
        emoji: "📖",
      },
      {
        name: "Get Started",
        url: "/docs/get-started",
        emoji: "🚀",
      },
      {
        name: "API Reference",
        url: "/docs/api",
        emoji: "📚",
      },
    ],
  };

  // Transform session user data to match NavUser expected format
  const userData = {
    name: session.user.name || "Unknown User",
    email: session.user.email || "No email",
    avatar: session.user.image || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center px-4">
          <h2 className="text-lg font-semibold">DeuceLeague</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavDocuments documents={navData.documents} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
