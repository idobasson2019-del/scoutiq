"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Target, UserRound, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Monogram, EmptyState, StatBar } from "@/components/common/misc";
import { NeedStatusBadge, UrgencyBadge, PlayerStatusBadge } from "@/components/common/status-badges";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useNeeds } from "@/lib/needs-store";
import { usePlayers } from "@/lib/players-store";
import {
  label,
  positionLabels,
  footLabels,
  dealTypeLabels,
} from "@/lib/i18n/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function NeedDetailPage() {
  const id = useSearchParams().get("id") ?? "";
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { getPlayer } = usePlayers();
  const { getNeed, removeNeed } = useNeeds();
  const router = useRouter();
  const need = getNeed(id);
  const [note, setNote] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!need) {
    return <EmptyState icon={Target} title={t("common.noResults")} />;
  }

  const proposed = need.proposedPlayerIds.map((pid) => getPlayer(pid)).filter(Boolean);

  const details: { label: string; value: string }[] = [
    { label: t("needs.field.position"), value: label(positionLabels, need.position, lang) },
    { label: t("needs.field.secondaryPosition"), value: label(positionLabels, need.secondaryPosition, lang) },
    { label: t("needs.field.count"), value: String(need.count) },
    { label: t("filter.age"), value: `${need.minAge}–${need.maxAge}` },
    { label: t("needs.field.foot"), value: label(footLabels, need.foot, lang) },
    { label: t("needs.field.minHeight"), value: `${need.minHeight} ${t("common.cm")}` },
    { label: t("needs.field.transferBudget"), value: formatCurrency(need.transferBudget, "EUR", lang) },
    { label: t("needs.field.maxSalary"), value: `${formatCurrency(need.maxSalary, "EUR", lang)}/y` },
    { label: t("needs.field.dealType"), value: label(dealTypeLabels, need.dealType, lang) },
    { label: t("needs.field.deadline"), value: formatDate(need.deadline, lang) },
    { label: t("needs.field.formation"), value: need.formation },
    { label: t("needs.field.playStyle"), value: need.playStyle },
  ];

  const timeline = [
    { t: `${t("needs.openedBy")}: ${need.openedBy}`, d: need.openedDate },
    { t: t("needs.title"), d: need.openedDate },
    { t: `${t("needs.proposedPlayers")}: ${need.proposedPlayerIds.length}`, d: need.openedDate },
  ];

  return (
    <>
      <PageHeader
        title={need.title}
        breadcrumbs={[{ label: t("nav.needs"), href: "/needs" }, { label: need.title }]}
        actions={
          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={need.urgency} />
            <NeedStatusBadge status={need.status} />
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={t("needs.delete")}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t("needs.details")}</CardTitle></CardHeader>
            <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex items-center justify-between border-b border-border/60 py-1.5 text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
              <div className="sm:col-span-2">
                <div className="mb-1 text-sm text-muted-foreground">{t("needs.field.keyAttributes")}</div>
                <div className="flex flex-wrap gap-2">
                  {need.keyAttributes.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
                </div>
              </div>
              {need.notes && (
                <div className="sm:col-span-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <div className="mb-1 text-xs text-muted-foreground">{t("needs.field.notes")}</div>
                  {need.notes}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("needs.proposedPlayers")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {proposed.length === 0 ? (
                <EmptyState icon={UserRound} title={t("needs.noProposed")} body={t("needs.noProposedBody")} />
              ) : (
                proposed.map((p) => {
                  const fit = Math.min(98, p!.scoutingScore + (p!.position === need.position ? 8 : 0));
                  return (
                    <Link key={p!.id} href={`/players/view?id=${p!.id}`} className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:border-primary/40">
                      <Monogram name={p!.name} color={p!.photoColor} imageUrl={p!.photoUrl} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p!.name}</div>
                        <div className="text-xs text-muted-foreground">{label(positionLabels, p!.position, lang)} · {p!.currentTeam}</div>
                      </div>
                      <div className="hidden w-40 sm:block">
                        <StatBar label={t("needs.matchFit")} value={fit} />
                      </div>
                      <PlayerStatusBadge status={p!.status} />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("common.status")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label={t("needs.openedBy")} value={need.openedBy} />
              <Row label={t("needs.openedDate")} value={formatDate(need.openedDate, lang)} />
              <Row label={t("needs.field.deadline")} value={formatDate(need.deadline, lang)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{t("needs.timeline")}</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-s border-border ps-5">
                {timeline.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="text-sm font-medium">{e.t}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(e.d, lang)}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{t("common.addNote")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("common.notePlaceholder")} />
              <Button className="w-full" onClick={() => { setNote(""); toast(t("common.saved")); }}>{t("common.save")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("needs.deleteConfirm")}
        description={t("needs.deleteBody")}
        destructive
        confirmLabel={t("needs.delete")}
        onConfirm={() => { removeNeed(need.id); toast(t("needs.deleted")); router.push("/needs"); }}
      />
    </>
  );
}

function Row({ label: l, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
