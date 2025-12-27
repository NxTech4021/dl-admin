import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  Grid3x3,
  Swords,
  CreditCard,
  MessageCircle,
  Shield,
  Bug,
  Tags,
  Settings,
  Handshake,
  Search,
  AlertTriangle,
  ArrowLeftRight,
  History,
  BarChart3,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useNotifications } from "@/hooks/use-notifications";
import { useOpenDisputeCount, usePendingTeamChangeRequestsCount } from "@/hooks/use-queries";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const { unreadCount, notifications } = useNotifications();
  const { data: openDisputeCount = 0 } = useOpenDisputeCount();
  const { data: pendingTeamChangeCount = 0 } = usePendingTeamChangeRequestsCount();

  // Detect platform for keyboard shortcut display
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Calculate unread chat messages (filter by CHAT category)
  const unreadChatCount = React.useMemo(() => {
    return notifications.filter((n) => n.category === "CHAT" && !n.read).length;
  }, [notifications]);

  // Redirect to login if no session
  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/login" });
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader className="border-b p-4">
          <Skeleton className="h-8 w-32" />
        </SidebarHeader>
        <SidebarContent className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </SidebarContent>
      </Sidebar>
    );
  }

  if (!session) return null;

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
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
          {
            title: "Disputes",
            url: "/disputes",
            icon: AlertTriangle,
            badge: openDisputeCount > 0 ? {
              count: openDisputeCount,
              variant: "destructive" as const,
            } : undefined,
          },
          {
            title: "Team Changes",
            url: "/team-change-requests",
            icon: ArrowLeftRight,
            badge: pendingTeamChangeCount > 0 ? {
              count: pendingTeamChangeCount,
              variant: "destructive" as const,
            } : undefined,
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
            badge: unreadChatCount > 0 ? {
              count: unreadChatCount,
              variant: "default" as const,
            } : undefined,
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
          title: "Reports",
          url: "/reports",
          icon: BarChart3,
        },
        {
          title: "Admin Logs",
          url: "/admin-logs",
          icon: History,
        },
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
              <Link to="/dashboard">
                <img
                  src="/dl-logo.svg"
                  alt="DeuceLeague Logo"
                  width={20}
                  height={20}
                  className="!size-5"
                />
                <span className="text-base font-semibold">DeuceLeague</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  bubbles: true
                });
                document.dispatchEvent(event);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <Search className="size-4" />
              <span>Search...</span>
              <kbd className="ml-auto hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
              </kbd>
            </button>
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
          collapsible={false}
        />
      </SidebarContent>

      <SidebarFooter className="border-t">
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
