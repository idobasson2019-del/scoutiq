"use client";

import Link from "next/link";
import {
  Users,
  Target,
  FileText,
  Bookmark,
  Clock,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monogram } from "@/components/common/misc";
import { PlayerStatusBadge, NeedStatusBadge, RecommendationBadge } from "@/components/common/status-badges";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { usePlayers, scopePlayers } from "@/lib/players-store";
import { useNeeds } from "@/lib/needs-store";
import { useReports } from "@/lib/reports-store";
import { watchlist, notifications, conversations } from "@/data/misc";
import { label, positionLabels } from "@/lib/i18n/labels";
import { cn, formatDate, timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { t, lang, dir } = useI18n();
  const { user, isAdmin } = useAuth();

  const { players: allPlayers } = usePlayers();
  const players = scopePlayers(allPlayers, user?.teamId ?? null, isAdmin);
  const { needs } = useNeeds();
  const { reports } = useReports();
  const teamReports = reports;
  const teamWatch = watchlist;

  const openNeeds = needs.filter(
    (n) => !["completed", "closed"].includes(n.status),
  );
  const newReports = teamReports.filter((r) => !r.read);
  const pending = players.filter((p) =>
    ["proposed", "in_review", "need_info"].includes(p.status),
  );
  const unreadMsgs = conversations.reduce((sum, c) => sum + c.unread, 0);

  const recentPlayers = [...players]
    .sort((a, b) => b.proposedDate.localeCompare(a.proposedDate))
    .slice(0, 5);
  const recentReports = [...teamReports]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const alerts = notifications
    .filter((n) => ["contract_ending", "review_due", "need_updated"].includes(n.type))
    .slice(0, 4);

  const tasks = [
    ...newReports.slice(0, 2).map((r) => ({
      id: "rt-" + r.id,
      text: `${t("dash.task.review")}: ${r.playerName}`,
      href: `/players/view?id=${r.playerId}`,
    })),
    ...pending.slice(0, 2).map((p) => ({
      id: "pt-" + p.id,
      text: `${t("dash.task.decision")} ${p.name}`,
      href: `/players/view?id=${p.id}`,
    })),
    ...players
      .filter((p) => p.status === "contact")
      .slice(0, 1)
      .map((p) => ({
        id: "ct-" + p.id,
        text: `${t("dash.task.contact")} ${p.name}`,
        href: `/players/view?id=${p.id}`,
      })),
  ];

  return (
    <>
      <PageHeader
        title={`${t("dash.welcome")}, ${user?.name?.split(" ")[0] ?? ""}`}
        subtitle={t("dash.title")}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label={t("dash.kpi.proposed")} value={players.length} icon={Users} href="/players" accent />
        <KpiCard label={t("dash.kpi.openNeeds")} value={openNeeds.length} icon={Target} href="/needs" />
        <KpiCard label={t("dash.kpi.newReports")} value={newReports.length} icon={FileText} href="/reports" />
        <KpiCard label={t("dash.kpi.watchlist")} value={teamWatch.length} icon={Bookmark} href="/watchlist" />
        <KpiCard label={t("dash.kpi.pending")} value={pending.length} icon={Clock} href="/players" />
        <KpiCard label={t("dash.kpi.unread")} value={unreadMsgs} icon={MessageSquare} href="/messages" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dash.pipeline")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("dash.pipelineSub")}</p>
          </CardHeader>
          <CardContent>
            <PipelineChart players={players} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("dash.openTasks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("dash.noTasks")}</p>
            ) : (
              tasks.map((task) => (
                <Link
                  key={task.id}
                  href={task.href}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{task.text}</span>
                  <ArrowLeft className={cn("h-3.5 w-3.5 text-muted-foreground", dir === "ltr" && "rotate-180")} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("dash.newPlayers")}</CardTitle>
            <Link href="/players" className="text-xs text-primary hover:underline">{t("top.viewAll")}</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentPlayers.map((p) => (
              <Link key={p.id} href={`/players/view?id=${p.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40">
                <Monogram name={p.name} color={p.photoColor} imageUrl={p.photoUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {label(positionLabels, p.position, lang)} · {p.currentTeam}
                  </div>
                </div>
                <PlayerStatusBadge status={p.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("dash.activeNeeds")}</CardTitle>
            <Link href="/needs" className="text-xs text-primary hover:underline">{t("top.viewAll")}</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {openNeeds.slice(0, 5).map((n) => (
              <Link key={n.id} href={`/needs/view?id=${n.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                  {n.position}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.proposedPlayerIds.length} {t("needs.proposedPlayers")}</div>
                </div>
                <NeedStatusBadge status={n.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("dash.recentReports")}</CardTitle>
            <Link href="/reports" className="text-xs text-primary hover:underline">{t("top.viewAll")}</Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentReports.map((r) => (
              <Link key={r.id} href={`/players/view?id=${r.playerId}&tab=report`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.playerName}</div>
                  <div className="text-xs text-muted-foreground">{r.author} · {formatDate(r.date, lang)}</div>
                </div>
                <RecommendationBadge rec={r.recommendation} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.importantAlerts")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.body}</div>
                </div>
                <span className="text-[11px] text-muted-foreground">{timeAgo(a.time, lang)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
