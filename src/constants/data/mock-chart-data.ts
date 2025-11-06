// Mock data for charts - static data to prevent hydration mismatches
// All data is deterministic based on inputs

type ChartRange = "monthly" | "average" | "thisWeek";
type HistoryRange = 1 | 3 | 6;

// Sport Comparison Data
export interface SportComparisonData {
  sport: string;
  payingMembers: number;
  revenue: number;
  fill: string;
}

export function getSportComparisonData(
  chartRange: ChartRange,
  historyRange: HistoryRange
): SportComparisonData[] {
  // Deterministic data based on chartRange and historyRange
  const dataMap: Record<string, SportComparisonData[]> = {
    // monthly, 1 month
    "monthly-1": [
      { sport: "Tennis", payingMembers: 56, revenue: 1400, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 34, revenue: 1020, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 18, revenue: 820, fill: "#4DABFE" },
    ],
    // monthly, 3 months
    "monthly-3": [
      { sport: "Tennis", payingMembers: 68, revenue: 1700, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 42, revenue: 1260, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 22, revenue: 1000, fill: "#4DABFE" },
    ],
    // monthly, 6 months
    "monthly-6": [
      { sport: "Tennis", payingMembers: 82, revenue: 2050, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 50, revenue: 1500, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 26, revenue: 1200, fill: "#4DABFE" },
    ],
    // average, 1 month
    "average-1": [
      { sport: "Tennis", payingMembers: 14, revenue: 350, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 8, revenue: 255, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 5, revenue: 205, fill: "#4DABFE" },
    ],
    // average, 3 months
    "average-3": [
      { sport: "Tennis", payingMembers: 17, revenue: 425, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 11, revenue: 315, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 6, revenue: 250, fill: "#4DABFE" },
    ],
    // average, 6 months
    "average-6": [
      { sport: "Tennis", payingMembers: 20, revenue: 512, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 13, revenue: 375, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 7, revenue: 300, fill: "#4DABFE" },
    ],
    // thisWeek, 1 month
    "thisWeek-1": [
      { sport: "Tennis", payingMembers: 10, revenue: 250, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 6, revenue: 184, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 3, revenue: 148, fill: "#4DABFE" },
    ],
    // thisWeek, 3 months
    "thisWeek-3": [
      { sport: "Tennis", payingMembers: 12, revenue: 306, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 8, revenue: 227, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 4, revenue: 180, fill: "#4DABFE" },
    ],
    // thisWeek, 6 months
    "thisWeek-6": [
      { sport: "Tennis", payingMembers: 15, revenue: 368, fill: "#ABFE4D" },
      { sport: "Pickleball", payingMembers: 9, revenue: 270, fill: "#A04DFE" },
      { sport: "Padel", payingMembers: 5, revenue: 216, fill: "#4DABFE" },
    ],
  };

  const key = `${chartRange}-${historyRange}`;
  return dataMap[key] || dataMap["monthly-3"];
}

// Match Activity Data
export interface MatchActivityData {
  week: string;
  date: string;
  tennisLeague: number;
  tennisFriendly: number;
  pickleballLeague: number;
  pickleballFriendly: number;
  padelLeague: number;
  padelFriendly: number;
}

