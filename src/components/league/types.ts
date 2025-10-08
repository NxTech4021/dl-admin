// Shared types for league-related components

export interface League {
  id: string;
  name: string;
  sportType: string;
  location: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "UPCOMING" | "ONGOING" | "FINISHED" | "CANCELLED";
  joinType: "OPEN" | "INVITE_ONLY" | "MANUAL";
  gameType: "SINGLES" | "DOUBLES";
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  memberCount?: number;
  seasonCount?: number;
  categoryCount?: number;
  createdBy?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export interface Player {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string | null;
  rating?: number;
  division?: string;
  joinedAt: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  area?: string | null;
  phoneNumber?: string | null;
}

export interface Division {
  id: string;
  name: string;
  level?: string;
  gameType: string;
  genderCategory?: string;
  maxSinglesPlayers?: number;
  maxDoublesTeams?: number;
  currentSinglesCount?: number;
  currentDoublesCount?: number;
  status: string;
  season?: {
    name: string;
    startDate: string;
    endDate: string;
  };
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regiDeadline: string;
  entryFee: number;
  description?: string;
  sportType: string;
  seasonType: string;
  registeredUserCount: number;
  status: string;
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  genderRestriction: string;
  matchFormat?: string;
  maxPlayers?: number;
  maxTeams?: number;
  isActive: boolean;
  categoryOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  packageTier: string;
  contractAmount?: number;
  sponsorRevenue?: number;
  sponsoredName?: string;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
}

// Helper function types
export type GetLocationLabelFunction = (location: string) => string;
export type GetSportLabelFunction = (sport: string) => string;
export type GetStatusBadgeFunction = (status: string) => React.ReactNode;
export type FormatDateFunction = (dateString: string) => string;
export type CalculateWinRateFunction = (wins: number, losses: number) => number;
