
import { FullSeason } from "./types";

const mockSeasonData: FullSeason = {
    id: 's_123',
    name: 'Summer League 2025',
    startDate: new Date(2025, 5, 15),
    endDate: new Date(2025, 7, 30),
    regiDeadline: new Date(2025, 4, 30),
    entryFee: 75.00,
    description: 'The premier competitive basketball league for the 2025 summer season. Max 60 teams.',
    sportType: 'Basketball',
    seasonType: 'LEAGUE',
    registeredUserCount: 45,
    status: 'REGISTRATION',
    isActive: true,
    paymentRequired: true,
    promoCodeSupported: false,
    withdrawalEnabled: true,
    league: { id: 'l_1', name: 'City Hoops League' },
    category: { id: 'c_1', name: 'Adult Co-Ed' },
    memberships: [
        { id: 'm1', createdAt: new Date(2025, 3, 1), user: { name: 'Alex Johnson' }, status: 'ACTIVE' },
        { id: 'm2', createdAt: new Date(2025, 3, 5), user: { name: 'Sarah Lee' }, status: 'ACTIVE' },
        { id: 'm3', createdAt: new Date(2025, 4, 10), user: { name: 'Mike Chen' }, status: 'WAITLISTED' },
        { id: 'm4', createdAt: new Date(2025, 4, 20), user: { name: 'Emily Davis' }, status: 'ACTIVE' },
    ],
    withdrawalRequests: [
        { id: 'w1', userId: 'u_33', amount: 75.00, status: 'PENDING' },
        { id: 'w2', userId: 'u_98', amount: 75.00, status: 'PENDING' },
    ],
    createdAt: new Date(),
};

/**
 * Simulates fetching full season details from a database using the ID.
 * In a real Next.js Server Component, this would be a direct Prisma query.
 */
export async function getSeasonDetails(seasonId: string): Promise<FullSeason | null> {
    // Simulate network delay and finding the data
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (seasonId === mockSeasonData.id) {
        return mockSeasonData;
    }
    return null;
}