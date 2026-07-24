"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Search, Bell, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { InstallAppButton } from "@/components/pwa/install-button";
import { Monogram } from "@/components/common/misc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useTeams } from "@/lib/teams-store";
import { notifications } from "@/data/misc";
import { label } from "@/lib/i18n/labels";
import { timeAgo } from "@/lib/utils";

export function Topbar() {
  const { t, lang } = useI18n();
  const { user, logout } = useAuth();
  const { teamName } = useTeams();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const roleLabel = user
    ? t(`role.${user.role}`)
    : "";
  const tName = user?.teamId ? teamName(user.teamId) : "ScoutIQ Network";
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 5);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/players?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-6">
      <form onSubmit={submitSearch} className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("top.search")}
          className="ps-9"
        />
      </form>

      <div className="ms-auto flex items-center gap-2">
        <InstallAppButton />
        <LanguageToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative" aria-label={t("nav.notifications")}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              {t("nav.notifications")}
              <Link href="/notifications" className="text-xs font-normal text-primary hover:underline">
                {t("top.viewAll")}
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recent.map((n) => (
              <DropdownMenuItem key={n.id} asChild>
                <Link href="/notifications" className="flex flex-col items-start gap-0.5">
                  <span className="flex w-full items-center gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    <span className="font-medium">{n.title}</span>
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{n.body}</span>
                  <span className="text-[11px] text-muted-foreground/70">{timeAgo(n.time, lang)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-start hover:bg-accent">
              <Monogram name={user?.name ?? "SQ"} color="hsl(var(--primary))" size={34} />
              <div className="hidden leading-tight md:block">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{tName}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
              <div className="mt-1 text-xs font-normal text-primary">{roleLabel} · {tName}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings"><UserIcon className="h-4 w-4" /> {t("top.profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings"><Settings className="h-4 w-4" /> {t("nav.settings")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { logout(); router.push("/login"); }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> {t("top.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
