// lib/types.ts

// Define base types based on your Prisma schema (simplified for mock purposes)
export type League = { id: string, name: string };
export type Category = { id: string, name: string };
export type WithdrawalRequest = { id: string, userId: string, amount: number, status: 'PENDING' | 'PROCESSED' };
export type SeasonMembership = { id: string, createdAt: Date, user: { name: string }, status: 'ACTIVE' | 'WAITLISTED' };

export interface Season {
    id: string;
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    regiDeadline: Date | null;
    entryFee: number;
    description: string | null;
    sportType: string | null;
    seasonType: string; // GameType equivalent
    registeredUserCount: number;
    status: string; // SeasonStatus equivalent
    isActive: boolean;
    paymentRequired: boolean;
    promoCodeSupported: boolean;
    withdrawalEnabled: boolean;
    createdAt: Date;
}

// Full type for the detail view page, including relations
export type FullSeason = Season & {
    league: League;
    category: Category;
    memberships: SeasonMembership[];
    withdrawalRequests: WithdrawalRequest[];
};

// Utility function to format dates
export const formatDate = (date: Date | null) => (
  date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
);
