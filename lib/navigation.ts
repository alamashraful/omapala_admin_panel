import type { Route } from "next";

type AdminNavigationItem = {
  href: Route;
  label: string;
  icon: string;
};

export const adminNavigation: AdminNavigationItem[] = [
  { href: "/admin", label: "Dashboard", icon: "Dashboard" },
  { href: "/admin/moderation", label: "Moderation", icon: "Gavel" },
  { href: "/admin/reports", label: "Reports", icon: "Report" },
  { href: "/admin/users", label: "Users", icon: "Group" },
  { href: "/admin/policies", label: "Policies", icon: "Policy" },
  { href: "/admin/config", label: "Config", icon: "Settings" },
  { href: "/admin/analytics", label: "Analytics", icon: "Analytics" }
];
