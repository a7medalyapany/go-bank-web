import { AccountCard } from "./AccountCard";
import { AccountStackCarousel } from "./AccountStackCarousel";
import { AccountStackEmpty } from "./AccountStackEmpty";

import type { DashboardAccountCard } from "@/lib/dashboard/view-models";

interface AccountStackPreviewProps {
  featured: DashboardAccountCard | null;
  accounts: DashboardAccountCard[];
}

export function AccountStackPreview({
  featured,
  accounts,
}: AccountStackPreviewProps) {
  const stack = featured ? [featured, ...accounts] : accounts;

  if (stack.length === 0) {
    return <AccountStackEmpty />;
  }

  if (stack.length === 1) {
    return (
      <div className="relative h-full min-h-52">
        <AccountCard account={stack[0]} index={0} />
      </div>
    );
  }

  return <AccountStackCarousel stack={stack} />;
}