export function getMatchActivityData(
  chartRange: ChartRange,
  historyRange: HistoryRange
): MatchActivityData[] {
  const weeksToShow = historyRange * 4; // Approximate weeks per month

  // Generate static weekly data
  const baseWeekData: MatchActivityData[] = [
    { week: "Week 1", date: "Jan 1", tennisLeague: 12, tennisFriendly: 7, pickleballLeague: 8, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 2", date: "Jan 8", tennisLeague: 14, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 3 },
    { week: "Week 3", date: "Jan 15", tennisLeague: 11, tennisFriendly: 6, pickleballLeague: 7, pickleballFriendly: 4, padelLeague: 3, padelFriendly: 2 },
    { week: "Week 4", date: "Jan 22", tennisLeague: 13, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 5", date: "Jan 29", tennisLeague: 15, tennisFriendly: 9, pickleballLeague: 10, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 4 },
    { week: "Week 6", date: "Feb 5", tennisLeague: 12, tennisFriendly: 7, pickleballLeague: 8, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 7", date: "Feb 12", tennisLeague: 14, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 3 },
    { week: "Week 8", date: "Feb 19", tennisLeague: 11, tennisFriendly: 6, pickleballLeague: 7, pickleballFriendly: 4, padelLeague: 3, padelFriendly: 2 },
    { week: "Week 9", date: "Feb 26", tennisLeague: 13, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 10", date: "Mar 5", tennisLeague: 16, tennisFriendly: 10, pickleballLeague: 11, pickleballFriendly: 7, padelLeague: 6, padelFriendly: 4 },
    { week: "Week 11", date: "Mar 12", tennisLeague: 12, tennisFriendly: 7, pickleballLeague: 8, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 12", date: "Mar 19", tennisLeague: 14, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 3 },
    { week: "Week 13", date: "Mar 26", tennisLeague: 13, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 14", date: "Apr 2", tennisLeague: 15, tennisFriendly: 9, pickleballLeague: 10, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 4 },
    { week: "Week 15", date: "Apr 9", tennisLeague: 12, tennisFriendly: 7, pickleballLeague: 8, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 16", date: "Apr 16", tennisLeague: 14, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 3 },
    { week: "Week 17", date: "Apr 23", tennisLeague: 11, tennisFriendly: 6, pickleballLeague: 7, pickleballFriendly: 4, padelLeague: 3, padelFriendly: 2 },
    { week: "Week 18", date: "Apr 30", tennisLeague: 13, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 19", date: "May 7", tennisLeague: 17, tennisFriendly: 10, pickleballLeague: 11, pickleballFriendly: 7, padelLeague: 6, padelFriendly: 4 },
    { week: "Week 20", date: "May 14", tennisLeague: 12, tennisFriendly: 7, pickleballLeague: 8, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 21", date: "May 21", tennisLeague: 14, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 3 },
    { week: "Week 22", date: "May 28", tennisLeague: 13, tennisFriendly: 8, pickleballLeague: 9, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
    { week: "Week 23", date: "Jun 4", tennisLeague: 15, tennisFriendly: 9, pickleballLeague: 10, pickleballFriendly: 6, padelLeague: 5, padelFriendly: 4 },
    { week: "Week 24", date: "Jun 11", tennisLeague: 12, tennisFriendly: 7, pickleballLeague: 8, pickleballFriendly: 5, padelLeague: 4, padelFriendly: 3 },
  ];

  // Get the last N weeks based on historyRange
  let data = baseWeekData.slice(-weeksToShow);

  // Apply multiplier for chartRange
  if (chartRange === "thisWeek") {
    // For thisWeek, show slightly higher values
    data = data.map((week) => ({
      ...week,
      tennisLeague: Math.round(week.tennisLeague * 1.2),
      tennisFriendly: Math.round(week.tennisFriendly * 1.2),
      pickleballLeague: Math.round(week.pickleballLeague * 1.2),
      pickleballFriendly: Math.round(week.pickleballFriendly * 1.2),
      padelLeague: Math.round(week.padelLeague * 1.2),
      padelFriendly: Math.round(week.padelFriendly * 1.2),
    }));
  }
  // For "average" and "monthly", use as-is (average is just a display label)

  // Update week labels
  data = data.map((week, index) => ({
    ...week,
    week: `Week ${index + 1}`,
  }));

  return data;
}

// User Growth Data
export interface UserGrowthData {
  month: string;
  totalUsers: number;
  payingMembers: number;
}

export function getUserGrowthData(historyRange: HistoryRange): UserGrowthData[] {
  const dataMap: Record<HistoryRange, UserGrowthData[]> = {
    1: [
      { month: "2024-12", totalUsers: 185, payingMembers: 83 },
    ],
    3: [
      { month: "2024-10", totalUsers: 150, payingMembers: 68 },
      { month: "2024-11", totalUsers: 168, payingMembers: 76 },
      { month: "2024-12", totalUsers: 185, payingMembers: 83 },
    ],
    6: [
      { month: "2024-07", totalUsers: 120, payingMembers: 54 },
      { month: "2024-08", totalUsers: 132, payingMembers: 59 },
      { month: "2024-09", totalUsers: 141, payingMembers: 63 },
      { month: "2024-10", totalUsers: 150, payingMembers: 68 },
      { month: "2024-11", totalUsers: 168, payingMembers: 76 },
      { month: "2024-12", totalUsers: 185, payingMembers: 83 },
    ],
  };

  return dataMap[historyRange];
}

// Helper function for "thisWeek" user growth data
export function getUserGrowthThisWeekData(baseData: UserGrowthData[]): UserGrowthData {
  const latestMonth = baseData[baseData.length - 1] || { totalUsers: 185, payingMembers: 83 };
  // Deterministic calculation - no Math.random()
  const weeklyUsers = Math.round(latestMonth.totalUsers / 4.3 * 1.0); // ~1.0 multiplier
  const weeklyMembers = Math.round(latestMonth.payingMembers / 4.3 * 1.0);
  
  // Get current date in a deterministic way (same on server and client)
  const now = new Date();
  const weekStr = `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  
  return {
    month: weekStr,
    totalUsers: weeklyUsers,
    payingMembers: weeklyMembers,
  };
}

