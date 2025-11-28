"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  Grid3x3,
  Swords,
  CreditCard,
  MessageSquare,
  MessageCircle,
  Shield,
  Bug,
  Tags,
  Settings,
  Handshake,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavSection } from "@/components/nav-section";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return redirect("/login");

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        variant: "prominent" as const,
      },
    ],
    sections: [
      {
        label: "League Management",
        items: [
          {
            title: "Leagues",
            url: "/league",
            icon: Trophy,
          },
          {
            title: "Seasons",
            url: "/seasons",
            icon: Calendar,
          },
          {
            title: "Divisions",
            url: "/divisions",
            icon: Grid3x3,
          },
          {
            title: "Matches",
            url: "/matches",
            icon: Swords,
          },
        ],
      },
      {
        label: "User Management",
        items: [
          {
            title: "Players",
            url: "/players",
            icon: Users,
          },
          {
            title: "Admins",
            url: "/admin",
            icon: Shield,
          },
          {
            title: "Feedback",
            url: "/feedback",
            icon: MessageSquare,
            badge: {
              count: 3,
              variant: "warning" as const,
            },
          },
        ],
      },
      {
        label: "Financial",
        items: [
          {
            title: "Payments",
            url: "/payments",
            icon: CreditCard,
          },
          {
            title: "Sponsors",
            url: "/utilities/sponsors",
            icon: Handshake,
          },
        ],
      },
      {
        label: "Communication",
        items: [
          {
            title: "Chats",
            url: "/chat",
            icon: MessageCircle,
            badge: {
              dot: true,
            },
          },
          {
            title: "Bug Reports",
            url: "/bugs",
            icon: Bug,
          },
        ],
      },
    ],
    systemSection: {
      label: "System",
      items: [
        {
          title: "Categories",
          url: "/utilities/categories",
          icon: Tags,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href="/dashboard">
                <Image
                  src="/dl-logo.svg"
                  alt="DeuceLeague Logo"
                  width={20}
                  height={20}
                  className="!size-5"
                />
                <span className="text-base font-semibold">DeuceLeague</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} />
        {data.sections.map((section) => (
          <NavSection
            key={section.label}
            label={section.label}
            items={section.items}
          />
        ))}
        <NavSection
          label={data.systemSection.label}
          items={data.systemSection.items}
          className="mt-auto border-t pt-4"
        />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
