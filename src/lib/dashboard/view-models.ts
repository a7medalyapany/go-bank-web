import type { GoAccount } from "@/lib/api/types";
import type { ActivityItem } from "@/components/dashboard/ActivityFeed";

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
  activity: ActivityItem[];
}

export interface DashboardActivityEntry {
  id: number;
  accountId: number;
  amount: number;
  currency: string;
  createdAt: string;
  transferId: number | null;
  counterpartAccountId: number | null;
  counterpartOwner: string | null;
  counterpartCurrency: string | null;
}

export const DASHBOARD_CURRENCY_CONFIG: Record<
  string,
  { theme: DashboardAccountTheme; symbol: string; label: string }
> = {
  USD: { theme: "gold", symbol: "$", label: "US Dollar Reserve" },
  EUR: { theme: "silver", symbol: "€", label: "European Vault" },
  EGP: { theme: "obsidian", symbol: "E£", label: "Cairo Account" },
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

export function formatMoneyFromCents(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount) / 100);
}

export function formatActivityTime(
  createdAt: string,
  now = new Date(),
): string {
  const diffMs = Math.max(now.getTime() - new Date(createdAt).getTime(), 0);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(diffMs / day);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatCounterpartyDetail(
  entry: DashboardActivityEntry,
  fallback: string,
): string {
  if (!entry.counterpartOwner) return fallback;

  const accountSuffix =
    entry.counterpartAccountId !== null
      ? ` - Acct ${String(entry.counterpartAccountId).padStart(4, "0")}`
      : "";
  const currencySuffix = entry.counterpartCurrency
    ? ` - ${entry.counterpartCurrency}`
    : "";

  return `${entry.counterpartOwner}${accountSuffix}${currencySuffix}`;
}

export function mapDashboardActivity(
  entries: readonly DashboardActivityEntry[],
  now = new Date(),
): ActivityItem[] {
  return entries.map((entry) => {
    const direction = entry.amount > 0 ? "credit" : "debit";

    let title = "Account adjustment";
    let detail = "Balance updated on this account.";

    if (entry.transferId !== null) {
      if (direction === "credit") {
        title = "Transfer received";
        detail = formatCounterpartyDetail(
          entry,
          "Transfer received from another account.",
        );
      } else {
        title = "Transfer sent";
        detail = formatCounterpartyDetail(
          entry,
          "Transfer sent to another account.",
        );
      }
    }

    return {
      id: entry.id,
      title,
      detail,
      amount: `${direction === "credit" ? "+" : "-"}${formatMoneyFromCents(
        entry.amount,
        entry.currency,
      )}`,
      direction,
      time: formatActivityTime(entry.createdAt, now),
    };
  });
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
  activity: readonly DashboardActivityEntry[],
  userName: string,
  isVerified: boolean,
): DashboardPageViewModel {
  return {
    userName,
    accounts: mapDashboardAccounts(accounts),
    brief: buildDashboardBrief(accounts, isVerified),
    activity: mapDashboardActivity(activity),
  };
}
