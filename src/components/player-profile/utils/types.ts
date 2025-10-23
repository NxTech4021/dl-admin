/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PlayerProfileData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string;
  displayUsername: string | null;
  role: string;
  dateOfBirth: string | null;
  gender: string | null;
  area: string | null;
  bio: string | null;
  phoneNumber: string | null;
  completedOnboarding: boolean;
  lastActivityCheck: string | null;
  lastLogin: string | null;
  status: string;
  registeredDate: string;
  questionnaires: Questionnaire[];
  skillRatings: Record<
    string,
    { rating: number; confidence: string; rd: number }
  > | null;
  accounts: Account[];
  sessions: Session[];
  matches: Match[];
  achievements: Achievement[];
}

export interface Questionnaire {
  sport: string;
  qVersion: number;
  qHash: string;
  completedAt: string | null;
  startedAt: string;
  answersJson: any;
  result: {
    rating: number;
    confidence: string;
    rd: number;
    singles?: number;
    doubles?: number;
    source?: string;
    detail?: any;
  } | null;
}

export interface Account {
  providerId: string;
  createdAt: string;
}

export interface Session {
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface Match {
  id: string;
  sport: string;
  matchType: string;
  playerScore: number;
  opponentScore: number;
  outcome: string;
  matchDate: string;
  location: string | null;
  notes: string | null;
  duration: number | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  unlockedAt: string;
}

export interface LeagueHistory {
  id: string;
  name: string;
  sportType: string;
  location: string | null;
  status: string;
  membership: {
    joinedAt: string;
  };
  _count: {
    memberships: number;
    seasons: number;
  };
}

export interface SeasonHistory {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  membership: {
    joinedAt: string;
    status: string;
    division: {
      id: string;
      name: string;
    };
  };
  category: {
    league: {
      id: string;
      name: string;
      sportType: string;
    };
  };
}

export interface PlayerProfileProps {
  playerId: string;
}

