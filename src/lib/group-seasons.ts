import type { Season, GroupedSeason } from "@/constants/zod/season-schema";

/**
 * Category sort order:
 * Men > Women > Mixed
 * Singles > Doubles
 *
 * Final order: Men's Singles, Women's Singles, Men's Doubles, Women's Doubles, Mixed Doubles
 */
const CATEGORY_ORDER: Record<string, number> = {
  "men's singles": 1,
  "mens singles": 1,
  "men singles": 1,
  "women's singles": 2,
  "womens singles": 2,
  "women singles": 2,
  "ladies singles": 2,
  "men's doubles": 3,
  "mens doubles": 3,
  "men doubles": 3,
  "women's doubles": 4,
  "womens doubles": 4,
  "women doubles": 4,
  "ladies doubles": 4,
  "mixed doubles": 5,
  "mixed": 5,
};

function getCategorySortOrder(categoryName: string | null): number {
  if (!categoryName) return 999;
  const normalized = categoryName.toLowerCase().trim();
  return CATEGORY_ORDER[normalized] ?? 999;
}

/**
 * Format entry fee for display
 * @returns "RM 20.00" | "RM 20 - 40" | "Free - RM 40" | "Free"
 */
function formatEntryFeeRange(fees: (number | null | undefined)[]): string {
  const validFees = fees
    .map((f) => (f != null ? Number(f) : 0))
    .filter((f) => !isNaN(f));

  if (validFees.length === 0) return "Free";

  const allFree = validFees.every((f) => f === 0);
  if (allFree) return "Free";

  const hasFree = validFees.some((f) => f === 0);
  const paidFees = validFees.filter((f) => f > 0);

  if (paidFees.length === 0) return "Free";

  const minFee = Math.min(...paidFees);
  const maxFee = Math.max(...paidFees);

  const formatCurrency = (amount: number) => `RM ${amount.toFixed(2)}`;

  if (hasFree && paidFees.length > 0) {
    if (minFee === maxFee) {
      return `Free - ${formatCurrency(maxFee)}`;
    }
    return `Free - ${formatCurrency(maxFee)}`;
  }

  if (minFee === maxFee) {
    return formatCurrency(minFee);
  }

  return `${formatCurrency(minFee)} - ${formatCurrency(maxFee)}`;
}

/**
 * Group seasons by their name
 * Seasons with the same name but different categories will be grouped together
 */
export function groupSeasonsByName(seasons: Season[]): GroupedSeason[] {
  if (!seasons || seasons.length === 0) return [];

  // Group by name
  const groupMap = new Map<string, Season[]>();

  for (const season of seasons) {
    const key = season.name;
    const existing = groupMap.get(key);
    if (existing) {
      existing.push(season);
    } else {
      groupMap.set(key, [season]);
    }
  }

  // Convert to GroupedSeason array
  const grouped: GroupedSeason[] = [];

  for (const [name, seasonList] of groupMap) {
    // Collect all unique statuses
    const statuses = [
      ...new Set(seasonList.map((s) => s.status).filter(Boolean)),
    ] as string[];

    // Collect all categories and sort by defined order
    const categories = seasonList
      .filter((s) => s.category != null && s.category.id != null)
      .map((s) => ({
        id: s.category!.id,
        name: s.category!.name ?? null,
        seasonId: s.id,
      }))
      .sort((a, b) => getCategorySortOrder(a.name) - getCategorySortOrder(b.name));

    // Collect all unique leagues
    const leagueMap = new Map<
      string,
      { id: string; name: string; sportType?: string }
    >();
    for (const season of seasonList) {
      for (const league of season.leagues || []) {
        if (!leagueMap.has(league.id)) {
          leagueMap.set(league.id, {
            id: league.id,
            name: league.name,
            sportType: league.sportType,
          });
        }
      }
    }

    // Calculate total players
    const totalPlayers = seasonList.reduce(
      (sum, s) => sum + (s.registeredUserCount || 0),
      0
    );

    // Get entry fees
    const entryFees = seasonList.map((s) => s.entryFee);
    const entryFeeDisplay = formatEntryFeeRange(entryFees);

    // Get earliest deadline
    const deadlines = seasonList
      .map((s) => s.regiDeadline)
      .filter(Boolean)
      .map((d) => new Date(d as Date));
    const earliestDeadline =
      deadlines.length > 0
        ? new Date(Math.min(...deadlines.map((d) => d.getTime())))
        : null;

    // Get date range
    const startDates = seasonList
      .map((s) => s.startDate)
      .filter(Boolean)
      .map((d) => new Date(d as Date));
    const endDates = seasonList
      .map((s) => s.endDate)
      .filter(Boolean)
      .map((d) => new Date(d as Date));

    const dateRange = {
      start:
        startDates.length > 0
          ? new Date(Math.min(...startDates.map((d) => d.getTime())))
          : null,
      end:
        endDates.length > 0
          ? new Date(Math.max(...endDates.map((d) => d.getTime())))
          : null,
    };

    // Get sport type from first season
    const sportType =
      seasonList[0]?.sportType ||
      seasonList[0]?.leagues?.[0]?.sportType ||
      null;

    grouped.push({
      groupKey: name,
      name,
      seasons: seasonList,
      aggregated: {
        totalPlayers,
        entryFeeDisplay,
        statuses,
        categories,
        leagues: Array.from(leagueMap.values()),
        earliestDeadline,
        dateRange,
        sportType,
      },
    });
  }

  return grouped;
}
