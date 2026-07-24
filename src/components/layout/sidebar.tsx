"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { visibleWorkspaceNav, adminNav, teamManageNav, canAccessAdmin } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role;
  const workspaceItems = visibleWorkspaceNav(role);
  const showAdmin = canAccessAdmin(role);
  const showTeamManage = role === "scout_lead";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {t("nav.workspace")}
        </p>
        {workspaceItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t(item.key)}
            active={isActive(item.href)}
          />
        ))}

        {showTeamManage && (
          <>
            <div className="my-3 border-t border-sidebar-border" />
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {t("nav.management")}
            </p>
            <NavLink
              href={teamManageNav.href}
              icon={teamManageNav.icon}
              label={t(teamManageNav.key)}
              active={isActive(teamManageNav.href)}
            />
          </>
        )}

        {showAdmin && (
          <>
            <div className="my-3 border-t border-sidebar-border" />
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {t("nav.adminSection")}
            </p>
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={t(item.key)}
                active={isActive(item.href)}
              />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
