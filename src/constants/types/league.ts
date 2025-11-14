export type LeagueStatus = 
  | "ACTIVE" 
  | "INACTIVE" 
  | "SUSPENDED" 
  | "UPCOMING" 
  | "ONGOING" 
  | "FINISHED" 
  | "CANCELLED";

export type JoinType = "OPEN" | "INVITE_ONLY" | "MANUAL";

export type GameType = "SINGLES" | "DOUBLES" | "MIXED";

export type SportType = "TENNIS" | "PICKLEBALL" | "PADEL";

export interface League {
  id: string;
  name: string;
  sportType: SportType;
  location: string | null;
  status: LeagueStatus;
  joinType: JoinType;
  gameType: GameType;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  memberCount?: number;
  seasonCount?: number;
  categoryCount?: number;
  divisionCount?: number;
  sponsorId?: string;
  sponsor?: {
    id: string;
    sponsoredName: string;
    packageTier: string;
  };
  createdBy?: {
    id: string;
    user: {
      name: string;
      email: string;
      image?: string;
    };
  };
}

export interface LeagueFormData {
  name: string;
  description: string;
  sportType: SportType;
  location: string;
  joinType: JoinType;
  gameType: GameType;
  isActive: boolean;
  hasSponsor: boolean;
  existingSponsorId: string;
}

export interface LeagueCreateResponse {
  success: boolean;
  data: League;
  message?: string;
}

export interface LeagueUpdateData extends Partial<LeagueFormData> {
  status?: LeagueStatus;
}