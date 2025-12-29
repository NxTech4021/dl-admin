import { GameType } from './league';

export type DivisionLevel = "beginner" | "improver" | "intermediate" | "upper_intermediate" | "expert" | "advanced";

export type GenderCategory = "male" | "female" | "mixed";

export type DivisionStatus = "ACTIVE" | "INACTIVE";

export interface Division {
  id: string;
  name: string;
  level?: DivisionLevel;
  gameType: GameType;
  genderCategory?: GenderCategory;
  maxSinglesPlayers?: number;
  maxDoublesTeams?: number;
  currentSinglesCount?: number;
  currentDoublesCount?: number;
  status: DivisionStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  seasonId?: string;
  season?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  _count?: {
    players: number;
    teams: number;
  };
}

export interface DivisionFormData {
  name: string;
  level: DivisionLevel;
  gameType: GameType;
  genderCategory: GenderCategory;
  maxSinglesPlayers?: number;
  maxDoublesTeams?: number;
  isActive: boolean;
}

export interface CreateDivisionData extends DivisionFormData {
  seasonId: string;
}

export interface UpdateDivisionData extends Partial<DivisionFormData> {
  status?: DivisionStatus;
}