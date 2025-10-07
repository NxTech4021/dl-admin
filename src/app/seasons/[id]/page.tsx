// app/seasons/[id]/page.tsx
import { notFound } from 'next/navigation';
// import { getSeasonDetails, FullSeason } from '@/utils/data'; // Adjust path
import { getSeasonDetails } from '@/MockData/season-mock';
import { FullSeason } from '@/MockData/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SeasonInfoCard from './components/season/SeasonInfoCard';
// import SeasonSettingsCard from './components/SeasonSettingsCard';
// import SeasonPlayersCard from './components/SeasonPlayersCard';
// import WithdrawalRequestsCard from './components/WithdrawalRequestsCard';

interface SeasonDetailPageProps {
  params: { id: string };
}

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  const season = await getSeasonDetails(params.id);

  if (!season) {
    notFound();
  }

  return (
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
          {/* <SeasonPlayersCard memberships={season.memberships} /> */}
        </div>
        
        {/* Right Column (Spanning 1/3) */}
        <div className="lg:col-span-1 space-y-6">
          {/* <SeasonSettingsCard season={season} />
          <WithdrawalRequestsCard requests={season.withdrawalRequests} /> */}
        </div>
      </div>
      
      {/* Fifth Card (Optional: Promo Codes, Waitlist, or a separate full-width section) */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Season Info / Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Example: A list of related Promo Codes or Waitlist management */}
          <p>This is the placeholder for your fifth card content.</p>
        </CardContent>
      </Card>
    </div>
  );
}