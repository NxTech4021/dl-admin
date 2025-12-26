import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ICON_SIZES, TYPOGRAPHY } from "@/lib/constants/ui";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  variant?: "default" | "prominent";
}

interface NavMainProps {
  items: NavMainItem[];
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Helper to check if a route is active (supports nested routes)
  const isRouteActive = (url: string) => {
    if (pathname === url) return true;
    if (url !== "/" && pathname.startsWith(url + "/")) return true;
    return false;
  };

  return (
    <SidebarGroup className="px-3 py-3">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = isRouteActive(item.url);
            const isProminent = item.variant === "prominent";

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  size={isProminent ? "lg" : "default"}
                  className={cn(
                    "relative",
                    isProminent && "font-semibold hover:bg-primary/20",
                    isProminent && isActive && "bg-primary/10",
                    isActive && !isProminent && "border-l-4 border-primary pl-[calc(0.75rem-4px)]"
                  )}
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    {item.icon && (
                      <item.icon
                        className={cn(
                          isProminent ? ICON_SIZES.header : ICON_SIZES.nav
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <span className={isActive || isProminent ? TYPOGRAPHY.menuItemActive : TYPOGRAPHY.menuItem}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
