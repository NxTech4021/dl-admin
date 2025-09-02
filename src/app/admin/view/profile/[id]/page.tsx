"use client"

import { useParams } from "next/navigation"
import { IconChevronLeft } from "@tabler/icons-react"
import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { AdminProfile } from "@/components/admin-profile"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AdminProfilePage() {
  const params = useParams()
  const adminId = params.id as string

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
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container p-6">
            <div className="mb-6">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin">
                  <IconChevronLeft className="mr-2 size-4" />
                  Back
                </Link>
              </Button>
            </div>
            
              <AdminProfile adminId={adminId}/>


          </div>
        </main>
      </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
