"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  GitCompareArrows,
  Video,
  StickyNote,
  History,
  Ruler,
  Shirt,
  CalendarClock,
  UserRound,
  Pencil,
  Trash2,
  FileText,
  FilePlus2,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Monogram, StatBar, EmptyState } from "@/components/common/misc";
import { ScoutingReportView } from "@/components/players/scouting-report";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { usePlayers } from "@/lib/players-store";
import { useReports } from "@/lib/reports-store";
import { AddPlayerDialog } from "@/components/players/add-player-dialog";
import { WriteReportDialog } from "@/components/players/write-report-dialog";
import { EditStatsDialog } from "@/components/players/edit-stats-dialog";
import { withStatDefaults, statFieldsFor, isGoalkeeper } from "@/lib/stats";
import { AddVideoDialog, youTubeId } from "@/components/players/add-video-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  label,
  positionLabels,
  footLabels,
  availabilityLabels,
} from "@/lib/i18n/labels";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function InfoTile({ icon: Icon, label: l, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{l}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function PlayerProfilePage() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const router = useRouter();
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { getPlayer, removePlayer, updatePlayer } = usePlayers();
  const { getReportForPlayer, removeReport } = useReports();

  const player = getPlayer(id);
  const report = player ? getReportForPlayer(player.id) : undefined;

  const [watching, setWatching] = useState(false);
  const [notes, setNotes] = useState<{ id: number; text: string; author: string; date: string }[]>([]);
  const [noteText, setNoteText] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [removeVideoId, setRemoveVideoId] = useState<string | null>(null);
  const [deleteReportOpen, setDeleteReportOpen] = useState(false);

  if (!player) {
    return (
      <EmptyState icon={UserRound} title={t("common.noResults")} body={t("common.noResultsBody")} />
    );
  }

  const defaultTab = params.get("tab") ?? "overview";
  // Fill in any stat a player saved earlier might be missing.
  const stats = withStatDefaults(player.stats);
  // Goalkeepers get their own set of stats — see lib/stats.ts.
  const statFields = statFieldsFor(player.position);

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes((n) => [
      { id: Date.now(), text: noteText.trim(), author: "You", date: new Date().toISOString() },
      ...n,
    ]);
    setNoteText("");
    toast(t("common.saved"));
  };

  const history = [
    { t: t("dash.newPlayers"), d: player.proposedDate },
    { t: report ? `${t("tab.report")} · ${report.author}` : "", d: report?.date ?? player.proposedDate },
  ].filter((h) => h.t);

  return (
    <>
      <PageHeader
        title={player.name}
        breadcrumbs={[
          { label: t("nav.players"), href: "/players" },
          { label: player.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => { setWatching((w) => !w); toast(watching ? t("watch.removed") : t("watch.added")); }}>
              <Bookmark className={watching ? "fill-primary text-primary" : ""} /> {t("profile.addToWatchlist")}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/compare?ids=${player.id}`)}>
              <GitCompareArrows /> {t("profile.compare")}
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" size="icon" aria-label={t("players.edit")} onClick={() => setEditOpen(true)}>
                  <Pencil />
                </Button>
                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" aria-label={t("players.delete")} onClick={() => setDeleteOpen(true)}>
                  <Trash2 />
                </Button>
              </>
            )}
          </>
        }
      />

      {/* Header card */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center">
          <Monogram name={player.name} color={player.photoColor} imageUrl={player.photoUrl} size={88} />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{player.name}</h2>
              <Badge variant="outline">#{player.shirtNumber}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {player.currentTeam} · {player.league} · {player.nationality} · {player.age} {t("common.years")}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge>{label(positionLabels, player.position, lang)}</Badge>
              <Badge variant="secondary">{label(positionLabels, player.secondaryPosition, lang)}</Badge>
              <Badge variant="outline">{label(availabilityLabels, player.availability, lang)}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">{t("profile.marketValue")}</div>
              <div className="text-lg font-semibold">{formatCurrency(player.marketValue, "EUR", lang)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("tab.overview")}</TabsTrigger>
          <TabsTrigger value="report">{t("tab.report")}</TabsTrigger>
          <TabsTrigger value="stats">{t("tab.stats")}</TabsTrigger>
          <TabsTrigger value="videos">{t("tab.videos")}</TabsTrigger>
          <TabsTrigger value="contract">{t("tab.contract")}</TabsTrigger>
          <TabsTrigger value="fit">{t("tab.fit")}</TabsTrigger>
          <TabsTrigger value="notes">{t("tab.notes")}</TabsTrigger>
          <TabsTrigger value="history">{t("tab.history")}</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile icon={UserRound} label={t("col.position")} value={`${label(positionLabels, player.position, lang)} / ${label(positionLabels, player.secondaryPosition, lang)}`} />
            <InfoTile icon={Shirt} label={t("profile.shirtNumber")} value={`#${player.shirtNumber}`} />
            <InfoTile icon={UserRound} label={t("col.foot")} value={label(footLabels, player.foot, lang)} />
            <InfoTile icon={Ruler} label={t("col.height")} value={`${player.height} ${t("common.cm")}`} />
            <InfoTile icon={CalendarClock} label={t("profile.contractEnd")} value={formatDate(player.contractEnd, lang)} />
            <InfoTile icon={UserRound} label={t("profile.salaryEst")} value={`${formatCurrency(player.salary, "EUR", lang)}/y`} />
          </div>
          {report && (
            <Card className="mt-4">
              <CardHeader><CardTitle>{t("report.summary")}</CardTitle></CardHeader>
              <CardContent><p className="text-sm leading-relaxed text-foreground/90">{report.summary}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Report */}
        <TabsContent value="report">
          {report ? (
            <div className="space-y-3">
              {/* Only the owner may write, edit or delete scouting reports. */}
              {isAdmin && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
                    <Pencil className="h-4 w-4" /> {t("report.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteReportOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" /> {t("report.delete")}
                  </Button>
                </div>
              )}
              <ScoutingReportView report={report} />
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={t("report.empty")}
              body={isAdmin ? t("report.emptyBody") : t("report.emptyBodyReadonly")}
              action={
                isAdmin ? (
                  <Button onClick={() => setReportOpen(true)}>
                    <FilePlus2 /> {t("report.write")}
                  </Button>
                ) : undefined
              }
            />
          )}
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats">
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>{t("stat.season")}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {player.currentTeam} · {player.league}
                  {isGoalkeeper(player.position) && ` · ${t("stat.gkNote")}`}
                </p>
              </div>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setStatsOpen(true)}>
                  <Pencil className="h-4 w-4" /> {t("stats.edit")}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {statFields
                  .filter((f) => f.kind === "count")
                  .map((f) => (
                    <Stat key={f.key} label={t(f.labelKey)} value={stats[f.key]} accent={f.accent} />
                  ))}
              </div>
              <div className="grid gap-x-8 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
                {statFields
                  .filter((f) => f.kind === "rating")
                  .map((f) => (
                    <StatBar key={f.key} label={t(f.labelKey)} value={stats[f.key]} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos */}
        <TabsContent value="videos">
          {isAdmin && (
            <div className="mb-3 flex justify-end">
              <Button size="sm" onClick={() => setVideoOpen(true)}>
                <Plus className="h-4 w-4" /> {t("videos.add")}
              </Button>
            </div>
          )}
          {(player.videos?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Video}
              title={t("videos.empty")}
              body={isAdmin ? t("videos.emptyBodyOwner") : t("videos.emptyBody")}
              action={
                isAdmin ? (
                  <Button onClick={() => setVideoOpen(true)}>
                    <Plus /> {t("videos.add")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {player.videos!.map((v) => {
                const ytId = v.kind === "youtube" ? youTubeId(v.url) : null;
                return (
                  <Card key={v.id} className="overflow-hidden">
                    <div className="aspect-video bg-black/40">
                      {ytId ? (
                        <iframe
                          className="h-full w-full"
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={v.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video className="h-full w-full" src={v.url} controls preload="metadata" />
                      )}
                    </div>
                    <CardContent className="flex items-start justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{v.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {player.name} · {player.currentTeam}
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={t("videos.remove")}
                          onClick={() => setRemoveVideoId(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Contract */}
        <TabsContent value="contract">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoTile icon={UserRound} label={t("contract.currentClub")} value={player.currentTeam} />
            <InfoTile icon={CalendarClock} label={t("profile.contractEnd")} value={formatDate(player.contractEnd, lang)} />
            <InfoTile icon={UserRound} label={t("contract.wageEstimate")} value={`${formatCurrency(player.salary, "EUR", lang)}/y`} />
            <InfoTile icon={UserRound} label={t("profile.marketValue")} value={formatCurrency(player.marketValue, "EUR", lang)} />
            <InfoTile icon={UserRound} label={t("contract.releaseClause")} value={t("contract.noClause")} />
          </div>
        </TabsContent>

        {/* Fit */}
        <TabsContent value="fit">
          <Card>
            <CardHeader><CardTitle>{t("fit.title")}</CardTitle></CardHeader>
            <CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <StatBar label={t("fit.formationFit")} value={report?.styleFit ?? 78} />
              <StatBar label={t("fit.styleFit")} value={report?.tactical ?? 76} />
              <StatBar label={t("fit.roleFit")} value={report?.technical ?? 80} />
              <div className="sm:col-span-2 rounded-md border border-border bg-muted/30 p-4 text-sm text-foreground/90">
                <div className="mb-1 font-medium">{t("fit.summary")}</div>
                {report?.summary.split(".")[0]}.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-5">
              <div className="flex gap-2">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder={t("common.notePlaceholder")} className="min-h-[60px]" />
                <Button onClick={addNote} className="self-end">{t("common.addNote")}</Button>
              </div>
              <div className="mt-4 space-y-3">
                {notes.length === 0 ? (
                  <EmptyState icon={StickyNote} title={t("notes.empty")} body={t("notes.emptyBody")} />
                ) : (
                  notes.map((n) => (
                    <div key={n.id} className="rounded-md border border-border p-3">
                      <p className="text-sm">{n.text}</p>
                      <div className="mt-1 text-xs text-muted-foreground">{n.author} · {formatDate(n.date, lang)}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-5">
              <ol className="relative space-y-4 border-s border-border ps-5">
                {history.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="text-sm font-medium">{h.t}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(h.d, lang)}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Write / edit scouting report — owner only */}
      {isAdmin && (
        <WriteReportDialog open={reportOpen} onOpenChange={setReportOpen} player={player} existing={report} />
      )}

      {/* Owner-only: edit & delete player, stats and videos */}
      {isAdmin && (
        <>
          <EditStatsDialog open={statsOpen} onOpenChange={setStatsOpen} player={player} />
          <ConfirmDialog
            open={deleteReportOpen}
            onOpenChange={setDeleteReportOpen}
            title={t("report.deleteConfirm")}
            description={t("report.deleteBody")}
            destructive
            confirmLabel={t("report.delete")}
            onConfirm={() => {
              if (report) removeReport(report.id);
              toast(t("report.deleted"));
            }}
          />
          <AddVideoDialog open={videoOpen} onOpenChange={setVideoOpen} player={player} />
          <ConfirmDialog
            open={removeVideoId !== null}
            onOpenChange={(o) => !o && setRemoveVideoId(null)}
            title={t("videos.removeConfirm")}
            destructive
            confirmLabel={t("videos.remove")}
            onConfirm={() => {
              if (!removeVideoId) return;
              updatePlayer(player.id, {
                videos: (player.videos ?? []).filter((v) => v.id !== removeVideoId),
              });
              toast(t("videos.removed"));
            }}
          />
          <AddPlayerDialog open={editOpen} onOpenChange={setEditOpen} editing={player} />
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={t("players.deleteConfirm")}
            description={t("players.deleteBody")}
            destructive
            confirmLabel={t("players.delete")}
            onConfirm={() => { removePlayer(player.id); toast(t("players.deleted")); router.push("/players"); }}
          />
        </>
      )}
    </>
  );
}

function Stat({
  label: l,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "warning" | "destructive";
}) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 text-center">
      <div
        className={cn(
          "text-2xl font-semibold tabular-nums",
          accent === "warning" && value > 0 && "text-warning",
          accent === "destructive" && value > 0 && "text-destructive",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{l}</div>
    </div>
  );
}
