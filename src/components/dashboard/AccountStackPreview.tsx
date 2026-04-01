import type { DashboardAccount } from "@/lib/dashboard-snapshot";
import { AccountCard } from "./AccountCard";
import { AccountStackCarousel } from "./Accountstackcarousel";
import { AccountStackEmpty } from "./Accountstackempty";

interface AccountStackPreviewProps {
  featured: DashboardAccount;
  accounts: DashboardAccount[];
}

export function AccountStackPreview({
  featured,
  accounts,
}: AccountStackPreviewProps) {
  const stack = featured ? [featured, ...accounts] : accounts;

  if (!stack.length) {
    return <AccountStackEmpty />;
  }

  if (stack.length === 1) {
    return (
      <div className="relative h-full" style={{ minHeight: "208px" }}>
        <AccountCard account={stack[0]} index={0} />
      </div>
    );
  }

  return <AccountStackCarousel stack={stack} />;
}
