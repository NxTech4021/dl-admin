import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  IconCalendar, 
  IconTrophy, 
  IconUsers, 
  IconMapPin, 
  IconExternalLink,
  IconTrendingUp,
  IconClock,
  IconTarget,
  IconCheck,
  IconX
} from '@tabler/icons-react';

interface SeasonHistoryData {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  membership: {
    joinedAt: string;
    status: string;
    division?: {
      id: string;
      name: string;
      gameType: string;
      genderCategory: string;
      level: string;
    };
  };
  categories?: Array<{
    id: string;
    name: string;
    game_type: string;
    gender_category: string;
    leagues: Array<{
      id: string;
      name: string;
      sportType: string;
      location: string;
    }>;
  }>;
}

interface SeasonHistoryCardProps {
  season: SeasonHistoryData;
}

const SeasonHistoryCard: React.FC<SeasonHistoryCardProps> = ({ season }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'UPCOMING':
        return 'secondary';
      case 'FINISHED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'UPCOMING':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'FINISHED':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getMembershipStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <IconCheck className="size-4 text-green-600" />;
      case 'PENDING':
        return <IconClock className="size-4 text-yellow-600" />;
      case 'INACTIVE':
        return <IconX className="size-4 text-red-600" />;
      default:
        return <IconClock className="size-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return 'Dates TBD';
    if (!startDate) return `Until ${formatDate(endDate)}`;
    if (!endDate) return `From ${formatDate(startDate)}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const formatSportType = (sportType: string) => {
    return sportType.charAt(0).toUpperCase() + sportType.slice(1).toLowerCase();
  };

  const getLeagueInfo = () => {
    if (!season.categories || season.categories.length === 0) {
      return { name: 'No league information', sportType: '', location: '', id: '' };
    }
    
    const firstCategory = season.categories[0];
    if (!firstCategory.leagues || firstCategory.leagues.length === 0) {
      return { name: 'No league information', sportType: '', location: '', id: '' };
    }
    
    const firstLeague = firstCategory.leagues[0];
    return {
      name: firstLeague.name,
      sportType: formatSportType(firstLeague.sportType),
      location: firstLeague.location,
      id: firstLeague.id
    };
  };

  const leagueInfo = getLeagueInfo();

  return (
    <div className="group border-l-2 border-l-primary/20 hover:border-l-primary transition-colors">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Season Icon */}
            <div className="flex-shrink-0">
              <div className="p-1.5 bg-primary/5 rounded-md">
                <IconCalendar className="size-3.5 text-primary" />
              </div>
            </div>

            {/* Season Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">
                  <Link 
                    href={`/seasons/${season.id}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {season.name}
                  </Link>
                </h3>
                <Badge 
                  variant={getStatusVariant(season.status)}
                  className={`${getStatusColor(season.status)} text-xs h-4 px-1.5`}
                >
                  {season.status}
                </Badge>
              </div>

              {/* League and Division Info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {leagueInfo.id ? (
                  <>
                    <Link 
                      href={`/league/view/${leagueInfo.id}`} 
                      className="hover:text-primary transition-colors truncate"
                    >
                      {leagueInfo.name}
                    </Link>
                    <span>•</span>
                    <span className="text-xs">{leagueInfo.sportType}</span>
                    {leagueInfo.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <IconMapPin className="size-2.5" />
                          <span className="truncate">{leagueInfo.location}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <span>No league information</span>
                )}
              </div>

              {/* Division and Stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {season.membership.division && (
                  <>
                    {season.membership.division.id ? (
                      <Link 
                        href={`/league/divisions/${season.membership.division.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {season.membership.division.name}
                      </Link>
                    ) : (
                      <span>{season.membership.division.name}</span>
                    )}
                    <span>•</span>
                    <span>{season.membership.division.gameType}</span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDateRange(season.startDate, season.endDate)}</span>
                <span>•</span>
                <div className="flex items-center gap-0.5">
                  {getMembershipStatusIcon(season.membership.status)}
                  <span>{season.membership.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SeasonHistoryProps {
  seasons: SeasonHistoryData[] | null;
  isLoading: boolean;
}

const SeasonHistory: React.FC<SeasonHistoryProps> = ({ seasons, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconCalendar className="size-4" />
            Season History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-2 border-l-muted p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!seasons || seasons.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconCalendar className="size-4" />
            Season History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <IconCalendar className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No season history yet</h3>
            <p className="text-sm text-muted-foreground">
              Season participation history will appear here once the player joins seasons.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group seasons by status for better organization
  const activeSeasons = seasons.filter(s => s.status === 'ACTIVE');
  const upcomingSeasons = seasons.filter(s => s.status === 'UPCOMING');
  const finishedSeasons = seasons.filter(s => s.status === 'FINISHED');
  const otherSeasons = seasons.filter(s => !['ACTIVE', 'UPCOMING', 'FINISHED'].includes(s.status));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconCalendar className="size-4" />
            Season History
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {seasons.length} season{seasons.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {seasons.map((season, index) => (
            <React.Fragment key={season.id}>
              <SeasonHistoryCard season={season} />
              {index < seasons.length - 1 && <Separator className="my-0" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonHistory;
