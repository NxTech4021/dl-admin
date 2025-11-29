"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ArrowLeftRight,
} from "lucide-react";

type InsightType = "positive" | "negative" | "warning" | "info";

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  metric?: string;
}

interface KeyInsightsProps {
  totalRevenue?: number;
  previousRevenue?: number;
  totalMatches?: number;
  previousMatches?: number;
  activeUsers?: number;
  previousActiveUsers?: number;
}

export function KeyInsights({
  totalRevenue = 0,
  previousRevenue = 0,
  totalMatches = 0,
  previousMatches = 0,
  activeUsers = 0,
  previousActiveUsers = 0,
}: KeyInsightsProps) {
  const [showComparison, setShowComparison] = React.useState(false);

  const hasData =
    totalRevenue > 0 ||
    previousRevenue > 0 ||
    totalMatches > 0 ||
    previousMatches > 0 ||
    activeUsers > 0 ||
    previousActiveUsers > 0;

  const insights = React.useMemo<Insight[]>(() => {
    const results: Insight[] = [];

    // Revenue insights
    const revenueGrowth = previousRevenue
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    if (revenueGrowth > 10) {
      results.push({
        id: "revenue-strong-growth",
        type: "positive",
        title: "Strong Revenue Growth",
        description: `Revenue increased by ${revenueGrowth.toFixed(1)}% compared to the previous period, indicating healthy business growth.`,
        metric: `+${revenueGrowth.toFixed(1)}%`,
      });
    } else if (revenueGrowth < -5) {
      results.push({
        id: "revenue-decline",
        type: "negative",
        title: "Revenue Decline",
        description: `Revenue decreased by ${Math.abs(revenueGrowth).toFixed(1)}%. Consider reviewing pricing strategy or promotional campaigns.`,
        metric: `${revenueGrowth.toFixed(1)}%`,
      });
    }

    // Match activity insights
    const matchGrowth = previousMatches
      ? ((totalMatches - previousMatches) / previousMatches) * 100
      : 0;

    if (matchGrowth > 15) {
      results.push({
        id: "match-surge",
        type: "positive",
        title: "Match Activity Surge",
        description: `Match bookings increased by ${matchGrowth.toFixed(1)}%. Great engagement from your user base!`,
        metric: `+${matchGrowth.toFixed(1)}%`,
      });
    } else if (matchGrowth < 0) {
      results.push({
        id: "match-decline",
        type: "warning",
        title: "Match Activity Declining",
        description: `Match bookings decreased by ${Math.abs(matchGrowth).toFixed(1)}%. Consider sending re-engagement campaigns.`,
        metric: `${matchGrowth.toFixed(1)}%`,
      });
    }

    // User engagement insights
    const userGrowth = previousActiveUsers
      ? ((activeUsers - previousActiveUsers) / previousActiveUsers) * 100
      : 0;

    if (userGrowth > 5) {
      results.push({
        id: "user-growth",
        type: "positive",
        title: "Growing User Base",
        description: `Active users increased by ${userGrowth.toFixed(1)}%. Your platform is attracting more players.`,
        metric: `+${userGrowth.toFixed(1)}%`,
      });
    }

    // Revenue per match insight
    const revenuePerMatch = totalMatches > 0 ? totalRevenue / totalMatches : 0;
    if (revenuePerMatch > 50) {
      results.push({
        id: "high-avg-revenue",
        type: "info",
        title: "High Average Match Value",
        description: `Average revenue per match is RM ${revenuePerMatch.toFixed(2)}, indicating premium user engagement.`,
        metric: `RM ${revenuePerMatch.toFixed(2)}`,
      });
    }

    // If we have no insights, add a default one
    if (results.length === 0) {
      results.push({
        id: "steady-performance",
        type: "info",
        title: "Steady Performance",
        description: "Metrics are stable compared to the previous period. Monitor trends for opportunities.",
      });
    }

    return results.slice(0, 4); // Limit to 4 insights max
  }, [
    totalRevenue,
    previousRevenue,
    totalMatches,
    previousMatches,
    activeUsers,
    previousActiveUsers,
  ]);

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: InsightType) => {
    switch (type) {
      case "positive":
        return "text-green-700 bg-green-50 border-green-200";
      case "negative":
        return "text-red-700 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <Card>
      <CardHeader className="border-b px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-base sm:text-lg">Key Insights</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="gap-1 sm:gap-2 text-xs sm:text-sm shrink-0"
          >
            <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{showComparison ? "Hide" : "Show"} Comparison</span>
            <span className="xs:hidden">{showComparison ? "Hide" : "Show"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {!hasData ? (
          <EmptyState
            icon={Lightbulb}
            title="No Data Available"
            description="Insights will appear here once you have revenue, matches, and user activity data."
          />
        ) : (
          <>
            {showComparison && (
          <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-lg border mx-4 sm:mx-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium">Metric</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium">Current</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium hidden sm:table-cell">Previous</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Total Revenue</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">{formatCurrency(totalRevenue)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-muted-foreground hidden sm:table-cell">{formatCurrency(previousRevenue)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <Badge variant={totalRevenue > previousRevenue ? "default" : "destructive"} className="text-xs">
                          {totalRevenue > previousRevenue ? "+" : ""}
                          {previousRevenue ? ((( totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : "0"}%
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Total Matches</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">{formatNumber(totalMatches)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-muted-foreground hidden sm:table-cell">{formatNumber(previousMatches)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <Badge variant={totalMatches > previousMatches ? "default" : "destructive"} className="text-xs">
                          {totalMatches > previousMatches ? "+" : ""}
                          {previousMatches ? (((totalMatches - previousMatches) / previousMatches) * 100).toFixed(1) : "0"}%
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium">Active Users</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">{formatNumber(activeUsers)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-muted-foreground hidden sm:table-cell">{formatNumber(previousActiveUsers)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <Badge variant={activeUsers > previousActiveUsers ? "default" : "destructive"} className="text-xs">
                          {activeUsers > previousActiveUsers ? "+" : ""}
                          {previousActiveUsers ? (((activeUsers - previousActiveUsers) / previousActiveUsers) * 100).toFixed(1) : "0"}%
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg border p-3 sm:p-4 transition-all hover:shadow-md active:scale-[0.98] ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mt-0.5 shrink-0">{getInsightIcon(insight.type)}</div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-xs sm:text-sm truncate">{insight.title}</h4>
                    {insight.metric && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {insight.metric}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
