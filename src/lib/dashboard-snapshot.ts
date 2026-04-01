import "server-only";

import type { SessionData } from "@/lib/session/config";

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  trend?: "up" | "down" | "neutral";
  accent?: "gold" | "silver";
}

export interface DashboardAccount {
  name: string;
  ibanSuffix: string;
  balance: string;
  currency: string;
  change: string;
  theme: "gold" | "silver" | "obsidian";
}

export interface DashboardSnapshot {
  featuredAccount: DashboardAccount;
  accounts: DashboardAccount[];
  totalBalance: string;
  availableToMove: string;
  atAGlance: Array<{
    label: string;
    value: string;
  }>;
  activity: Array<{
    title: string;
    detail: string;
    amount: string;
    direction: "credit" | "debit";
    time: string;
  }>;
  brief: Array<{
    label: string;
    value: string;
  }>;
}

export function getDashboardSnapshot(
  session: SessionData,
): DashboardSnapshot {
  const isVerified = session.user.is_email_verified;
  const accounts: DashboardAccount[] = [
    {
      name: "Private Reserve",
      ibanSuffix: "4802",
      balance: "$142,300.00",
      currency: "USD",
      change: "+$8,420 this month",
      theme: "gold",
    },
    {
      name: "European Vault",
      ibanSuffix: "2187",
      balance: "EUR 86,920.10",
      currency: "EUR",
      change: "+EUR 2,140 this week",
      theme: "silver",
    },
    {
      name: "Cairo Everyday",
      ibanSuffix: "7314",
      balance: "EGP 2,740,500",
      currency: "EGP",
      change: "Payroll and local wires ready",
      theme: "obsidian",
    },
  ];

  return {
    totalBalance: "$284,960.24",
    availableToMove: "$38,420.00",
    atAGlance: [
      {
        label: "Currencies",
        value: "USD, EUR, EGP",
      },
      {
        label: "Profile",
        value: isVerified ? "Premier verified" : "Premier onboarding",
      },
      {
        label: "Session",
        value: session.user.username,
      },
    ],
    featuredAccount: accounts[0],
    accounts: accounts.slice(1),
    activity: [
      {
        title: "Incoming treasury transfer",
        detail: "GoBank internal settlement for reserve funding",
        amount: "+$24,000.00",
        direction: "credit",
        time: "05 min ago",
      },
      {
        title: "Card authorization hold",
        detail: "Merchant services for international travel desk",
        amount: "-$680.00",
        direction: "debit",
        time: "42 min ago",
      },
      {
        title: "FX rebalance completed",
        detail: "Converted reserve cash into EUR at preferred spread",
        amount: "+EUR 12,500.00",
        direction: "credit",
        time: "Today",
      },
    ],
    brief: [
      {
        label: "Available to move",
        value: "$38,420.00",
      },
      {
        label: "Best weekly mover",
        value: "European Vault",
      },
      {
        label: "Statement window",
        value: "Closes in 3 days",
      },
      {
        label: "Identity status",
        value: isVerified ? "Ready for protected actions" : "Verification needed",
      },
    ],
  };
}
