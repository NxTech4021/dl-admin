"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Membership} from '@/ZodSchema/season-schema';
import { Button } from '@/components/ui/button';
import { IconUser, IconStar, IconCalendar, IconTarget } from '@tabler/icons-react';


interface SeasonPlayersCardProps {
  memberships: Membership[];
  sportType?: string | null;
}

export default function SeasonPlayersCard({ memberships, sportType }: SeasonPlayersCardProps) {
  // Add mock data for demonstration
  const mockMemberships: Membership[] = [
    {
      id: 'mock-1',
      userId: 'user-1',
      seasonId: 'season-1',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-15'),
      user: {
        name: 'John Smith',
        email: 'john.smith@example.com',
      }
    },
    ...memberships
  ];

  const activePlayers = mockMemberships.filter(m => m.status === 'ACTIVE');
  const waitlistedPlayers = mockMemberships.filter(m => m.status === 'WAITLISTED');

  // Helper function to get sport-specific rating display
  const getSportRating = (member: Membership) => {
    // Mock rating data for demonstration - using 1000+ scale
    if (member.id === 'mock-1') {
      return {
        display: '1420'
      };
    }
    
    // For real data, we'll show a placeholder since ratings aren't in the current schema
    // This would be enhanced when the API provides rating data
    return {
      display: 'N/A'
    };
  };

   const PlayerTable = ({ players }: { players: Membership[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <IconUser className="size-4" />
                Player
              </div>
            </TableHead>
            <TableHead className="w-[180px]">
              <div className="flex items-center gap-2">
                <IconTarget className="size-4" />
                Division
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-2">
                <IconStar className="size-4" />
                Rating
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4" />
                Join Date
              </div>
            </TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length > 0 ? (
            players.map((member) => {
              const rating = getSportRating(member);
              return (
                <TableRow key={member.id} className="hover:bg-muted/50">
                  {/* Player name and username */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{member.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        @{member.user.email.split('@')[0]}
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Division assignment status */}
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        Unassigned
                      </Badge>
                    </div>
                  </TableCell>
                  
                  {/* Sport-specific skill rating */}
                  <TableCell>
                    <Badge 
                      variant={rating.display !== 'N/A' ? 'default' : 'outline'}
                      className={`text-xs font-mono ${
                        rating.display !== 'N/A' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : ''
                      }`}
                    >
                      {rating.display}
                    </Badge>
                  </TableCell>
                  
                  {/* When player joined the season */}
                  <TableCell>
                    <div className="text-sm">
                      {member.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  
                  {/* Active/Waitlist membership status */}
                  <TableCell>
                    <Badge 
                      variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="capitalize text-xs"
                    >
                      {member.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  
                  {/* Division assignment action button */}
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      Assign to Division
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <IconUser className="size-12 opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No players found</p>
                    <p className="text-xs">Players will appear here once they join the season</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Players ({mockMemberships.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activePlayers.length})
            </TabsTrigger>
            <TabsTrigger value="waitlisted">
              Waitlist ({waitlistedPlayers.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <PlayerTable players={activePlayers} />
          </TabsContent>
          <TabsContent value="waitlisted">
            <PlayerTable players={waitlistedPlayers} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}