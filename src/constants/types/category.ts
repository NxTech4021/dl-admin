
import { GameType } from './league';

export type GenderRestriction = "OPEN" | "MALE" | "FEMALE";

export interface Category {
  id: string;
  name: string;
  gameType: GameType;
  genderRestriction: GenderRestriction;
  matchFormat?: string;
  maxPlayers?: number;
  maxTeams?: number;
  isActive: boolean;
  categoryOrder: number;
  createdAt: string;
  updatedAt: string;
  leagues?: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    seasons: number;
  };
}

export interface CategoryFormData {
  name: string;
  gameType: GameType;
  genderRestriction: GenderRestriction;
  matchFormat?: string;
  maxPlayers?: number;
  maxTeams?: number;
  isActive: boolean;
  categoryOrder: number;
}

export interface CreateCategoryData extends CategoryFormData {}

export interface UpdateCategoryData extends Partial<CategoryFormData> {}