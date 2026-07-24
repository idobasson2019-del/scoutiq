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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useReports, type NewReportInput } from "@/lib/reports-store";
import type { Player, ScoutingReport } from "@/types";

export function WriteReportDialog({
  open,
  onOpenChange,
  player,
  existing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  player: Player;
  existing?: ScoutingReport;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addReport } = useReports();

  const base = (): NewReportInput => ({
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    author: user?.name ?? "",
    type: existing?.type ?? "live",
    summary: existing?.summary ?? "",
    strengths: existing?.strengths ?? [],
    weaknesses: existing?.weaknesses ?? [],
    technical: existing?.technical ?? 75,
    tactical: existing?.tactical ?? 75,
    physical: existing?.physical ?? 75,
    mental: existing?.mental ?? 75,
    decisionMaking: existing?.decisionMaking ?? 75,
    offBall: existing?.offBall ?? 75,
    styleFit: existing?.styleFit ?? 75,
    risk: existing?.risk ?? "low",
    potential: existing?.potential ?? player.potential,
    overall: existing?.overall ?? player.scoutingScore,
    recommendation: existing?.recommendation ?? "monitor",
  });

  const [form, setForm] = useState<NewReportInput>(base);
  const [strengthsText, setStrengthsText] = useState("");
  const [weaknessesText, setWeaknessesText] = useState("");

  useEffect(() => {
    if (open) {
      const b = base();
      setForm(b);
      setStrengthsText(b.strengths.join("\n"));
      setWeaknessesText(b.weaknesses.join("\n"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, player.id]);

  const set = <K extends keyof NewReportInput>(k: K, v: NewReportInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addReport({
      ...form,
      strengths: strengthsText.split("\n").map((s) => s.trim()).filter(Boolean),
      weaknesses: weaknessesText.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    onOpenChange(false);
    toast(t("report.saved"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{t("report.writeTitle")} — {player.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {/* Written report only — no numeric ratings. */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t("report.summary")}</Label>
            <Textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} required className="min-h-[140px]" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("report.strengths")} <span className="text-muted-foreground">({t("report.strengthsHint")})</span></Label>
              <Textarea value={strengthsText} onChange={(e) => setStrengthsText(e.target.value)} className="min-h-[110px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("report.weaknesses")} <span className="text-muted-foreground">({t("report.weaknessesHint")})</span></Label>
              <Textarea value={weaknessesText} onChange={(e) => setWeaknessesText(e.target.value)} className="min-h-[110px]" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
