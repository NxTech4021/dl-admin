'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Season } from '@/ZodSchema/season-schema';
import { 
  IconUsers, 
  IconTrophy, 
  IconCalendar, 
  IconTrendingUp,
} from '@tabler/icons-react';

interface SeasonOverviewStatsProps {
  season: Season;
}

export default function SeasonOverviewStats({ season }: SeasonOverviewStatsProps) {
  // Calculate player statistics
  const totalRegisteredUsers = season.registeredUserCount || 0;
  const activePlayers = season.memberships.filter(m => m.status === 'ACTIVE').length;
  const waitlistedPlayers = season.memberships.filter(m => m.status === 'WAITLISTED').length;
  const pendingPlayers = season.memberships.filter(m => m.status === 'PENDING').length;

  // Calculate division statistics
  const totalDivisions = season.divisions.length;

  // Calculate withdrawal requests
  const pendingWithdrawals = season.withdrawalRequests.filter(r => r.status === 'PENDING').length;

  // Calculate revenue
  const calculateRevenue = () => {
    if (!season.entryFee || season.registeredUserCount === 0) return 'RM 0.00';
    const totalRevenue = parseFloat(season.entryFee) * season.registeredUserCount;
    return `RM ${totalRevenue.toFixed(2)}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Players Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          <IconUsers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
         <div className="text-2xl font-bold">{totalRegisteredUsers}</div>
          <p className="text-xs text-muted-foreground">
            {activePlayers} active, {waitlistedPlayers} waitlisted
          </p>
        </CardContent>
      </Card>

      {/* Divisions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Divisions</CardTitle>
          <IconTrophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDivisions}</div>
          <p className="text-xs text-muted-foreground">
            {totalDivisions === 0 ? 'No divisions created' : 'Active divisions'}
          </p>
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calculateRevenue()}</div>
          <p className="text-xs text-muted-foreground">
            {season.registeredUserCount > 0 ? `${season.registeredUserCount} players × RM ${season.entryFee || '0'}` : 'No revenue yet'}
          </p>
        </CardContent>
      </Card>

      {/* Withdrawal Requests Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingWithdrawals}</div>
          <p className="text-xs text-muted-foreground">
            {pendingWithdrawals === 0 ? 'No pending requests' : 'Pending requests'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
