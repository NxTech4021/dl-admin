"use client"

import * as React from "react"
import {
  IconDashboard,
  IconHelp,
  IconUsers,
  IconSearch,
  IconSettings,
  IconTrophy,
  IconCalendar,
  IconCategory,
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAdminSession } from "@/hooks/use-admin-session"

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
      name: "Admins",
      url: "dashboard/admin",
      icon: IconUsers,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAdminSession();
  const router = useRouter();

  // Redirect to login if not authenticated and not loading
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state or return null while checking authentication
  if (loading || !user) {
    return null;
  }

  const userData = {
    name: user.name,
    email: user.email,
    avatar: "/avatars/deuceleague.jpg", // default avatar
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}