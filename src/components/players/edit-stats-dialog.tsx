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
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { usePlayers } from "@/lib/players-store";
import { EMPTY_STATS } from "@/lib/stats";
import type { Player, PlayerStats } from "@/types";

const COUNTS: { key: keyof PlayerStats; labelKey: string }[] = [
  { key: "goals", labelKey: "stat.goals" },
  { key: "assists", labelKey: "stat.assists" },
  { key: "appearances", labelKey: "stat.appearances" },
  { key: "minutes", labelKey: "stat.minutes" },
  { key: "yellowCards", labelKey: "stat.yellowCards" },
  { key: "redCards", labelKey: "stat.redCards" },
];

const RATINGS: { key: keyof PlayerStats; labelKey: string }[] = [
  { key: "passAccuracy", labelKey: "stat.passAccuracy" },
  { key: "defensiveRating", labelKey: "stat.defensiveRating" },
];

export function EditStatsDialog({
  open,
  onOpenChange,
  player,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  player: Player;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { updatePlayer } = usePlayers();
  const [stats, setStats] = useState<PlayerStats>(EMPTY_STATS);

  useEffect(() => {
    // Merge over defaults so players saved before a field existed still load.
    if (open) setStats({ ...EMPTY_STATS, ...player.stats });
  }, [open, player.stats]);

  const set = (key: keyof PlayerStats, value: number) =>
    setStats((s) => ({ ...s, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlayer(player.id, { stats });
    onOpenChange(false);
    toast(t("stats.saved"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{t("stats.editTitle")} — {player.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {COUNTS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs">{t(f.labelKey)}</Label>
                <Input
                  type="number"
                  min={0}
                  value={stats[f.key]}
                  onChange={(e) => set(f.key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              {t("stat.rated")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {RATINGS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{t(f.labelKey)}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={stats[f.key]}
                    onChange={(e) =>
                      set(f.key, Math.max(0, Math.min(100, Number(e.target.value))))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
