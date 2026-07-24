import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  Bookmark,
  GitCompareArrows,
  MessageSquare,
  Bell,
  Settings,
  Building2,
  UserCog,
  FileSignature,
  Inbox,
  Database,
  Files,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  key: string; // i18n key
  href: string;
  icon: LucideIcon;
}

export const workspaceNav: NavItem[] = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.players", href: "/players", icon: Users },
  { key: "nav.needs", href: "/needs", icon: Target },
  { key: "nav.reports", href: "/reports", icon: FileText },
  { key: "nav.watchlist", href: "/watchlist", icon: Bookmark },
  { key: "nav.compare", href: "/compare", icon: GitCompareArrows },
  { key: "nav.messages", href: "/messages", icon: MessageSquare },
  { key: "nav.notifications", href: "/notifications", icon: Bell },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

/** Head-of-scouting team management (create scouts within their own team). */
export const teamManageNav: NavItem = {
  key: "nav.teamUsers",
  href: "/team/users",
  icon: UsersRound,
};

export const adminNav: NavItem[] = [
  { key: "nav.teams", href: "/admin/teams", icon: Building2 },
  { key: "nav.users", href: "/admin/users", icon: UserCog },
  { key: "nav.contracts", href: "/admin/contracts", icon: FileSignature },
  { key: "nav.allRequests", href: "/admin/requests", icon: Inbox },
  { key: "nav.allPlayers", href: "/admin/players", icon: Database },
  { key: "nav.allReports", href: "/admin/reports", icon: Files },
  { key: "nav.revenue", href: "/admin/revenue", icon: Wallet },
];

/**
 * Route access per role. `"all"` = every route (owner). Otherwise an allow-list
 * of route prefixes. This is the single source of truth for both nav rendering
 * and the route guard, so a hidden item can never be reached by typing its URL.
 */
export const ROLE_ROUTES: Record<Role, "all" | string[]> = {
  owner: "all",
  scout_lead: [
    "/dashboard",
    "/players",
    "/needs",
    "/reports",
    "/watchlist",
    "/compare",
    "/messages",
    "/notifications",
    "/settings",
    "/team/users",
  ],
  scout: [
    "/dashboard",
    "/players",
    "/reports",
    "/watchlist",
    "/notifications",
    "/settings",
  ],
};

export function isAllowed(pathname: string, role: Role | undefined): boolean {
  if (!role) return false;
  const allow = ROLE_ROUTES[role];
  if (allow === "all") return true;
  return allow.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

export function visibleWorkspaceNav(role: Role | undefined): NavItem[] {
  return workspaceNav.filter((item) => isAllowed(item.href, role));
}

export function canAccessAdmin(role: Role | undefined): boolean {
  return role === "owner";
}
