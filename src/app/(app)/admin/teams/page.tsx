"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pause, Play, Pencil, Trash2, ImagePlus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, TeamLogo } from "@/components/common/misc";
import { TeamStatusBadge } from "@/components/common/status-badges";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useTeams, CURRENCIES } from "@/lib/teams-store";
import { usePlayers } from "@/lib/players-store";
import { Monogram } from "@/components/common/misc";
import Link from "next/link";
import { label, positionLabels } from "@/lib/i18n/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const emptyForm = { name: "", country: "", league: "", contractStart: "", contractEnd: "", monthlyPrice: 0, currency: "EUR", logoUrl: "" };

export default function AdminTeamsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { teams, addTeam, updateTeam, removeTeam, setStatus } = useTeams();
  const { players } = usePlayers();
  const [proposedForTeam, setProposedForTeam] = useState<string | null>(null);

  /** Players actually proposed to a club (the stored count is not authoritative). */
  const playersOfTeam = (teamId: string) =>
    players.filter((p) => p.teamIds.includes(teamId));
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (id: string) => {
    const tm = teams.find((x) => x.id === id);
    if (!tm) return;
    setEditingId(id);
    setForm({ name: tm.name, country: tm.country, league: tm.league, contractStart: tm.contractStart, contractEnd: tm.contractEnd, monthlyPrice: tm.monthlyPrice, currency: tm.currency || "EUR", logoUrl: tm.logoUrl ?? "" });
    setDialogOpen(true);
  };
  const submitTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { updateTeam(editingId, form); toast(t("admin.teams.updated")); }
    else { addTeam(form); toast(t("admin.teams.created")); }
    setDialogOpen(false);
  };

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <PageHeader
        title={t("admin.teams.title")}
        subtitle={t("admin.teams.subtitle")}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("admin.teams.title") }]}
        actions={<Button onClick={openCreate}><Plus /> {t("admin.teams.new")}</Button>}
      />

      {teams.length === 0 ? (
        <EmptyState icon={Building2} title={t("admin.teams.empty")} body={t("admin.teams.emptyBody")}
          action={<Button onClick={openCreate}><Plus /> {t("admin.teams.new")}</Button>} />
      ) : (
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead>{t("admin.col.team")}</TableHead>
              <TableHead>{t("admin.col.country")}</TableHead>
              <TableHead>{t("admin.col.league")}</TableHead>
              <TableHead className="text-center">{t("admin.col.users")}</TableHead>
              <TableHead className="text-center">{t("admin.col.proposed")}</TableHead>
              <TableHead>{t("admin.col.account")}</TableHead>
              <TableHead>{t("admin.col.contractEnd")}</TableHead>
              <TableHead>{t("admin.col.monthly")}</TableHead>
              <TableHead className="whitespace-nowrap text-primary">{t("admin.col.revenue")}</TableHead>
              <TableHead>{t("admin.col.lastActivity")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((tm) => (
              <TableRow key={tm.id}>
                <TableCell><TeamLogo name={tm.name} color={tm.logoColor} logoUrl={tm.logoUrl} size={32} /></TableCell>
                <TableCell className="font-medium">{tm.name}</TableCell>
                <TableCell className="text-muted-foreground">{tm.country}</TableCell>
                <TableCell className="text-muted-foreground">{tm.league}</TableCell>
                <TableCell className="text-center tabular-nums">{tm.users}</TableCell>
                <TableCell className="text-center tabular-nums">
                  {playersOfTeam(tm.id).length > 0 ? (
                    <button
                      onClick={() => setProposedForTeam(tm.id)}
                      className="rounded px-2 py-0.5 font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {playersOfTeam(tm.id).length}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell><TeamStatusBadge status={tm.status} /></TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{formatDate(tm.contractEnd, lang)}</TableCell>
                <TableCell className="tabular-nums">{tm.monthlyPrice ? formatCurrency(tm.monthlyPrice, tm.currency, lang) : "—"}</TableCell>
                <TableCell className="whitespace-nowrap font-semibold tabular-nums text-primary">
                  {tm.monthlyPrice ? formatCurrency(tm.monthlyPrice * 12, tm.currency, lang) : "—"}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{formatDate(tm.lastActivity, lang)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setProposedForTeam(tm.id)}>
                        <Users className="h-4 w-4" /> {t("admin.teams.viewProposed")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(tm.id)}><Pencil className="h-4 w-4" /> {t("admin.teams.edit")}</DropdownMenuItem>
                      {tm.status === "suspended" ? (
                        <DropdownMenuItem onClick={() => { setStatus(tm.id, "active"); toast(t("admin.teams.reactivated")); }}>
                          <Play className="h-4 w-4" /> {t("admin.teams.reactivate")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setSuspendId(tm.id)}>
                          <Pause className="h-4 w-4" /> {t("admin.teams.suspend")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setRemoveId(tm.id)}>
                        <Trash2 className="h-4 w-4" /> {t("admin.teams.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      )}

      <ConfirmDialog
        open={suspendId !== null}
        onOpenChange={(o) => !o && setSuspendId(null)}
        title={t("admin.teams.suspendConfirm")}
        description={t("admin.teams.suspendBody")}
        destructive
        confirmLabel={t("admin.teams.suspend")}
        onConfirm={() => { if (suspendId) { setStatus(suspendId, "suspended"); toast(t("admin.teams.suspended")); } }}
      />

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title={t("admin.teams.deleteConfirm")}
        description={t("admin.teams.deleteBody")}
        destructive
        confirmLabel={t("admin.teams.delete")}
        onConfirm={() => { if (removeId) { removeTeam(removeId); toast(t("admin.teams.deleted")); } }}
      />

      {/* Players proposed to a specific club */}
      <Dialog open={proposedForTeam !== null} onOpenChange={(o) => !o && setProposedForTeam(null)}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>
              {t("admin.teams.proposedPlayers")}
              {proposedForTeam && ` — ${teams.find((x) => x.id === proposedForTeam)?.name ?? ""}`}
            </DialogTitle>
          </DialogHeader>
          {proposedForTeam && playersOfTeam(proposedForTeam).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("admin.teams.noProposed")}
            </p>
          ) : (
            <div className="space-y-1">
              {proposedForTeam &&
                playersOfTeam(proposedForTeam).map((p) => (
                  <Link
                    key={p.id}
                    href={`/players/view?id=${p.id}`}
                    onClick={() => setProposedForTeam(null)}
                    className="flex items-center gap-3 rounded-md border border-border p-2.5 transition-colors hover:border-primary/40"
                  >
                    <Monogram name={p.name} color={p.photoColor} imageUrl={p.photoUrl} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {label(positionLabels, p.position, lang)} · {p.currentTeam}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? t("admin.teams.editTitle") : t("admin.teams.create")}</DialogTitle></DialogHeader>
          <form onSubmit={submitTeam}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label>{t("admin.col.team")}</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label>{t("admin.col.country")}</Label><Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t("admin.col.league")}</Label><Input value={form.league} onChange={(e) => setForm((f) => ({ ...f, league: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t("admin.col.contractStart")}</Label><Input type="date" value={form.contractStart} onChange={(e) => setForm((f) => ({ ...f, contractStart: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t("admin.col.contractEnd")}</Label><Input type="date" value={form.contractEnd} onChange={(e) => setForm((f) => ({ ...f, contractEnd: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{t("admin.contract.monthly")}</Label><Input type="number" value={form.monthlyPrice} onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: Number(e.target.value) }))} /></div>
              <div className="space-y-1.5">
                <Label>{t("admin.contract.currency")}</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{t(`currency.${c}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t("admin.teams.logo")}</Label>
                <div className="flex items-center gap-3">
                  <TeamLogo name={form.name || "?"} color="#3b6ea5" logoUrl={form.logoUrl || undefined} size={48} />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={form.logoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      placeholder={t("admin.teams.logoUrl")}
                    />
                    <div className="flex items-center gap-2">
                      <Button asChild type="button" variant="outline" size="sm">
                        <label className="cursor-pointer">
                          <ImagePlus className="h-4 w-4" /> {t("admin.teams.logoUpload")}
                          <input type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
                        </label>
                      </Button>
                      {form.logoUrl && (
                        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}>
                          {t("admin.teams.logoRemove")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t("admin.teams.logoHint")}</p>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit">{editingId ? t("common.save") : t("common.create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
