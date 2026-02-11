// Shared types for league-related components

export type SportType = "TENNIS" | "PICKLEBALL" | "PADEL";

export interface League {
  id: string;
  name: string;
  sportType: SportType;
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

export type GenderRestriction = "OPEN" | "MALE" | "FEMALE";

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

/** Basic league reference for category */
interface CategoryLeagueRef {
  id: string;
  name: string;
  sportType?: string;
}

export interface Category {
  id: string;
  name: string | null;
  gameType: string | null;
  genderRestriction: GenderRestriction | string;
  matchFormat?: string | null;
  maxPlayers?: number;
  maxTeams?: number;
  isActive?: boolean;
  categoryOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  leagues?: CategoryLeagueRef[];
  league?: {
    id: string;
    name: string;
    sportType: string;
  } | null;
  seasons?: Array<{
    id: string;
    name: string;
  }>;
}

export type TierType = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface Sponsor {
  id: string;
  packageTier: TierType;
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

// ==========================================
// Shared Utility Functions
// ==========================================

/**
 * Format date string to short month and year
 */
export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

/**
 * Format currency amount (MYR)
 */
export const formatCurrencyMYR = (amount: number): string => {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate win rate percentage
 */
export const calculateWinRate = (wins: number, losses: number): number => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};
