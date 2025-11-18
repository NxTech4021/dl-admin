"use client";

import { IconMessage, IconTax } from "@tabler/icons-react";
import { IconMessage2Question } from "@tabler/icons-react";
import * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconTrophy,
  IconCalendar,
  IconCategory,
  IconShield,
  IconBug,
} from "@tabler/icons-react";
import { Settings, Tags, CreditCard } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NavWithSubmenu } from "@/components/nav-with-submenu";
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
    user: {
      name: "Superadmin",
      email: "admin@deuceleague.com",
      avatar: "/avatars/deuceleague.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
    ],
    documents: [
      {
        name: "Players",
        url: "/players",
        icon: IconUsers,
      },
      {
        name: "League",
        url: "/league",
        icon: IconTrophy,
      },
      {
        name: "Seasons",
        url: "/seasons",
        icon: IconCalendar,
      },
      {
        name: "Divisions",
        url: "/divisions",
        icon: IconCategory,
      },
      {
        name: "Payments",
        url: "/payments",
        icon: IconTax,
      },
      {
        name: "Feedback",
        url: "/feedback",
        icon: IconMessage2Question,
        hasNotification: true,
        notificationCount: 3,
      },
      {
        name: "Chats",
        url: "/chat",
        icon: IconMessage,
      },
      {
        name: "Admins",
        url: "/admin",
        icon: IconShield,
      },
      {
        name: "Bug Reports",
        url: "/bugs",
        icon: IconBug,
      },
    ],
    utilities: [
      {
        title: "Configuration",
        icon: Settings,
        items: [
          {
            title: "Categories",
            url: "/utilities/categories",
            icon: Tags,
          },
          {
            title: "Sponsors",
            url: "/utilities/sponsors",
            icon: CreditCard,
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
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

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavWithSubmenu items={data.utilities} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
