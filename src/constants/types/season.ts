export type SeasonStatus = "UPCOMING" | "ACTIVE" | "FINISHED" | "CANCELLED";

export interface Season {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  regiDeadline: string | Date;
  entryFee: number;
  description?: string | null;
  status: SeasonStatus;
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
  categoryId?: string;
  sponsorId?: string;
  leagueIds?: string[];
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    gameType: string;
  };
  sponsor?: {
    id: string;
    sponsoredName: string;
    packageTier: string;
  };
  registeredUserCount?: number;
  _count?: {
    memberships: number;
    divisions: number;
  };
}

export interface SeasonFormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  regiDeadline: Date | undefined;
  entryFee: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
  hasSponsor: boolean;
  existingSponsorId: string;
}

export interface SeasonMembership {
  id: string;
  userId: string;
  seasonId: string;
  registeredAt: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentAmount?: number;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface CreateSeasonData {
  name: string;
  description?: string | null;
  entryFee: number;
  startDate: string;
  endDate: string;
  regiDeadline: string;
  categoryId: string;
  leagueIds: string[];
  isActive: boolean;
  paymentRequired: boolean;
  promoCodeSupported: boolean;
  withdrawalEnabled: boolean;
  sponsorId?: string;
}

export interface UpdateSeasonData extends Partial<CreateSeasonData> {
  status?: SeasonStatus;
}