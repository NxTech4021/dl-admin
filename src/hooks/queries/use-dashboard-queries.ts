import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { dashboardStatsSchema, dashboardKPISchema, sportMetricsSchema, matchActivitySchema, userGrowthSchema, sportComparisonSchema, DashboardStats, DashboardKPI, SportMetrics, MatchActivity, UserGrowth, SportComparison } from "@/constants/zod/dashboard-schema";
import { endpoints } from "@/lib/endpoints";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

/**
 * Get all dashboard stats in one call
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async (): Promise<DashboardStats> => {
      const response = await apiClient.get(endpoints.admin.dashboard.getAll);
      return dashboardStatsSchema.parse(response.data.data);
    },
    staleTime: 60000, // 1 minute cache
  });
}

/**
 * Get KPI stats only
 */
export function useDashboardKPI() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpi(),
    queryFn: async (): Promise<DashboardKPI> => {
      const response = await apiClient.get(endpoints.admin.dashboard.getKPI);
      return dashboardKPISchema.parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get sport-specific metrics
 */
export function useSportMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard.sports(),
    queryFn: async (): Promise<SportMetrics[]> => {
      const response = await apiClient.get(endpoints.admin.dashboard.getSports);
      return z.array(sportMetricsSchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get match activity data for charts
 */
export function useMatchActivity(weeks?: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.matchActivity(weeks),
    queryFn: async (): Promise<MatchActivity[]> => {
      const params = weeks ? `?weeks=${weeks}` : "";
      const response = await apiClient.get(`${endpoints.admin.dashboard.getMatchActivity}${params}`);
      return z.array(matchActivitySchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get user growth data for charts
 */
export function useUserGrowth(months?: number) {
  return useQuery({
    queryKey: queryKeys.dashboard.userGrowth(months),
    queryFn: async (): Promise<UserGrowth[]> => {
      const params = months ? `?months=${months}` : "";
      const response = await apiClient.get(`${endpoints.admin.dashboard.getUserGrowth}${params}`);
      return z.array(userGrowthSchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}

/**
 * Get sport comparison data for charts
 */
export function useSportComparison() {
  return useQuery({
    queryKey: queryKeys.dashboard.sportComparison(),
    queryFn: async (): Promise<SportComparison[]> => {
      const response = await apiClient.get(endpoints.admin.dashboard.getSportComparison);
      return z.array(sportComparisonSchema).parse(response.data.data);
    },
    staleTime: 60000,
  });
}
