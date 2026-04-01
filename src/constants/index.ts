import { LayoutDashboard, CreditCard, ShieldCheck } from "lucide-react";

export const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    active: true,
  },
  {
    href: "/dashboard",
    label: "Accounts",
    icon: CreditCard,
    active: false,
  },
  {
    href: "/dashboard",
    label: "Security",
    icon: ShieldCheck,
    active: false,
  },
  {
    href: "/dashboard",
    label: "Settings",
    icon: LayoutDashboard,
    active: false,
  },
];
