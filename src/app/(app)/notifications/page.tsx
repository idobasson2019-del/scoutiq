"use client";

import { useState } from "react";
import {
  UserPlus,
  FileText,
  Target,
  MessageSquare,
  ArrowLeftRight,
  CalendarClock,
  Bell,
  Users,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/misc";
import { useI18n } from "@/lib/i18n";
import { notifications as seed } from "@/data/misc";
import { cn, timeAgo } from "@/lib/utils";
import type { NotificationType } from "@/types";

const iconFor: Record<NotificationType, LucideIcon> = {
  player_added: UserPlus,
  report_ready: FileText,
  need_updated: Target,
  message: MessageSquare,
  player_moved: ArrowLeftRight,
  contract_ending: CalendarClock,
  review_due: CalendarClock,
  user_added: Users,
  team_contract_ending: CalendarClock,
};

export default function NotificationsPage() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const list = filter === "unread" ? items.filter((n) => !n.read) : items;

  return (
    <>
      <PageHeader
        title={t("notif.title")}
        subtitle={t("notif.subtitle")}
        actions={
          <Button variant="outline" onClick={() => setItems((its) => its.map((n) => ({ ...n, read: true })))}>
            <CheckCheck /> {t("notif.markAllRead")}
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-1 rounded-md border border-border p-0.5 w-fit">
        <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>{t("notif.filter.all")}</Button>
        <Button variant={filter === "unread" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("unread")}>{t("notif.filter.unread")}</Button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Bell} title={t("notif.empty")} body={t("notif.emptyBody")} />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {list.map((n) => {
            const Icon = iconFor[n.type] ?? Bell;
            return (
              <button
                key={n.id}
                onClick={() => setItems((its) => its.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-start transition-colors hover:bg-muted/40",
                  !n.read && "bg-primary/[0.04]",
                )}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <span className="text-sm font-medium">{n.title}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.time, lang)}</span>
              </button>
            );
          })}
        </Card>
      )}
    </>
  );
}
