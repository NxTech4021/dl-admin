// app/seasons/[id]/components/SeasonPlayersCard.tsx
// import { SeasonMembership } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SeasonMembership } from '@/MockData/types';
import { Button } from '@/components/ui/button';

// Define the type for a member including the user relation
type MemberWithUser = SeasonMembership & { user: { name: string } };

interface SeasonPlayersCardProps {
  memberships: MemberWithUser[];
}

export default function SeasonPlayersCard({ memberships }: SeasonPlayersCardProps) {
  // Assuming a 'status' field exists on SeasonMembership (or a way to determine waitlist)
  // For this example, let's mock the division based on an index (you'd use a real field)
  const activePlayers = memberships.filter((_, i) => i % 3 !== 0); // Mock active
  const waitlistedPlayers = memberships.filter((_, i) => i % 3 === 0); // Mock waitlisted

  const PlayerTable = ({ players }: { players: MemberWithUser[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player Name</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.length > 0 ? (
          players.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.user.name}</TableCell>
              <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{/* Add a badge for their status (Paid/Pending) */}</TableCell>
              <TableCell className="text-right">
                <Button variant="link" size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
              No players in this list.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Players ({memberships.length} Total)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Players ({activePlayers.length})</TabsTrigger>
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
  );
}