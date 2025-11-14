export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string | null;
  phoneNumber?: string | null;
  area?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
  status?: UserStatus;
}

export interface Player extends User {
  division?: string;
  divisionId?: string;
  joinedAt: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate?: number;
  rank?: number;
  seasonId?: string;
  season?: {
    id: string;
    name: string;
  };
}

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
}

export interface UserProfile extends User {
  bio?: string;
  stats?: PlayerStats;
  leagues?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  seasons?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}