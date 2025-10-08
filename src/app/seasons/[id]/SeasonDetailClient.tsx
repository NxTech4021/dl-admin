  

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { Season, seasonSchema } from '@/ZodSchema/season-schema';
import axiosInstance, { endpoints } from "@/lib/endpoints";

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import SeasonMetricsCard from './components/season/SeasonMetrics';
import SeasonInfoCard from './components/season/SeasonInfoCard';

import SeasonPlayersCard from './components/season/SeasonPlayersCard';
import WithdrawalRequestsCard from './components/season/WithdrawalRequestsCard';
import SeasonSettingsCard from './components/season/SeasonSettingsCard';



export default function SeasonDetailClient({ seasonId }: { seasonId: string }) {
  const [season, setSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState(true);


     const fetchSeasonData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.season.getById(seasonId));
      const parsedData = seasonSchema.parse(response.data);
      setSeason(parsedData);

      console.log("season id data", response.data)
    } catch (error) {
      console.error("Failed to fetch season details:", error);
      notFound();
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (seasonId) {
      fetchSeasonData();
    }
  }, [seasonId, fetchSeasonData]);

  if (isLoading || !season) {
    return <div className="min-h-screen p-8 text-center text-lg text-gray-500">Loading Season {seasonId}...</div>;
  }

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
        <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{season.name} Details</h1>
            {/* Potentially Add Action Buttons Here */}
        </div>
        
        {/* 2-column layout for main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Spanning 2/3) */}
            <div className="lg:col-span-2 space-y-6">
            <SeasonInfoCard season={season} />
            <SeasonPlayersCard memberships={season.memberships} />
            </div>
            
            {/* Right Column (Spanning 1/3) */}
            <div className="lg:col-span-1 space-y-6">
            <SeasonSettingsCard season={season} />
            <WithdrawalRequestsCard requests={season.withdrawalRequests} />
            </div>
        </div>

             <SeasonMetricsCard season={season} />
        
        {/* Fifth Card (Optional: Promo Codes, Waitlist, or a separate full-width section) */}
        {/* <Card>
            <CardHeader>
            <CardTitle>Season Metrics</CardTitle>
            </CardHeader>
            <CardContent>
            Example: A list of related Promo Codes or Waitlist management 
        
            
            </CardContent>
        </Card> */}
        </div>
    </SidebarInset>
    </SidebarProvider>

    )
}