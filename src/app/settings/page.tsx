"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconSettings, IconClock, IconBug } from "@tabler/icons-react";
import { InactivitySettingsCard } from "@/components/settings/inactivity-settings-card";
import { BugReportSettingsCard } from "@/components/settings/bug-report-settings-card";

export default function SettingsPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <IconSettings className="size-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">
                          Settings
                        </h1>
                      </div>
                      <p className="text-muted-foreground">
                        Configure system-wide settings and preferences
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 px-4 lg:px-6 pb-6">
                <div className="grid gap-6">
                  {/* Inactivity Settings Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <IconClock className="size-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">Player Inactivity</h2>
                    </div>
                    <InactivitySettingsCard />
                  </section>

                  {/* Bug Report Settings Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <IconBug className="size-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">Bug Reports</h2>
                    </div>
                    <BugReportSettingsCard />
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
