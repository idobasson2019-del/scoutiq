"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Monogram } from "@/components/common/misc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { usePlayers, type NewPlayerInput } from "@/lib/players-store";
import { useTeams } from "@/lib/teams-store";
import type { Player } from "@/types";
import {
  label,
  positionLabels,
  footLabels,
  availabilityLabels,
  riskLabels,
} from "@/lib/i18n/labels";

const POSITIONS = ["GK", "RB", "LB", "CB", "DM", "CM", "AM", "RW", "LW", "ST"];

const empty: NewPlayerInput = {
  name: "",
  age: 20,
  nationality: "",
  currentTeam: "",
  league: "",
  position: "CM",
  secondaryPosition: "AM",
  foot: "right",
  height: 180,
  weight: 74,
  shirtNumber: 10,
  marketValue: 1000000,
  salary: 200000,
  contractEnd: "",
  agent: "",
  scoutingScore: 75,
  potential: 80,
  status: "new",
  availability: "transfer",
  risk: "low",
  photoUrl: "",
  teamId: "",
};

function toInput(p: Player): NewPlayerInput {
  return {
    name: p.name,
    age: p.age,
    nationality: p.nationality,
    currentTeam: p.currentTeam,
    league: p.league,
    position: p.position,
    secondaryPosition: p.secondaryPosition,
    foot: p.foot,
    height: p.height,
    weight: p.weight,
    shirtNumber: p.shirtNumber,
    marketValue: p.marketValue,
    salary: p.salary,
    contractEnd: p.contractEnd,
    agent: p.agent,
    scoutingScore: p.scoutingScore,
    potential: p.potential,
    status: p.status,
    availability: p.availability,
    risk: p.risk,
    photoUrl: p.photoUrl ?? "",
    teamId: p.teamIds[0] ?? "",
  };
}

export function AddPlayerDialog({
  open,
  onOpenChange,
  onAdded,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded?: (id: string) => void;
  editing?: Player;
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { addPlayer, updatePlayer } = usePlayers();
  const { teams } = useTeams();
  const [form, setForm] = useState<NewPlayerInput>(editing ? toInput(editing) : empty);

  // Re-sync form when the target player changes / dialog re-opens.
  useEffect(() => {
    if (open) setForm(editing ? toInput(editing) : empty);
  }, [open, editing]);

  const set = <K extends keyof NewPlayerInput>(k: K, v: NewPlayerInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const num = (k: keyof NewPlayerInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never);

  const onPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("photoUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { teamId, ...rest } = form;
      updatePlayer(editing.id, { ...rest, teamIds: teamId ? [teamId] : [] });
      onOpenChange(false);
      toast(t("players.updated"));
      onAdded?.(editing.id);
      return;
    }
    const player = addPlayer(form);
    onOpenChange(false);
    setForm(empty);
    toast(t("players.added"));
    onAdded?.(player.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{editing ? t("players.editTitle") : t("players.addTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          {/* Photo */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t("players.photo")}</Label>
            <div className="flex items-center gap-3">
              <Monogram name={form.name || "?"} color="#3b6ea5" imageUrl={form.photoUrl || undefined} size={56} />
              <div className="flex-1 space-y-2">
                <Input value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} placeholder={t("players.photoUrl")} />
                <div className="flex items-center gap-2">
                  <Button asChild type="button" variant="outline" size="sm">
                    <label className="cursor-pointer">
                      <ImagePlus className="h-4 w-4" /> {t("players.photoUpload")}
                      <input type="file" accept="image/*" className="hidden" onChange={onPhotoFile} />
                    </label>
                  </Button>
                  {form.photoUrl && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => set("photoUrl", "")}>
                      {t("players.photoRemove")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("players.photoHint")}</p>
          </div>

          {/* Basic */}
          <Section title={t("players.basicInfo")}>
            <Field label={t("col.name")} className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label={t("col.age")}>
              <Input type="number" min={14} max={45} value={form.age} onChange={num("age")} />
            </Field>
            <Field label={t("col.nationality")}>
              <Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
            </Field>
            <Field label={t("col.currentTeam")}>
              <Input value={form.currentTeam} onChange={(e) => set("currentTeam", e.target.value)} />
            </Field>
            <Field label={t("filter.league")}>
              <Input value={form.league} onChange={(e) => set("league", e.target.value)} />
            </Field>
            <Field label={t("col.position")}>
              <Select value={form.position} onValueChange={(v) => set("position", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{label(positionLabels, p, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("col.secondaryPosition")}>
              <Select value={form.secondaryPosition} onValueChange={(v) => set("secondaryPosition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{label(positionLabels, p, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("col.foot")}>
              <Select value={form.foot} onValueChange={(v) => set("foot", v as NewPlayerInput["foot"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">{label(footLabels, "right", lang)}</SelectItem>
                  <SelectItem value="left">{label(footLabels, "left", lang)}</SelectItem>
                  <SelectItem value="both">{label(footLabels, "both", lang)}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("col.height")}>
              <Input type="number" value={form.height} onChange={num("height")} />
            </Field>
            <Field label={t("profile.shirtNumber")}>
              <Input type="number" value={form.shirtNumber} onChange={num("shirtNumber")} />
            </Field>
          </Section>

          {/* Propose to a single team */}
          <Section title={t("players.proposeTitle")}>
            <Field label={t("players.proposeTeam")} className="sm:col-span-3">
              <Select value={form.teamId || "none"} onValueChange={(v) => set("teamId", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder={t("players.proposeTeam")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("players.proposeNone")}</SelectItem>
                  {teams.map((tm) => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          {/* Contract */}
          <Section title={t("players.contractInfo")}>
            <Field label={`${t("col.marketValue")} (€)`}>
              <Input type="number" value={form.marketValue} onChange={num("marketValue")} />
            </Field>
            <Field label={`${t("profile.salaryEst")} (€)`}>
              <Input type="number" value={form.salary} onChange={num("salary")} />
            </Field>
            <Field label={t("col.contractEnd")}>
              <Input type="date" value={form.contractEnd} onChange={(e) => set("contractEnd", e.target.value)} />
            </Field>
          </Section>

          {/* Assessment */}
          <Section title={t("players.assessment")}>
            <Field label={t("profile.availability")}>
              <Select value={form.availability} onValueChange={(v) => set("availability", v as NewPlayerInput["availability"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(availabilityLabels).map((a) => <SelectItem key={a} value={a}>{label(availabilityLabels, a, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("report.risk")}>
              <Select value={form.risk} onValueChange={(v) => set("risk", v as NewPlayerInput["risk"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(riskLabels).map((r) => <SelectItem key={r} value={r}>{label(riskLabels, r, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit">{editing ? t("common.save") : t("players.add")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({ label: l, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{l}</Label>
      {children}
    </div>
  );
}
