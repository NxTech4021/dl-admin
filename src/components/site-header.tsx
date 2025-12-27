import React, { useState } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconBell } from "@tabler/icons-react";
import NotificationBell from "@/components/notification/notification-bell";
import NotificationsSidebar from "@/components/notification/notification-sidebar";

const pageMap = {
  "/dashboard": "Dashboard",
  "/players": "Players",
  "/league": "League",
  "/seasons": "Seasons",
  "/divisions": "Divisions",
  "/settings": "Settings",
  "/bugs": "Bug Reports",
  "/chat": "Chat",
} as const;

type BreadcrumbItem = { label: string; href?: string };

export function SiteHeader({
  title,
  items,
}: {
  title?: string;
  items?: BreadcrumbItem[];
}) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const pageTitle =
    title || pageMap[pathname as keyof typeof pageMap] || "Dashboard";

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center justify-between border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />

          {items && items.length > 0 ? (
            <nav aria-label="breadcrumb" className="flex items-center gap-2">
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-2"
                  >
                    {item.href && !isLast ? (
                      <Link
                        to={item.href}
                        className="text-base font-medium text-foreground hover:underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-base font-medium text-foreground">
                        {item.label}
                      </span>
                    )}
                    {!isLast && (
                      <span aria-hidden className="text-muted-foreground">
                        ›
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          ) : (
            <h1 className="text-base font-medium text-foreground">{pageTitle}</h1>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 px-4 lg:px-6">
          <NotificationBell
            onClick={() => setNotificationOpen(true)}
            isOpen={notificationOpen}
            className="mr-1"
          />
        </div>
      </header>

      {/* Notification sidebar */}
      <NotificationsSidebar
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
      />
    </>
  );
}
