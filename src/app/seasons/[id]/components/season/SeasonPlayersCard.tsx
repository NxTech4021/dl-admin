"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Membership} from '@/ZodSchema/season-schema';
import { Button } from '@/components/ui/button';


interface SeasonPlayersCardProps {
  memberships: Membership[];
}

export default function SeasonPlayersCard({ memberships }: SeasonPlayersCardProps) {
  const activePlayers = memberships.filter(m => m.status === 'ACTIVE');
  const waitlistedPlayers = memberships.filter(m => m.status === 'WAITLISTED');

   const PlayerTable = ({ players }: { players: Membership[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.length > 0 ? (
          players.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>{member.createdAt.toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No players found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Players ({memberships.length})</CardTitle>
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