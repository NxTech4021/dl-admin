"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
}

export function NavSection({ label, items, className }: NavSectionProps) {
  const pathname = usePathname();

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
      <SidebarMenu role="list">
        {items.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.title} role="listitem">
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={cn(
                  "relative",
                  isActive && "border-l-4 border-primary pl-[calc(0.75rem-4px)]"
                )}
              >
                <Link
                  href={item.url}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={ICON_SIZES.nav} aria-hidden="true" />
                    <span className={isActive ? TYPOGRAPHY.menuItemActive : TYPOGRAPHY.menuItem}>
                      {item.title}
                    </span>
                  </div>

                  {item.badge && (
                    <>
                      {item.badge.count !== undefined ? (
                        <SidebarMenuBadge
                          className={cn(
                            "ml-auto",
                            item.badge.variant === "destructive" &&
                              "bg-destructive text-destructive-foreground",
                            item.badge.variant === "warning" &&
                              "bg-orange-500 text-white"
                          )}
                          role="status"
                          aria-label={`${item.badge.count} unread notifications`}
                        >
                          {item.badge.count}
                        </SidebarMenuBadge>
                      ) : item.badge.dot ? (
                        <span
                          className="ml-auto size-2 rounded-full bg-primary"
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
    </SidebarGroup>
  );
}
