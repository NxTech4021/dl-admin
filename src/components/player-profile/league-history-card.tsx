import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  IconTrophy, 
  IconUsers, 
  IconCalendar, 
  IconMapPin, 
  IconExternalLink,
  IconTrendingUp,
  IconClock
} from '@tabler/icons-react';

interface LeagueHistoryData {
  id: string;
  name: string;
  sportType: string;
  location: string | null;
  status: string;
  membership: {
    joinedAt: string;
  };
  _count: {
    memberships: number;
    seasons: number;
  };
}

interface LeagueHistoryCardProps {
  league: LeagueHistoryData;
}

const LeagueHistoryCard: React.FC<LeagueHistoryCardProps> = ({ league }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'UPCOMING':
        return 'secondary';
      case 'FINISHED':
        return 'outline';
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
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatSportType = (sportType: string) => {
    return sportType.charAt(0).toUpperCase() + sportType.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="group border-l-2 border-l-primary/20 hover:border-l-primary transition-colors">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* League Icon */}
            <div className="flex-shrink-0">
              <div className="p-1.5 bg-primary/5 rounded-md">
                <IconTrophy className="size-3.5 text-primary" />
              </div>
            </div>

            {/* League Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">
                  <Link 
                    href={`/league/view/${league.id}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {league.name}
                  </Link>
                </h3>
                <Badge 
                  variant={getStatusVariant(league.status)}
                  className={`${getStatusColor(league.status)} text-xs h-4 px-1.5`}
                >
                  {league.status}
                </Badge>
              </div>

              {/* Sport Type and Location */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatSportType(league.sportType)}</span>
                {league.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-0.5">
                      <IconMapPin className="size-2.5" />
                      <span className="truncate">{league.location}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <div className="flex items-center gap-0.5">
                  <IconUsers className="size-2.5" />
                  <span>{league._count.memberships} members</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-0.5">
                  <IconCalendar className="size-2.5" />
                  <span>{league._count.seasons} seasons</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-0.5">
                  <IconClock className="size-2.5" />
                  <span>Joined {formatDate(league.membership.joinedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LeagueHistoryProps {
  leagues: LeagueHistoryData[] | null;
  isLoading: boolean;
}

const LeagueHistory: React.FC<LeagueHistoryProps> = ({ leagues, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconTrophy className="size-4" />
            League History
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

  if (!leagues || leagues.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconTrophy className="size-4" />
            League History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <IconTrophy className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No league history yet</h3>
            <p className="text-sm text-muted-foreground">
              League participation history will appear here once the player joins leagues.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconTrophy className="size-4" />
            League History
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {leagues.length} league{leagues.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {leagues.map((league, index) => (
            <React.Fragment key={league.id}>
              <LeagueHistoryCard league={league} />
              {index < leagues.length - 1 && <Separator className="my-0" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeagueHistory;
