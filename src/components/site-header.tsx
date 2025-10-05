"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageMap = {
  "/dashboard": "Dashboard",
  "/players": "Players",
  "/league": "League",
  "/seasons": "Seasons",
  "/divisions": "Divisions",
  "/settings": "Settings",
} as const;

type BreadcrumbItem = { label: string; href?: string };

export function SiteHeader({ title, items }: { title?: string; items?: BreadcrumbItem[] }) {
  const pathname = usePathname();
  const pageTitle = title || pageMap[pathname as keyof typeof pageMap] || "Dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
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
                <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link href={item.href} className="text-base font-medium text-foreground hover:underline">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-base font-medium text-foreground">{item.label}</span>
                  )}
                  {!isLast && (
                    <span aria-hidden className="text-muted-foreground">›</span>
                  )}
                </div>
              );
            })}
          </nav>
        ) : (
          <h1 className="text-base font-medium text-foreground">{pageTitle}</h1>
        )}
        <div className="ml-auto flex items-center gap-2"></div>
      </div>
    </header>
  );
}
