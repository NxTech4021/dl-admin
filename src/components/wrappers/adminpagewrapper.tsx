"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUsers } from "@tabler/icons-react";
import AdminInviteModalWrapper from "@/components/wrappers/adminmodalwrapper";
import { AdminsDataTable, Admin } from "@/components/admin-data-table";
import axios from "axios";



export default function AdminsWrapper() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);


    useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/getadmins`,
          { headers: { "Cache-Control": "no-cache" } }
        )

        setAdmins(res.data?.data?.getAllAdmins ?? [])
      } catch (err) {
        console.error("Failed to fetch admins:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])



  console.log("admins", admins)
  const totalAdmins = admins.length
  const activeAdmins = admins.filter((a) => a.status === "ACTIVE").length
  const pendingAdmins = admins.filter((a) => a.status === "PENDING").length
  const suspendedAdmins = admins.filter((a) => a.status === "SUSPENDED").length

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
            <div className="flex flex-col gap-6">
              {/* Page Header */}
              <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-4 lg:px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Title and Description */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <IconUsers className="size-8 text-primary" />
                          <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <IconDownload className="mr-2 size-4" />
                          Export
                        </Button>
                        <AdminInviteModalWrapper />
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <IconUsers className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{loading ? "-" : totalAdmins}</p>
                          <p className="text-sm text-muted-foreground">Total Admins</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <div className="size-4 rounded-full bg-green-500"></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{loading ? "-" : activeAdmins}</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="rounded-full bg-yellow-500/10 p-2">
                          <div className="size-4 rounded-full bg-yellow-500"></div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{loading ? "-" : pendingAdmins}</p>
                          <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1">
                <AdminsDataTable data={admins} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
