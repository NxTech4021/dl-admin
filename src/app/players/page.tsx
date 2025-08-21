import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Players",
  description: "DeuceLeague Players Management",
  icons: {
    icon: "/dl-logo.svg",
    shortcut: "/dl-logo.svg",
    apple: "/dl-logo.svg",
  },
};

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col items-center justify-center min-h-[400px] py-4 md:py-6">
              <h1 className="text-2xl font-semibold text-muted-foreground">Work in progress...</h1>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
