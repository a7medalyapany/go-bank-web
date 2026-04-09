// Intercepting route — activates when /accounts/new is navigated to
// via client-side navigation from /accounts.
// On hard refresh/direct URL, Next.js falls through to the real page at
// (dashboard)/accounts/new/page.tsx.

import { goApi } from "@/lib/api/client";
import { unwrapAccounts } from "@/lib/dashboard/dashboard-snapshot";
import { CreateAccountModal } from "@/components/accounts/CreateAccountModal";
import type { SupportedCurrency } from "@/lib/actions/accounts";

const ALL_CURRENCIES: SupportedCurrency[] = ["USD", "EUR", "EGP"];
const MAX_ACCOUNTS = 3;

export default async function InterceptedNewAccountPage() {
  let usedCurrencies: SupportedCurrency[] = [];
  let accountCount = 0;

  try {
    const raw = await goApi.listAccounts(1, 10);
    const accounts = unwrapAccounts(raw);
    accountCount = accounts.length;
    usedCurrencies = accounts.map((a) => a.currency as SupportedCurrency);
  } catch {
    usedCurrencies = [];
  }

  const availableCurrencies = ALL_CURRENCIES.filter(
    (c) => !usedCurrencies.includes(c),
  );
  const limitReached = accountCount >= MAX_ACCOUNTS;

  return (
    <CreateAccountModal
      availableCurrencies={availableCurrencies}
      limitReached={limitReached}
    />
  );
}
