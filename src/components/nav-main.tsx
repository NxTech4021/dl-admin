"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <SidebarGroup className="px-3 py-3">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
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
                    isProminent && "bg-primary/10 hover:bg-primary/20 font-semibold",
                    isActive && !isProminent && "border-l-4 border-primary pl-[calc(0.75rem-4px)]"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
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
