"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Membership } from "@/ZodSchema/season-schema";
import { Division } from "@/ZodSchema/division-schema";
import {
  IconUser,
  IconStar,
  IconCalendar,
  IconTarget,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import AssignDivisionModal from "@/components/modal/assign-playerToDivision";

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
    category?: {
      id: string;
      name: string | null;
      genderRestriction?: string;
      gender_category?: string;
      game_type?: string;
      matchFormat?: string | null;
    } | null;
    partnerships?: Array<{
      id: string;
      captainId: string;
      partnerId: string;
      seasonId: string;
      divisionId?: string | null;
      status: string;
      captain: {
        id: string;
        name: string | null;
        email?: string;
        username?: string;
        displayUsername?: string | null;
        image?: string | null;
      };
      partner: {
        id: string;
        name: string | null;
        email?: string;
        username?: string;
        displayUsername?: string | null;
        image?: string | null;
      };
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
  season,
}: SeasonPlayersCardProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Membership[] | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const activePlayers = memberships.filter(
    (m) => m.status === "ACTIVE" || m.status === "PENDING"
  );
  const waitlistedPlayers = memberships.filter(
    (m) =>
      m.status === "INACTIVE" ||
      m.status === "FLAGGED" ||
      m.status === "REMOVED"
  );

  const getDivisionName = (divisionId: string | null) => {
    if (!divisionId) return "Unassigned";
    const division = divisions.find((d) => d.id === divisionId);
    return division ? division.name : "Unassigned";
  };

  const getGameType = (): "SINGLES" | "DOUBLES" | null => {
    // Check category.game_type first (more specific to season)
    const categoryGameType = season?.category?.game_type;
    if (categoryGameType) {
      const normalized = String(categoryGameType).toUpperCase().trim();
      if (normalized === "DOUBLES") {
        console.log("Game type determined from category:", normalized);
        return "DOUBLES";
      }
      if (normalized === "SINGLES") {
        console.log("Game type determined from category:", normalized);
        return "SINGLES";
      }
    }
    
    // Infer from partnerships - if season has active partnerships, it's likely doubles
    if (season?.partnerships && season.partnerships.length > 0) {
      console.log("Inferring DOUBLES from partnerships:", season.partnerships.length);
      return "DOUBLES";
    }
    
    // Infer from divisions - check if any division has gameType DOUBLES
    if (divisions && divisions.length > 0) {
      const doublesDivision = divisions.find((div: any) => {
        const divGameType = div.gameType || (div as any).game_type;
        if (divGameType) {
          return String(divGameType).toUpperCase().trim() === "DOUBLES";
        }
        return false;
      });
      if (doublesDivision) {
        console.log("Inferring DOUBLES from division:", doublesDivision.name);
        return "DOUBLES";
      }
      
      // Check if any division is singles
      const singlesDivision = divisions.find((div: any) => {
        const divGameType = div.gameType || (div as any).game_type;
        if (divGameType) {
          return String(divGameType).toUpperCase().trim() === "SINGLES";
        }
        return false;
      });
      if (singlesDivision && !doublesDivision) {
        console.log("Inferring SINGLES from division:", singlesDivision.name);
        return "SINGLES";
      }
    }
    
    // If no clear indicator, return null (will show N/A)
    console.warn("Could not determine game type from category, partnerships, or divisions", {
      categoryGameType: season?.category?.game_type,
      hasPartnerships: !!(season?.partnerships && season.partnerships.length > 0),
      divisionsCount: divisions?.length || 0,
    });
    return null;
  };

  const getSportRating = (member: Membership) => {
    // Get sport type from the season's league
    const leagueSportType = season?.leagues?.[0]?.sportType;
    const gameType = getGameType();

    if (!leagueSportType || !gameType) {
      console.warn("Missing sport type or game type:", { leagueSportType, gameType });
      return {
        display: "N/A",
        value: 0,
        color: "gray",
      };
    }

    // Find the questionnaire response for the specific sport
    const questionnaireResponse = member.user?.questionnaireResponses?.find(
      (response) =>
        response.sport &&
        response.sport.toLowerCase() === leagueSportType.toLowerCase() &&
        response.completedAt &&
        response.result
    );

    if (!questionnaireResponse?.result) {
      return {
        display: "N/A",
        value: 0,
        color: "gray",
      };
    }

    // Get the appropriate rating based on game type (singles/doubles)
    const isDoubles = gameType === "DOUBLES";
    
    // Debug logging to verify which rating is being used
    console.log("Rating selection:", {
      userId: member.userId,
      userName: member.user?.name,
      gameType,
      isDoubles,
      categoryGameType: season?.category?.game_type,
      leagueGameType: season?.leagues?.[0]?.gameType,
      singlesRating: questionnaireResponse.result.singles,
      doublesRating: questionnaireResponse.result.doubles,
      selectedRating: isDoubles
        ? questionnaireResponse.result.doubles
        : questionnaireResponse.result.singles,
    });

    // Get the appropriate rating based on game type
    let rating: number | null | undefined;
    
    if (isDoubles) {
      // For doubles seasons, use doubles rating
      rating = questionnaireResponse.result.doubles;
    } else {
      // For singles seasons, use singles rating
      rating = questionnaireResponse.result.singles;
      
      // If singles rating is not available, check if there's a general rating field as fallback
      // This handles cases where the rating might be stored differently
      if (!rating || rating === 0) {
        // Check for a general 'rating' field that might contain the singles rating
        const generalRating = (questionnaireResponse.result as any).rating;
        if (generalRating && generalRating > 0) {
          rating = generalRating;
        }
      }
    }

    if (!rating || rating === 0) {
      // Log warning for debugging
      console.warn("Rating not available:", {
        gameType,
        isDoubles,
        hasSingles: !!questionnaireResponse.result.singles,
        hasDoubles: !!questionnaireResponse.result.doubles,
        singlesValue: questionnaireResponse.result.singles,
        doublesValue: questionnaireResponse.result.doubles,
        generalRating: (questionnaireResponse.result as any).rating,
        userId: member.userId,
        userName: member.user?.name,
      });
      return {
        display: "N/A",
        value: 0,
        color: "gray",
      };
    }

    // Determine color based on rating level (adjust thresholds as needed)
    let color = "green";
    if (rating >= 4500) color = "purple"; // Expert
    else if (rating >= 4000) color = "blue"; // Advanced
    else if (rating >= 3500) color = "green"; // Intermediate
    else if (rating >= 3000) color = "yellow"; // Beginner
    else color = "gray"; // Novice

    return {
      display: rating.toString(),
      value: rating,
      color,
    };
  };

  // Find partnership for a given user ID
  const findPartnership = (userId: string) => {
    return season?.partnerships?.find(
      (p) => p.captainId === userId || p.partnerId === userId
    );
  };

  // Get membership for a user ID
  const getMembershipByUserId = (userId: string) => {
    return memberships.find((m) => m.userId === userId);
  };

  // Group memberships by partnerships
  const groupMembershipsByPartnerships = (players: Membership[]) => {
    const processed = new Set<string>();
    const grouped: Array<{
      type: "partnership" | "individual";
      memberships: Membership[];
      partnership?: any;
    }> = [];

    for (const member of players) {
      if (processed.has(member.userId || "")) continue;

      const partnership = findPartnership(member.userId || "");
      if (partnership) {
        // This is part of a partnership
        const partnerId =
          partnership.captainId === member.userId
            ? partnership.partnerId
            : partnership.captainId;
        const partnerMembership = getMembershipByUserId(partnerId);

        if (partnerMembership) {
          grouped.push({
            type: "partnership",
            memberships: [member, partnerMembership],
            partnership,
          });
          processed.add(member.userId || "");
          processed.add(partnerId);
        } else {
          // Partnership exists but partner membership not found
          grouped.push({
            type: "individual",
            memberships: [member],
          });
          processed.add(member.userId || "");
        }
      } else {
        // Individual player
        grouped.push({
          type: "individual",
          memberships: [member],
        });
        processed.add(member.userId || "");
      }
    }

    return grouped;
  };

  const handleAssignToDivision = (
    member: Membership | Membership[],
    isTeam: boolean = false
  ) => {
    if (isTeam && Array.isArray(member)) {
      // For team assignment, store both memberships
      setSelectedMember(member[0]);
      setSelectedTeamMembers(member);
    } else {
      setSelectedMember(Array.isArray(member) ? member[0] : member);
      setSelectedTeamMembers(null);
    }
    setIsAssignModalOpen(true);
  };

  const PlayerTable = ({ players }: { players: Membership[] }) => {
    const groupedPlayers = groupMembershipsByPartnerships(players);

    return (
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
          {groupedPlayers.length > 0 ? (
            groupedPlayers.map((group, index) => {
              if (group.type === "partnership" && group.memberships.length === 2) {
                // Doubles team - show both players together
                const [member1, member2] = group.memberships;
                const rating1 = getSportRating(member1);
                const rating2 = getSportRating(member2);
                const partnership = group.partnership;

                return (
                  <TableRow
                    key={`partnership-${partnership.id}`}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {member1.user?.name || "Unknown"} &{" "}
                            {member2.user?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{member1.user?.email?.split("@")[0] || "unknown"}{" "}
                            & @{member2.user?.email?.split("@")[0] || "unknown"}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Doubles Team
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Badge variant="outline" className="text-xs">
                          {getDivisionName(
                            partnership?.divisionId ||
                              member1.divisionId ||
                              member2.divisionId ||
                              null
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {member1.user?.name?.split(" ")[0] || "Player 1"}
                        </div>
                        <Badge
                          variant={
                            rating1.display !== "N/A" ? "default" : "outline"
                          }
                          className={`text-xs font-mono ${
                            rating1.display !== "N/A"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : ""
                          }`}
                        >
                          {rating1.display}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {member2.user?.name?.split(" ")[0] || "Player 2"}
                        </div>
                        <Badge
                          variant={
                            rating2.display !== "N/A" ? "default" : "outline"
                          }
                          className={`text-xs font-mono ${
                            rating2.display !== "N/A"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : ""
                          }`}
                        >
                          {rating2.display}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {member1.joinedAt
                          ? new Date(member1.joinedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member1.status === "ACTIVE" ||
                          member2.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {member1.status === "ACTIVE" ||
                        member2.status === "ACTIVE"
                          ? "active"
                          : member1.status?.toLowerCase() || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() =>
                          handleAssignToDivision([member1, member2], true)
                        }
                      >
                        {partnership?.divisionId ||
                        member1.divisionId ||
                        member2.divisionId
                          ? "Reassign Team"
                          : "Assign Team"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              } else {
                // Individual player
                const member = group.memberships[0];
                const rating = getSportRating(member);
                return (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {member.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{member.user?.email?.split("@")[0] || "unknown"}
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
                        variant={rating.display !== "N/A" ? "default" : "outline"}
                        className={`text-xs font-mono ${
                          rating.display !== "N/A"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : ""
                        }`}
                      >
                        {rating.display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "ACTIVE" ? "default" : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {member?.status?.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => handleAssignToDivision(member, false)}
                      >
                        {member.divisionId
                          ? "Reassign Division"
                          : "Assign to Division"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <IconUser className="size-12 opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No players found</p>
                    <p className="text-xs">
                      Players will appear here once they join the season
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    );
  };

  return (
    <>
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

      <AssignDivisionModal
        isOpen={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        member={selectedMember}
        teamMembers={selectedTeamMembers}
        divisions={divisions}
        seasonId={seasonId}
        onAssigned={onMembershipUpdated}
        adminId={adminId || ""}
        getSportRating={getSportRating}
        gameType={getGameType()}
      />
    </>
  );
}
