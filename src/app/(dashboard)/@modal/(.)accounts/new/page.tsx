// Intercepting route — activates when /accounts/new is navigated to
// via client-side navigation from /accounts.
// On hard refresh/direct URL, Next.js falls through to the real page at
// (dashboard)/accounts/new/page.tsx.

import { getAccountsSnapshot } from "@/lib/accounts/accounts-snapshot";
import { CreateAccountModal } from "@/components/accounts/CreateAccountModal";

export default async function InterceptedNewAccountPage() {
  const { availableCurrencies, canCreate } = await getAccountsSnapshot();
  const limitReached = !canCreate;

  return (
    <CreateAccountModal
      availableCurrencies={availableCurrencies}
      limitReached={limitReached}
    />
  );
}
