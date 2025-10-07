// app/seasons/[id]/page.tsx
import { notFound } from 'next/navigation';
// import { getSeasonDetails, FullSeason } from '@/utils/data'; // Adjust path
import { getSeasonDetails } from '@/MockData/season-mock';
import SeasonInfoCard from './components/season/SeasonInfoCard';
import SeasonSettingsCard from './components/season/SeasonSettingsCard';
import SeasonPlayersCard from './components/season/SeasonPlayersCard';
import WithdrawalRequestsCard from './components/season/WithdrawalRequestsCard';
import { SeasonMetricsCard } from './components/season/SeasonMetrics';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from '@/components/app-sidebar';

interface SeasonDetailPageProps {
  params: { id: string };
}

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  const season = await getSeasonDetails(params.id);

  if (!season) {
    notFound();
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

            <SeasonMetricsCard season={''} />
        
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

  );
}