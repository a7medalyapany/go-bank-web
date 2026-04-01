import "server-only";

import type { SessionData } from "@/lib/session/config";

export interface DashboardSnapshot {
  summary: {
    totalBalance: string;
    monthlyChange: string;
    protectedAssets: string;
    reserveRatio: string;
  };
  highlights: Array<{
    label: string;
    value: string;
    tone: "gold" | "silver";
  }>;
  accounts: Array<{
    name: string;
    ibanSuffix: string;
    balance: string;
    currency: string;
    change: string;
    theme: "gold" | "silver" | "obsidian";
  }>;
  activity: Array<{
    title: string;
    detail: string;
    amount: string;
    direction: "credit" | "debit";
    time: string;
  }>;
  insights: Array<{
    title: string;
    description: string;
    eyebrow: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
  }>;
}

export function getDashboardSnapshot(
  session: SessionData,
): DashboardSnapshot {
  const firstName = session.user.full_name.split(" ")[0] ?? session.user.username;
  const isVerified = session.user.is_email_verified;

  return {
    summary: {
      totalBalance: "$284,960.24",
      monthlyChange: "+12.4%",
      protectedAssets: isVerified ? "Protected" : "Review pending",
      reserveRatio: "94 / 100",
    },
    highlights: [
      {
        label: "Liquidity positioned across 3 currencies",
        value: "USD, EUR, EGP",
        tone: "gold",
      },
      {
        label: `${firstName}'s banking tier`,
        value: isVerified ? "Premier verified" : "Premier onboarding",
        tone: "silver",
      },
      {
        label: "Settlement velocity",
        value: "Instant internal transfers",
        tone: "silver",
      },
    ],
    accounts: [
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
        balance: "€86,920.10",
        currency: "EUR",
        change: "+€2,140 this week",
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
    ],
    activity: [
      {
        title: "Incoming treasury transfer",
        detail: "GoBank internal settlement • USD reserve",
        amount: "+$24,000.00",
        direction: "credit",
        time: "05 min ago",
      },
      {
        title: "Card authorization hold",
        detail: "Merchant services • international travel desk",
        amount: "-$680.00",
        direction: "debit",
        time: "42 min ago",
      },
      {
        title: "FX rebalance completed",
        detail: "Converted USD to EUR at preferred client spread",
        amount: "€12,500.00",
        direction: "credit",
        time: "Today",
      },
      {
        title: "Protected device login",
        detail: `Recognized session for ${session.user.email}`,
        amount: "Trusted",
        direction: "credit",
        time: "Today",
      },
    ],
    insights: [
      {
        eyebrow: "Wealth posture",
        title: "Idle cash is low and your reserve is well diversified.",
        description:
          "The silver tier view keeps medium-term liquidity visible while gold surfaces high-value opportunities.",
      },
      {
        eyebrow: "Protection",
        title: isVerified
          ? "Your profile is fully verified for high-trust actions."
          : "One final verification step unlocks higher transfer limits.",
        description:
          "Keep your primary email and device trusted to preserve uninterrupted approvals.",
      },
    ],
    quickActions: [
      {
        title: "Move funds",
        description: "Transfer between internal wallets with instant posting.",
      },
      {
        title: "Issue statement",
        description: "Prepare a polished monthly summary for review or export.",
      },
      {
        title: "Book advisor call",
        description: "Schedule a premium banking consultation from the dashboard.",
      },
    ],
  };
}
