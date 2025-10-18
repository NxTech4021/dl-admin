"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  UserCheck,
  CreditCard,
} from "lucide-react";

// Static mock data - replace with real API calls (realistic for 100+ member app)
const mockKPIData = {
  totalUsers: 284,
  leagueParticipants: 132,
  conversionRate: 46.5,
  totalRevenue: 3960,
  previousTotalUsers: 259,
  previousLeagueParticipants: 121,
  previousRevenue: 3630,
};

const mockSportData = {
  tennis: {
    users: 127,
    payingMembers: 68,
    revenue: 1700,
    previousUsers: 118,
    previousPayingMembers: 62,
    previousRevenue: 1550,
  },
  pickleball: {
    users: 98,
    payingMembers: 42,
    revenue: 1260,
    previousUsers: 89,
    previousPayingMembers: 38,
    previousRevenue: 1140,
  },
  padel: {
    users: 59,
    payingMembers: 22,
    revenue: 1000,
    previousUsers: 52,
    previousPayingMembers: 21,
    previousRevenue: 940,
  },
};

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "currency" | "percentage";
  trend?: "up" | "down" | "neutral";
}

function formatValue(
  value: string | number,
  format: "number" | "currency" | "percentage" = "number"
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue);
    case "percentage":
      return `${numValue.toFixed(1)}%`;
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(numValue);
  }
}

function calculateTrend(
  current: number,
  previous: number
): { trend: "up" | "down" | "neutral"; percentage: number } {
  if (previous === 0) return { trend: "neutral", percentage: 0 };

  const change = ((current - previous) / previous) * 100;
  const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return { trend, percentage: Math.abs(change) };
}

function KPICard({
  title,
  value,
  previousValue,
  icon: Icon,
  format = "number",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trend,
}: KPICardProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const trendData = previousValue
    ? calculateTrend(numValue, previousValue)
    : null;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value, format)}</div>
        {trendData && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {trendData.trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trendData.trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={
                trendData.trend === "up"
                  ? "text-green-500"
                  : trendData.trend === "down"
                  ? "text-red-500"
                  : ""
              }
            >
              {trendData.percentage > 0 &&
                `${trendData.percentage.toFixed(1)}%`}
            </span>
            <span>from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SportKPICardProps {
  sport: string;
  users: number;
  payingMembers: number;
  revenue: number;
  previousUsers?: number;
  previousPayingMembers?: number;
  previousRevenue?: number;
}

function SportKPICard({
  sport,
  users,
  payingMembers,
  revenue,
  previousUsers,
  previousPayingMembers,
  previousRevenue,
}: SportKPICardProps) {
  const usersTrend = previousUsers
    ? calculateTrend(users, previousUsers)
    : null;
  const membersTrend = previousPayingMembers
    ? calculateTrend(payingMembers, previousPayingMembers)
    : null;
  const revenueTrend = previousRevenue
    ? calculateTrend(revenue, previousRevenue)
    : null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSportIcon = (sport: string) => {
    // You can replace these with actual sport icons
    return Target;
  };

  const SportIcon = getSportIcon(sport);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <SportIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold capitalize">
            {sport}
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          Sport
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Users</p>
              <p className="text-xl font-bold">
                {formatValue(users, "number")}
              </p>
              {usersTrend && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {usersTrend.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : usersTrend.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span
                    className={
                      usersTrend.trend === "up"
                        ? "text-green-500"
                        : usersTrend.trend === "down"
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {usersTrend.percentage > 0 &&
                      `${usersTrend.percentage.toFixed(1)}%`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Paying Members
              </p>
              <p className="text-xl font-bold">
                {formatValue(payingMembers, "number")}
              </p>
              {membersTrend && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {membersTrend.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : membersTrend.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span
                    className={
                      membersTrend.trend === "up"
                        ? "text-green-500"
                        : membersTrend.trend === "down"
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {membersTrend.percentage > 0 &&
                      `${membersTrend.percentage.toFixed(1)}%`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Revenue
              </p>
              <p className="text-xl font-bold">
                {formatValue(revenue, "currency")}
              </p>
              {revenueTrend && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {revenueTrend.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : revenueTrend.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span
                    className={
                      revenueTrend.trend === "up"
                        ? "text-green-500"
                        : revenueTrend.trend === "down"
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {revenueTrend.percentage > 0 &&
                      `${revenueTrend.percentage.toFixed(1)}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopKPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Users"
        value={mockKPIData.totalUsers}
        previousValue={mockKPIData.previousTotalUsers}
        icon={Users}
        format="number"
      />
      <KPICard
        title="League Participants"
        value={mockKPIData.leagueParticipants}
        previousValue={mockKPIData.previousLeagueParticipants}
        icon={UserCheck}
        format="number"
      />
      <KPICard
        title="Conversion Rate"
        value={mockKPIData.conversionRate}
        icon={TrendingUp}
        format="percentage"
      />
      <KPICard
        title="Total Revenue"
        value={mockKPIData.totalRevenue}
        previousValue={mockKPIData.previousRevenue}
        icon={CreditCard}
        format="currency"
      />
    </div>
  );
}

export function SportKPICards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <SportKPICard
        sport="tennis"
        users={mockSportData.tennis.users}
        payingMembers={mockSportData.tennis.payingMembers}
        revenue={mockSportData.tennis.revenue}
        previousUsers={mockSportData.tennis.previousUsers}
        previousPayingMembers={mockSportData.tennis.previousPayingMembers}
        previousRevenue={mockSportData.tennis.previousRevenue}
      />
      <SportKPICard
        sport="pickleball"
        users={mockSportData.pickleball.users}
        payingMembers={mockSportData.pickleball.payingMembers}
        revenue={mockSportData.pickleball.revenue}
        previousUsers={mockSportData.pickleball.previousUsers}
        previousPayingMembers={mockSportData.pickleball.previousPayingMembers}
        previousRevenue={mockSportData.pickleball.previousRevenue}
      />
      <SportKPICard
        sport="padel"
        users={mockSportData.padel.users}
        payingMembers={mockSportData.padel.payingMembers}
        revenue={mockSportData.padel.revenue}
        previousUsers={mockSportData.padel.previousUsers}
        previousPayingMembers={mockSportData.padel.previousPayingMembers}
        previousRevenue={mockSportData.padel.previousRevenue}
      />
    </div>
  );
}
