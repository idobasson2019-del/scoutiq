"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useNeeds, type NewNeedInput } from "@/lib/needs-store";
import { label, positionLabels, footLabels, dealTypeLabels, urgencyLabels } from "@/lib/i18n/labels";

const POSITIONS = ["GK", "RB", "LB", "CB", "DM", "CM", "AM", "RW", "LW", "ST"];

const empty: Omit<NewNeedInput, "openedBy"> = {
  title: "",
  position: "CM",
  secondaryPosition: "AM",
  count: 1,
  minAge: 18,
  maxAge: 26,
  foot: "any",
  minHeight: 175,
  nationality: "",
  leagues: [],
  transferBudget: 3000000,
  maxSalary: 600000,
  dealType: "buy",
  deadline: "",
  urgency: "medium",
  formation: "",
  playStyle: "",
  keyAttributes: [],
  notes: "",
};

export function NeedFormDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addNeed } = useNeeds();

  const [form, setForm] = useState(empty);
  const [leaguesText, setLeaguesText] = useState("");
  const [attrsText, setAttrsText] = useState("");

  useEffect(() => {
    if (open) {
      setForm(empty);
      setLeaguesText("");
      setAttrsText("");
    }
  }, [open]);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const num = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const need = addNeed({
      ...form,
      openedBy: user?.name ?? "",
      leagues: leaguesText.split(",").map((s) => s.trim()).filter(Boolean),
      keyAttributes: attrsText.split(",").map((s) => s.trim()).filter(Boolean),
    });
    onOpenChange(false);
    toast(t("needs.created"));
    onCreated?.(need.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{t("needs.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("needs.field.title")}>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("needs.field.position")}>
              <Select value={form.position} onValueChange={(v) => set("position", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{label(positionLabels, p, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("needs.field.secondaryPosition")}>
              <Select value={form.secondaryPosition} onValueChange={(v) => set("secondaryPosition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{label(positionLabels, p, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("needs.field.count")}><Input type="number" min={1} value={form.count} onChange={num("count")} /></Field>
            <Field label={t("needs.field.minAge")}><Input type="number" value={form.minAge} onChange={num("minAge")} /></Field>
            <Field label={t("needs.field.maxAge")}><Input type="number" value={form.maxAge} onChange={num("maxAge")} /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("needs.field.foot")}>
              <Select value={form.foot} onValueChange={(v) => set("foot", v as typeof empty["foot"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{label(footLabels, "any", lang)}</SelectItem>
                  <SelectItem value="left">{label(footLabels, "left", lang)}</SelectItem>
                  <SelectItem value="right">{label(footLabels, "right", lang)}</SelectItem>
                  <SelectItem value="both">{label(footLabels, "both", lang)}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("needs.field.minHeight")}><Input type="number" value={form.minHeight} onChange={num("minHeight")} /></Field>
            <Field label={t("needs.field.nationality")}><Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder={t("common.any")} /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${t("needs.field.transferBudget")} (€)`}><Input type="number" value={form.transferBudget} onChange={num("transferBudget")} /></Field>
            <Field label={`${t("needs.field.maxSalary")} (€)`}><Input type="number" value={form.maxSalary} onChange={num("maxSalary")} /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("needs.field.dealType")}>
              <Select value={form.dealType} onValueChange={(v) => set("dealType", v as typeof empty["dealType"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(dealTypeLabels).map((d) => <SelectItem key={d} value={d}>{label(dealTypeLabels, d, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("needs.field.deadline")}><Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
            <Field label={t("needs.field.urgency")}>
              <Select value={form.urgency} onValueChange={(v) => set("urgency", v as typeof empty["urgency"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(urgencyLabels).map((u) => <SelectItem key={u} value={u}>{label(urgencyLabels, u, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("needs.field.formation")}><Input value={form.formation} onChange={(e) => set("formation", e.target.value)} placeholder="4-3-3" /></Field>
            <Field label={t("needs.field.playStyle")}><Input value={form.playStyle} onChange={(e) => set("playStyle", e.target.value)} /></Field>
          </div>

          <Field label={t("needs.field.leagues")}>
            <Input value={leaguesText} onChange={(e) => setLeaguesText(e.target.value)} placeholder="Ligue 2, Eredivisie, …" />
          </Field>
          <Field label={t("needs.field.keyAttributes")}>
            <Input value={attrsText} onChange={(e) => setAttrsText(e.target.value)} placeholder="Vision, Pressing, …" />
          </Field>
          <Field label={t("needs.field.notes")}>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit">{t("common.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{l}</Label>
      {children}
    </div>
  );
}
