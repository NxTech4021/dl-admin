"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Membership } from '@/ZodSchema/season-schema';
import { Division } from '@/ZodSchema/division-schema';
import { IconUser, IconStar, IconCalendar, IconTarget, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import AssignDivisionModal from '@/components/modal/assign-playerToDivision';

interface SeasonPlayersCardProps {
  memberships: Membership[];
  divisions: Division[]; // Now using the Division type from parent
  sportType?: string | null;
  seasonId: string;
  onMembershipUpdated?: () => Promise<void>;
  adminId?: string;
  season?: {
    leagues?: Array<{
      id: string;
      name: string;
      sportType?: string;
      gameType?: string;
    }>;
    categories?: Array<{
      id: string;
      name: string | null;
      genderRestriction?: string;
      matchFormat?: string | null;
    }>;
  };
}

export default function SeasonPlayersCard({ 
  memberships, 
  divisions = [], 
  sportType, 
  seasonId,
  onMembershipUpdated,
  adminId,
  season
}: SeasonPlayersCardProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const activePlayers = memberships.filter(m => m.status === 'ACTIVE' || m.status === 'PENDING');
  const waitlistedPlayers = memberships.filter(m => m.status === 'INACTIVE' || m.status === 'FLAGGED' || m.status === 'REMOVED');


  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return 'Unassigned';
    const division = divisions.find(d => d.id === divisionId);
    return division ? division.name : 'Unassigned';
  };

  console.log(" admin in Player card", adminId)
  const getSportRating = (member: Membership) => {
    // Determine sport from season leagues
    const sport = season?.leagues?.[0]?.sportType?.toLowerCase();
    if (!sport) {
      return { display: 'N/A' };
    }

    // Determine category (singles/doubles) from league gameType
    const gameType = season?.leagues?.[0]?.gameType;
    const isDoubles = gameType === 'DOUBLES';

    // Find player's questionnaire response for this sport
    const questionnaireResponse = member.user?.questionnaireResponses?.find(
      response => response.sport.toLowerCase() === sport && response.completedAt
    );

    if (!questionnaireResponse?.result) {
      return { display: 'N/A' };
    }

    // Get the appropriate rating based on category
    const rating = isDoubles 
      ? questionnaireResponse.result.doubles 
      : questionnaireResponse.result.singles;

    if (!rating) {
      return { display: 'N/A' };
    }

    // Return formatted rating (already stored as integer, no need to divide by 1000)
    return { display: rating.toString() };
  };

  const handleAssignToDivision = (member: Membership) => {
    setSelectedMember(member);
    setIsAssignModalOpen(true);
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
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{member.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">
                        @{member.user?.email?.split('@')[0] || 'unknown'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {getDivisionName(member.divisionId ?? null)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={rating.display !== 'N/A' ? 'default' : 'outline'}
                      className={`text-xs font-mono ${rating.display !== 'N/A' ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
                    >
                      {rating.display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'} className="capitalize text-xs">
                      {member?.status?.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3 text-xs"
                      onClick={() => handleAssignToDivision(member)}
                    >
                      {member.divisionId ? 'Reassign Division' : 'Assign to Division'}
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Season Players ({memberships.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active ({activePlayers.length})</TabsTrigger>
              <TabsTrigger value="waitlisted">Waitlist ({waitlistedPlayers.length})</TabsTrigger>
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

     <AssignDivisionModal
        isOpen={isAssignModalOpen}  
        onOpenChange={setIsAssignModalOpen}
        member={selectedMember}
        divisions={divisions}
        seasonId={seasonId}
        onAssigned={onMembershipUpdated}
        adminId={adminId || ''}
      />
    </>
  );
}
