"use client";
import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconBuilding, IconPlus, IconDownload } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import axiosInstance, { endpoints } from "@/lib/endpoints";

// Dynamic imports for better performance
const SponsorsDataTable = dynamic(() => import("@/components/data-table/sponsors-data-table").then(mod => ({ default: mod.SponsorsDataTable })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
});

const SponsorCreateModal = dynamic(() => import("@/components/modal/sponsorship-create-modal").then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
});

// Sponsor interface
interface Sponsor {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export default function SponsorsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = React.useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch sponsors from API
  const fetchSponsors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(endpoints.sponsors.getAll);
      const api = res?.data;
      const sponsorships = (api?.data?.sponsorships || api?.data || api || []) as any[];
      
      // Debug: Log the raw data structure
      console.log("Raw sponsorships data:", sponsorships);

      // Map sponsorships (backend) -> Sponsor rows (table expects)
      const mapped: Sponsor[] = sponsorships.map((s: any) => {
        console.log("Mapping sponsorship:", s);
        console.log("Available fields:", Object.keys(s));
        console.log("Company name:", s.company?.name);
        console.log("Company name field:", s.companyName);
        console.log("Sponsored name:", s.sponsoredName);
        return {
          id: s.id,
          name: s.sponsoredName || "Unnamed Sponsor",
          packageTier: s.packageTier || undefined,
          contractAmount: s.contractAmount || undefined,
          website: s.company?.website || undefined,
          logo: s.company?.logo || undefined,
          contactEmail: s.company?.contactEmail || undefined,
          contactPhone: s.company?.contactPhone || undefined,
          status: "ACTIVE", // Default status since backend doesn't support it
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
        };
      });

      console.log("Final mapped data:", mapped);
      setData(mapped);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    handleRefresh();
  };

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
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <IconBuilding className="size-8 text-primary" />
                        <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
                      </div>
                      <p className="text-muted-foreground">Manage league sponsors and partnerships</p>
                    </div>
                    <div className="flex items-center gap-2" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 lg:px-6 py-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
                <IconBuilding className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.length}</div>
                <p className="text-xs text-muted-foreground">
                  All registered sponsors
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sponsors</CardTitle>
                <IconBuilding className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.filter(s => s.status === 'ACTIVE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Sponsors</CardTitle>
                <IconBuilding className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.filter(s => s.status === 'INACTIVE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Not currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <IconBuilding className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.filter(s => {
                    const createdDate = new Date(s.createdAt);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  New sponsors added
                </p>
              </CardContent>
            </Card>
                </div>

                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Sponsors</CardTitle>
                    <CardDescription>
                      Manage and view all registered sponsors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SponsorsDataTable 
                      data={data} 
                      isLoading={isLoading}
                      onRefresh={handleRefresh}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
