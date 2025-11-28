"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Plus,
  Search,
  FileText,
} from "lucide-react";
import { ICON_SIZES } from "@/lib/constants/ui";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  group: string;
}

const navigationItems: NavItem[] = [
  // Overview
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "main"],
    group: "Navigation",
  },

  // League Management
  {
    title: "Leagues",
    url: "/league",
    icon: Trophy,
    keywords: ["league", "competition"],
    group: "League Management",
  },
  {
    title: "Seasons",
    url: "/seasons",
    icon: Calendar,
    keywords: ["season", "period", "schedule"],
    group: "League Management",
  },
  {
    title: "Divisions",
    url: "/divisions",
    icon: Grid3x3,
    keywords: ["division", "category", "tier"],
    group: "League Management",
  },
  {
    title: "Matches",
    url: "/matches",
    icon: Swords,
    keywords: ["match", "game", "fixture"],
    group: "League Management",
  },

  // User Management
  {
    title: "Players",
    url: "/players",
    icon: Users,
    keywords: ["player", "user", "member", "participant"],
    group: "User Management",
  },
  {
    title: "Admins",
    url: "/admin",
    icon: Shield,
    keywords: ["admin", "administrator", "moderator"],
    group: "User Management",
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: MessageSquare,
    keywords: ["feedback", "suggestions", "comments"],
    group: "User Management",
  },

  // Financial
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
    keywords: ["payment", "transaction", "billing", "invoice"],
    group: "Financial",
  },
  {
    title: "Sponsors",
    url: "/utilities/sponsors",
    icon: Handshake,
    keywords: ["sponsor", "partner", "advertiser"],
    group: "Financial",
  },

  // Communication
  {
    title: "Chats",
    url: "/chat",
    icon: MessageCircle,
    keywords: ["chat", "message", "conversation"],
    group: "Communication",
  },
  {
    title: "Bug Reports",
    url: "/bugs",
    icon: Bug,
    keywords: ["bug", "issue", "problem", "error"],
    group: "Communication",
  },

  // System
  {
    title: "Categories",
    url: "/utilities/categories",
    icon: Tags,
    keywords: ["category", "tag", "classification"],
    group: "System",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    keywords: ["setting", "configuration", "preferences"],
    group: "System",
  },
];

interface QuickAction {
  title: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Keyboard shortcut to open
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavigate = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  // Quick actions - these would typically open modals or perform actions
  const quickActions: QuickAction[] = [
    {
      title: "New Season",
      action: () => {
        setOpen(false);
        // TODO: Open create season modal
        console.log("Create season");
      },
      icon: Plus,
      keywords: ["create", "add", "new"],
    },
    {
      title: "Add Player",
      action: () => {
        setOpen(false);
        // TODO: Open add player modal
        console.log("Add player");
      },
      icon: Plus,
      keywords: ["create", "add", "new", "register"],
    },
    {
      title: "Create Match",
      action: () => {
        setOpen(false);
        // TODO: Open create match modal
        console.log("Create match");
      },
      icon: Plus,
      keywords: ["create", "add", "new", "schedule"],
    },
  ];

  // Group navigation items
  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search navigation, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.title}
              onSelect={action.action}
              keywords={action.keywords}
            >
              <action.icon className={ICON_SIZES.nav} />
              <span>{action.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation Items by Group */}
        {Object.entries(groupedItems).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => handleNavigate(item.url)}
                keywords={item.keywords}
              >
                <item.icon className={ICON_SIZES.nav} />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        {/* Keyboard Hints */}
        <CommandGroup heading="Tips">
          <CommandItem disabled>
            <Search className={ICON_SIZES.nav} />
            <span className="text-muted-foreground text-xs">
              Use ⌘K or Ctrl+K to open this menu anytime
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
