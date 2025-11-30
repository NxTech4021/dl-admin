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

export type SponsorTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";

// ==========================================
// API Response Types
// ==========================================

/** API League response from backend */
export interface ApiLeagueResponse {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  status: LeagueStatus;
  sportType: SportType;
  joinType: JoinType;
  registrationType?: string;
  gameType: GameType;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  seasons?: ApiSeasonResponse[];
  _count?: {
    seasons?: number;
    categories?: number;
    memberships?: number;
  };
}

/** API Season response from backend */
export interface ApiSeasonResponse {
  id: string;
  name: string;
  leagueId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  memberships?: ApiMembershipResponse[];
  _count?: {
    memberships?: number;
    matches?: number;
  };
}

/** API Membership response from backend */
export interface ApiMembershipResponse {
  id: string;
  userId: string;
  seasonId: string;
  status?: string;
  player?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  };
}

// ==========================================
// Sponsorship Types
// ==========================================

/** Company/Sponsor entity */
export interface SponsorCompany {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
}

/** Sponsorship with full details */
export interface Sponsorship {
  id: string;
  sponsoredName?: string;
  tier?: SponsorTier;
  packageTier?: SponsorTier;
  amount?: number;
  contractAmount?: number;
  startDate?: string;
  endDate?: string;
  company?: SponsorCompany;
  leagueId?: string;
}

/** Simplified sponsor for autocomplete/selection */
export interface SponsorOption {
  id: string;
  name: string;
}

// ==========================================
// Player Types
// ==========================================

/** Player available for selection/assignment */
export interface AvailablePlayer {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

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

// Form option interfaces
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

// League form select options
export const SPORTS_OPTIONS: SelectOption<SportType>[] = [
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "TENNIS", label: "Tennis" },
  { value: "PADEL", label: "Padel" },
];

export const LOCATION_OPTIONS: SelectOption[] = [
  { value: "kuala-lumpur", label: "Kuala Lumpur" },
  { value: "petaling-jaya", label: "Petaling Jaya" },
  { value: "subang-jaya", label: "Subang Jaya" },
  { value: "shah-alam", label: "Shah Alam" },
  { value: "klang", label: "Klang" },
  { value: "ampang", label: "Ampang" },
  { value: "cheras", label: "Cheras" },
  { value: "puchong", label: "Puchong" },
  { value: "cyberjaya", label: "Cyberjaya" },
  { value: "putrajaya", label: "Putrajaya" },
];

export const FORMAT_OPTIONS: SelectOption<GameType>[] = [
  { value: "SINGLES", label: "Singles" },
  { value: "DOUBLES", label: "Doubles" },
  { value: "MIXED", label: "Mixed Doubles" },
];

export const STATUS_OPTIONS: SelectOption<"ACTIVE" | "UPCOMING">[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "UPCOMING", label: "Upcoming" },
];

// Helper function to get sport color
export const getSportColor = (sport: SportType | string): string => {
  switch (sport) {
    case "TENNIS":
      return "#ABFE4D";
    case "PICKLEBALL":
      return "#A04DFE";
    case "PADEL":
      return "#4DABFE";
    default:
      return "#6B7280";
  }
};