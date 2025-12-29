import * as React from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ICON_SIZES, TYPOGRAPHY } from "@/lib/constants/ui";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Badge {
  count?: number;
  dot?: boolean;
  variant?: "default" | "warning" | "destructive";
}

interface NavSectionItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: Badge;
}

interface NavSectionProps {
  label: string;
  items: NavSectionItem[];
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function NavSection({
  label,
  items,
  className,
  collapsible = true,
  defaultOpen = true,
}: NavSectionProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const sectionKey = `sidebar-section-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Load collapsed state from localStorage
  const [isOpen, setIsOpen] = React.useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    const stored = localStorage.getItem(sectionKey);
    return stored ? JSON.parse(stored) : defaultOpen;
  });

  // Save collapsed state to localStorage
  React.useEffect(() => {
    localStorage.setItem(sectionKey, JSON.stringify(isOpen));
  }, [isOpen, sectionKey]);

  // Helper to check if a route is active (supports nested routes)
  const isRouteActive = (url: string) => {
    // Exact match for root paths like /dashboard
    if (pathname === url) return true;
    // For nested routes, check if pathname starts with the url
    // but only if it's followed by / or end of string (to avoid /admin matching /admin-logs)
    if (url !== "/" && pathname.startsWith(url + "/")) return true;
    return false;
  };

  // Check if any item in this section is active
  const hasActiveItem = items.some((item) => isRouteActive(item.url));

  // Auto-expand section when navigating to a page within it (only on route change)
  const prevPathname = React.useRef(pathname);
  React.useEffect(() => {
    // Only auto-expand if the pathname changed (navigation occurred)
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (hasActiveItem && !isOpen) {
        setIsOpen(true);
      }
    }
  }, [pathname, hasActiveItem, isOpen]);

  const content = (
    <SidebarMenu role="list">
      {items.map((item) => {
        const isActive = isRouteActive(item.url);
        return (
          <SidebarMenuItem key={item.title} role="listitem">
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              className={cn(
                "relative transition-all duration-200 hover:bg-sidebar-accent",
                isActive && "border-l-4 border-primary pl-[calc(0.75rem-4px)]"
              )}
            >
              <Link
                to={item.url}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <item.icon className={ICON_SIZES.nav} aria-hidden="true" />
                  <span
                    className={
                      isActive
                        ? TYPOGRAPHY.menuItemActive
                        : TYPOGRAPHY.menuItem
                    }
                  >
                    {item.title}
                  </span>
                </div>

                {item.badge && (
                  <>
                    {item.badge.count !== undefined ? (
                      <SidebarMenuBadge
                        className={cn(
                          "ml-auto animate-in fade-in-0 zoom-in-95 duration-200",
                          item.badge.variant === "destructive" &&
                            "bg-destructive text-white",
                          item.badge.variant === "warning" &&
                            "bg-orange-500 text-white animate-pulse"
                        )}
                        role="status"
                        aria-label={`${item.badge.count} unread notifications`}
                      >
                        {item.badge.count}
                      </SidebarMenuBadge>
                    ) : item.badge.dot ? (
                      <span
                        className="ml-auto size-2 rounded-full bg-primary animate-pulse"
                        role="status"
                        aria-label="New activity"
                      />
                    ) : null}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  if (!collapsible) {
    return (
      <SidebarGroup
        className={cn("px-3 py-2", className)}
        aria-labelledby={`nav-section-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <SidebarGroupLabel
          id={`nav-section-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className={cn(TYPOGRAPHY.sectionLabel, "text-muted-foreground px-3")}
        >
          {label}
        </SidebarGroupLabel>
        {content}
      </SidebarGroup>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <SidebarGroup className="px-3 py-2">
        <SidebarGroupLabel
          asChild
          className={cn(
            TYPOGRAPHY.sectionLabel,
            "text-muted-foreground px-3 hover:bg-sidebar-accent cursor-pointer rounded-md transition-colors group"
          )}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <span
              id={`nav-section-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {label}
            </span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-90"
              )}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent className="overflow-hidden transition-all duration-200 ease-out data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
          {content}
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
