import type { GoAccount } from "@/lib/api/types";

export type DashboardAccountTheme = "gold" | "silver" | "obsidian";

export interface DashboardAccountCard {
  id: number;
  title: string;
  ibanSuffix: string;
  balanceLabel: string;
  currencyCode: string;
  subtitle: string;
  theme: DashboardAccountTheme;
}

export interface DashboardBriefItem {
  label: string;
  value: string;
}

export interface DashboardPageViewModel {
  userName: string;
  accounts: DashboardAccountCard[];
  brief: DashboardBriefItem[];
}

export const DASHBOARD_CURRENCY_CONFIG: Record<
  string,
  { theme: DashboardAccountTheme; symbol: string; label: string }
> = {
  USD: { theme: "gold", symbol: "$", label: "US Dollar Reserve" },
  EUR: { theme: "silver", symbol: "EUR ", label: "European Vault" },
  EGP: { theme: "obsidian", symbol: "EGP ", label: "Cairo Account" },
};

export function formatDashboardBalance(
  balance: number,
  currency: string,
): string {
  const symbol = DASHBOARD_CURRENCY_CONFIG[currency]?.symbol ?? `${currency} `;
  return `${symbol}${balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function mapDashboardAccounts(
  accounts: readonly GoAccount[],
): DashboardAccountCard[] {
  return accounts.map((account) => ({
    id: account.id,
    title:
      DASHBOARD_CURRENCY_CONFIG[account.currency]?.label ??
      `${account.currency} Account`,
    ibanSuffix: String(account.id).padStart(4, "0"),
    balanceLabel: formatDashboardBalance(account.balance, account.currency),
    currencyCode: account.currency,
    subtitle: `Active since ${new Date(account.createdAt).toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "numeric",
      },
    )}`,
    theme: DASHBOARD_CURRENCY_CONFIG[account.currency]?.theme ?? "obsidian",
  }));
}

export function buildDashboardBrief(
  accounts: readonly GoAccount[],
  isVerified: boolean,
): DashboardBriefItem[] {
  const items: DashboardBriefItem[] = [];

  if (accounts.length === 0) {
    items.push({
      label: "Getting started",
      value: "Open your first account to begin tracking balances.",
    });
  } else {
    const currencies = [
      ...new Set(accounts.map((account) => account.currency)),
    ];
    const highest = accounts.reduce<GoAccount | null>(
      (top, account) =>
        top === null || account.balance > top.balance ? account : top,
      null,
    );
    const mostRecent = accounts.reduce<GoAccount | null>(
      (latest, account) =>
        latest === null ||
        new Date(account.createdAt) > new Date(latest.createdAt)
          ? account
          : latest,
      null,
    );

    if (highest) {
      items.push({
        label: "Largest balance",
        value: `${DASHBOARD_CURRENCY_CONFIG[highest.currency]?.label ?? highest.currency} - ${formatDashboardBalance(
          highest.balance,
          highest.currency,
        )}`,
      });
    }

    items.push({ label: "Active currencies", value: currencies.join(", ") });

    if (mostRecent) {
      items.push({
        label: "Latest account opened",
        value: `${DASHBOARD_CURRENCY_CONFIG[mostRecent.currency]?.label ?? mostRecent.currency}, ${new Date(
          mostRecent.createdAt,
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
      });
    }
  }

  items.push({
    label: "Identity status",
    value: isVerified
      ? "Verified - ready for protected actions"
      : "Email verification pending",
  });

  return items;
}

export function buildDashboardPageViewModel(
  accounts: readonly GoAccount[],
  userName: string,
  isVerified: boolean,
): DashboardPageViewModel {
  return {
    userName,
    accounts: mapDashboardAccounts(accounts),
    brief: buildDashboardBrief(accounts, isVerified),
  };
}
