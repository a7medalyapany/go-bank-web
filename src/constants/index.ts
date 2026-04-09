import type { NavIconKey } from "@/components/Sidebar/NavLink";

export interface NavItem {
  href: string;
  label: string;
  iconKey: NavIconKey;
  exact: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    iconKey: "LayoutDashboard",
    exact: true,
  },
  {
    href: "/accounts",
    label: "Accounts",
    iconKey: "CreditCard",
    exact: false,
  },
  {
    href: "/transfers",
    label: "Transfers",
    iconKey: "ArrowLeftRight",
    exact: false,
  },
  {
    href: "/settings",
    label: "Settings",
    iconKey: "Settings",
    exact: true,
  },
];
