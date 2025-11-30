"use client";

import * as React from "react";
import {
  IconUsers,
  IconTrendingUp,
  IconCurrencyDollar,
} from "@tabler/icons-react";

interface LeagueMembershipInsightsProps {
  totalSeasonParticipation: number;
  membershipStatusCounts: Record<string, number>;
  paymentStatusCounts: Record<string, number>;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return numberFormatter.format(value);
}

function formatEnumLabel(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return value
    .toString()
    .split("_")
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ");
}

const MEMBERSHIP_STATUS_DISPLAY_ORDER = [
  "ACTIVE",
  "PENDING",
  "FLAGGED",
  "INACTIVE",
  "REMOVED",
];

const PAYMENT_STATUS_DISPLAY_ORDER = ["COMPLETED", "PENDING", "FAILED"];

export function LeagueMembershipInsights({
  totalSeasonParticipation,
  membershipStatusCounts,
  paymentStatusCounts,
}: LeagueMembershipInsightsProps) {
  const membershipStatusCountsSafe = membershipStatusCounts || {};
  const paymentStatusCountsSafe = paymentStatusCounts || {};

  const additionalMembershipStatuses = Object.keys(
    membershipStatusCountsSafe
  ).filter(
    (status) =>
      !MEMBERSHIP_STATUS_DISPLAY_ORDER.includes(status) &&
      (membershipStatusCountsSafe[status] ?? 0) > 0
  );

  const additionalPaymentStatuses = Object.keys(paymentStatusCountsSafe).filter(
    (status) =>
      !PAYMENT_STATUS_DISPLAY_ORDER.includes(status) &&
      (paymentStatusCountsSafe[status] ?? 0) > 0
  );

  const totalPaymentsTracked = Object.values(paymentStatusCountsSafe).reduce(
    (total, current) => total + current,
    0
  );

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 space-y-6"
      aria-label="Membership insights"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <IconUsers className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold">Membership Insights</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Understand registration and payment health.
        </p>
      </div>
      {totalSeasonParticipation ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registration Status
              </p>
            </div>
            <ul className="space-y-2 text-sm" role="list" aria-label="Registration status breakdown">
              {MEMBERSHIP_STATUS_DISPLAY_ORDER.map((status) => {
                const count = membershipStatusCountsSafe?.[status] ?? 0;
                const percentage = totalSeasonParticipation
                  ? Math.round((count / totalSeasonParticipation) * 100)
                  : 0;

                return (
                  <li
                    key={status}
                    className="flex items-center justify-between"
                    role="listitem"
                  >
                    <span>{formatEnumLabel(status)}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(count)}
                      {count ? ` \u2022 ${percentage}%` : ""}
                    </span>
                  </li>
                );
              })}
              {additionalMembershipStatuses.map((status) => {
                const count = membershipStatusCountsSafe[status] ?? 0;
                const percentage = totalSeasonParticipation
                  ? Math.round((count / totalSeasonParticipation) * 100)
                  : 0;

                return (
                  <li
                    key={`extra-${status}`}
                    className="flex items-center justify-between"
                    role="listitem"
                  >
                    <span>{formatEnumLabel(status)}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(count)}
                      {count ? ` \u2022 ${percentage}%` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Payment Status
              </p>
            </div>
            {totalPaymentsTracked ? (
              <ul className="space-y-2 text-sm" role="list" aria-label="Payment status breakdown">
                {PAYMENT_STATUS_DISPLAY_ORDER.map((status) => {
                  const count = paymentStatusCountsSafe?.[status] ?? 0;
                  const percentage = count
                    ? Math.round((count / totalPaymentsTracked) * 100)
                    : 0;

                  return (
                    <li
                      key={status}
                      className="flex items-center justify-between"
                      role="listitem"
                    >
                      <span>{formatEnumLabel(status)}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(count)}
                        {count ? ` \u2022 ${percentage}%` : ""}
                      </span>
                    </li>
                  );
                })}
                {additionalPaymentStatuses.map((status) => {
                  const count = paymentStatusCountsSafe[status] ?? 0;
                  const percentage =
                    count && totalPaymentsTracked
                      ? Math.round((count / totalPaymentsTracked) * 100)
                      : 0;

                  return (
                    <li
                      key={`extra-payment-${status}`}
                      className="flex items-center justify-between"
                      role="listitem"
                    >
                      <span>{formatEnumLabel(status)}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(count)} \u2022 {percentage}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Payments have not been recorded yet.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Membership data will populate after players join seasons.
        </p>
      )}
    </section>
  );
}

export default LeagueMembershipInsights;
