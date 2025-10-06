import axiosInstance, { endpoints } from "./endpoints";

// Types for League API
export interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: "DRAFT" | "REGISTRATION" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  description?: string;
  brandingLogoUrl?: string;
  brandingPrimaryColor?: string;
  brandingSecondaryColor?: string;
  theme?: string;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  settings?: LeagueSettings;
  _count?: {
    seasons: number;
    joinRequests: number;
  };
}

export interface LeagueSettings {
  id: string;
  leagueId: string;
  durationUnit: "WEEKS" | "MONTHS";
  durationValue?: number;
  minPlayersPerDivision?: number;
  maxPlayersPerDivision?: number;
  registrationDeadlineDays?: number;
  paymentSettings?: any;
  divisionRules?: any;
  playoffConfiguration?: any;
  finalsConfiguration?: any;
  workflowConfiguration?: any;
  templates?: any;
  customRulesText?: string;
  integrationSettings?: any;
  bulkOperations?: any;
  archiveRetentionMonths?: number;
  validationRules?: any;
  errorHandling?: any;
  previewPayload?: any;
  previewExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueTemplate {
  id: string;
  name: string;
  sport: string;
  description?: string;
  settings?: any;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueJoinRequest {
  id: string;
  leagueId: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  notes?: string;
  decisionReason?: string;
  decidedById?: string;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  decidedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateLeagueInput {
  name: string;
  sport: string;
  location: string;
  status?: "DRAFT" | "REGISTRATION" | "ACTIVE" | "COMPLETED";
  description?: string;
  brandingLogoUrl?: string;
  brandingPrimaryColor?: string;
  brandingSecondaryColor?: string;
  theme?: string;
}

export interface UpdateLeagueInput extends Partial<CreateLeagueInput> {
  isArchived?: boolean;
}

export interface ListLeaguesParams {
  search?: string;
  sport?: string;
  status?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export interface ListLeaguesResponse {
  success: boolean;
  statusCode: number;
  data: {
    items: League[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export interface LeagueResponse {
  success: boolean;
  statusCode: number;
  data: {
    league: League;
  };
  message?: string;
}

// League Service
export const leagueService = {
  // Get all leagues with filters
  async getLeagues(params?: ListLeaguesParams): Promise<ListLeaguesResponse> {
    const response = await axiosInstance.get(endpoints.league.getAll, {
      params,
    });
    return response.data;
  },

  // Get league by ID
  async getLeagueById(id: string): Promise<LeagueResponse> {
    const response = await axiosInstance.get(endpoints.league.getById(id));
    return response.data;
  },

  // Create new league
  async createLeague(data: CreateLeagueInput): Promise<LeagueResponse> {
    const response = await axiosInstance.post(endpoints.league.create, data);
    return response.data;
  },

  // Update league
  async updateLeague(
    id: string,
    data: UpdateLeagueInput
  ): Promise<LeagueResponse> {
    const response = await axiosInstance.put(
      endpoints.league.update(id),
      data
    );
    return response.data;
  },

  // Delete league
  async deleteLeague(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(endpoints.league.delete(id));
    return response.data;
  },

  // Get league settings
  async getLeagueSettings(id: string) {
    const response = await axiosInstance.get(endpoints.league.getSettings(id));
    return response.data;
  },

  // Update league settings
  async updateLeagueSettings(id: string, settings: Partial<LeagueSettings>) {
    const response = await axiosInstance.put(
      endpoints.league.updateSettings(id),
      settings
    );
    return response.data;
  },

  // Preview league settings
  async previewLeagueSettings(
    id: string,
    previewPayload: any,
    expiresInMinutes?: number
  ) {
    const response = await axiosInstance.post(
      endpoints.league.previewSettings(id),
      { previewPayload, expiresInMinutes }
    );
    return response.data;
  },

  // Get league join requests
  async getLeagueJoinRequests(
    id: string,
    params?: { status?: string; search?: string }
  ) {
    const response = await axiosInstance.get(
      endpoints.league.getJoinRequests(id),
      { params }
    );
    return response.data;
  },

  // Create join request
  async createJoinRequest(id: string, data: { userId: string; notes?: string }) {
    const response = await axiosInstance.post(
      endpoints.league.createJoinRequest(id),
      data
    );
    return response.data;
  },

  // Update join request status
  async updateJoinRequestStatus(
    leagueId: string,
    requestId: string,
    data: { status: "APPROVED" | "DENIED"; decisionReason?: string }
  ) {
    const response = await axiosInstance.patch(
      endpoints.league.updateJoinRequest(leagueId, requestId),
      data
    );
    return response.data;
  },

  // Get league templates
  async getTemplates() {
    const response = await axiosInstance.get(endpoints.league.getTemplates);
    return response.data;
  },

  // Create league template
  async createTemplate(data: {
    name: string;
    sport: string;
    description?: string;
    settings?: any;
  }) {
    const response = await axiosInstance.post(
      endpoints.league.createTemplate,
      data
    );
    return response.data;
  },

  // Bulk create leagues
  async bulkCreateLeagues(data: {
    leagues: CreateLeagueInput[];
    copySettingsFromLeagueId?: string;
  }) {
    const response = await axiosInstance.post(
      endpoints.league.bulkCreate,
      data
    );
    return response.data;
  },

  // Copy league settings
  async copyLeagueSettings(data: {
    sourceLeagueId: string;
    targetLeagueIds: string[];
  }) {
    const response = await axiosInstance.post(
      endpoints.league.copySettings,
      data
    );
    return response.data;
  },

  // Get sports options
  async getSports() {
    const response = await axiosInstance.get(endpoints.league.getSports);
    return response.data;
  },

  // Get locations options
  async getLocations() {
    const response = await axiosInstance.get(endpoints.league.getLocations);
    return response.data;
  },

  // Search sports
  async searchSports(query: string) {
    const response = await axiosInstance.get(endpoints.league.searchSports, {
      params: { q: query },
    });
    return response.data;
  },

  // Search locations
  async searchLocations(query: string) {
    const response = await axiosInstance.get(
      endpoints.league.searchLocations,
      {
        params: { q: query },
      }
    );
    return response.data;
  },
};
