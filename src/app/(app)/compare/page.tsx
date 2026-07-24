"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GitCompareArrows, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monogram, EmptyState } from "@/components/common/misc";
import { RiskBadge } from "@/components/common/status-badges";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { usePlayers, scopePlayers } from "@/lib/players-store";
import { withStatDefaults } from "@/lib/stats";
import { reportForPlayer } from "@/data/reports";
import { label, positionLabels, footLabels } from "@/lib/i18n/labels";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Player } from "@/types";

/** Stats with defaults filled in, for players saved before a field existed. */
const st = (p: Player) => withStatDefaults(p.stats);

type MetricDir = "high" | "low" | "none";
interface Metric {
  label: string;
  get: (p: Player) => number | string;
  raw?: (p: Player) => number;
  dir: MetricDir;
}

export default function ComparePage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const params = useSearchParams();
  const { user, isAdmin } = useAuth();
  const { players: allPlayers, getPlayer } = usePlayers();
  const pool = scopePlayers(allPlayers, user?.teamId ?? null, isAdmin);

  const initial = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 4);
  const [selected, setSelected] = useState<string[]>(
    initial.length ? initial : pool.slice(0, 2).map((p) => p.id),
  );

  const players = selected.map((id) => getPlayer(id)).filter(Boolean) as Player[];

  const addable = pool.filter((p) => !selected.includes(p.id));

  const add = (id: string) => {
    if (selected.length >= 4) {
      toast(t("compare.max"), "info");
      return;
    }
    setSelected((s) => [...s, id]);
  };
  const remove = (id: string) => setSelected((s) => s.filter((x) => x !== id));

  const metrics: Metric[] = useMemo(
    () => [
      { label: t("col.age"), get: (p) => `${p.age}`, raw: (p) => p.age, dir: "low" },
      { label: t("col.position"), get: (p) => label(positionLabels, p.position, lang), dir: "none" },
      { label: t("col.height"), get: (p) => `${p.height} ${t("common.cm")}`, raw: (p) => p.height, dir: "high" },
      { label: t("col.foot"), get: (p) => label(footLabels, p.foot, lang), dir: "none" },
      { label: t("col.marketValue"), get: (p) => formatCurrency(p.marketValue, "EUR", lang), dir: "none" },
      { label: t("profile.salaryEst"), get: (p) => `${formatCurrency(p.salary, "EUR", lang)}`, dir: "none" },
      { label: t("profile.contractEnd"), get: (p) => formatDate(p.contractEnd, lang), dir: "none" },
      { label: t("stat.goals"), get: (p) => `${st(p).goals}`, raw: (p) => st(p).goals, dir: "high" },
      { label: t("stat.assists"), get: (p) => `${st(p).assists}`, raw: (p) => st(p).assists, dir: "high" },
      { label: t("stat.appearances"), get: (p) => `${st(p).appearances}`, raw: (p) => st(p).appearances, dir: "high" },
      { label: t("stat.minutes"), get: (p) => `${st(p).minutes}`, raw: (p) => st(p).minutes, dir: "high" },
      { label: t("stat.yellowCards"), get: (p) => `${st(p).yellowCards}`, raw: (p) => st(p).yellowCards, dir: "low" },
      { label: t("stat.redCards"), get: (p) => `${st(p).redCards}`, raw: (p) => st(p).redCards, dir: "low" },
      { label: t("stat.passAccuracy"), get: (p) => `${st(p).passAccuracy}`, raw: (p) => st(p).passAccuracy, dir: "high" },
      { label: t("stat.defensiveRating"), get: (p) => `${st(p).defensiveRating}`, raw: (p) => st(p).defensiveRating, dir: "high" },
    ],
    [t, lang],
  );

  const leaderIndex = (m: Metric): number => {
    if (m.dir === "none" || !m.raw) return -1;
    const vals = players.map(m.raw);
    const best = m.dir === "high" ? Math.max(...vals) : Math.min(...vals);
    const winners = vals.filter((v) => v === best);
    if (winners.length !== 1) return -1; // no unique leader → don't highlight
    return vals.indexOf(best);
  };

  return (
    <>
      <PageHeader title={t("compare.title")} subtitle={t("compare.subtitle")} />

      {players.length < 2 ? (
        <EmptyState icon={GitCompareArrows} title={t("compare.selectPrompt")} />
      ) : (
        <Card className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky start-0 z-10 min-w-[160px] bg-card p-4 text-start align-bottom">
                  {selected.length < 4 && (
                    <Select onValueChange={add} value="">
                      <SelectTrigger className="h-9"><SelectValue placeholder={t("compare.addPlayer")} /></SelectTrigger>
                      <SelectContent>
                        {addable.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </th>
                {players.map((p) => (
                  <th key={p.id} className="min-w-[180px] p-4 align-bottom">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <button
                        onClick={() => remove(p.id)}
                        className="self-end text-muted-foreground hover:text-destructive"
                        aria-label={t("compare.remove")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Monogram name={p.name} color={p.photoColor} imageUrl={p.photoUrl} size={56} />
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.currentTeam}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, mi) => {
                const li = leaderIndex(m);
                return (
                  <tr key={mi} className="border-t border-border">
                    <td className="sticky start-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground">{m.label}</td>
                    {players.map((p, pi) => (
                      <td
                        key={p.id}
                        className={cn(
                          "px-4 py-2.5 text-center tabular-nums",
                          li === pi && "font-semibold text-primary",
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {m.get(p)}
                          {li === pi && <span className="rounded bg-primary/15 px-1 text-[10px] font-medium text-primary">{t("compare.leader")}</span>}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="border-t border-border">
                <td className="sticky start-0 z-10 bg-card px-4 py-2.5 font-medium text-muted-foreground">{t("report.risk")}</td>
                {players.map((p) => (
                  <td key={p.id} className="px-4 py-2.5 text-center"><div className="flex justify-center"><RiskBadge risk={p.risk} /></div></td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="sticky start-0 z-10 bg-card px-4 py-2.5 align-top font-medium text-muted-foreground">{t("report.strengths")}</td>
                {players.map((p) => (
                  <td key={p.id} className="px-4 py-2.5 align-top">
                    <div className="flex flex-wrap justify-center gap-1">
                      {(reportForPlayer(p.id)?.strengths ?? []).slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
