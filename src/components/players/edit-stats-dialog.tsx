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
import { EMPTY_STATS, statFieldsFor, isGoalkeeper } from "@/lib/stats";
import type { Player, PlayerStats } from "@/types";

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

  // A goalkeeper is measured on clean sheets and saves, not goals and assists.
  const fields = statFieldsFor(player.position);
  const counts = fields.filter((f) => f.kind === "count");
  const ratings = fields.filter((f) => f.kind === "rating");

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
          <DialogTitle>
            {t("stats.editTitle")} — {player.name}
            {isGoalkeeper(player.position) && (
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                {t("stat.gkNote")}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {counts.map((f) => (
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

          {/* Goalkeepers have no rated stats, so the section is skipped. */}
          {ratings.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                {t("stat.rated")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {ratings.map((f) => (
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
          )}

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
