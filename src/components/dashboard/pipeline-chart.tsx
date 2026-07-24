"use client";

import { useI18n } from "@/lib/i18n";
import { label, playerStatusLabels } from "@/lib/i18n/labels";
import type { Player, PlayerStatus } from "@/types";

const STAGES: PlayerStatus[] = [
  "new",
  "proposed",
  "in_review",
  "interesting",
  "shortlisted",
  "negotiation",
  "signed",
];

export function PipelineChart({ players }: { players: Player[] }) {
  const { lang } = useI18n();
  const counts = STAGES.map(
    (s) => players.filter((p) => p.status === s).length,
  );
  const max = Math.max(1, ...counts);

  return (
    <div className="flex h-52 items-end gap-2 sm:gap-4">
      {STAGES.map((stage, i) => {
        const h = (counts[i] / max) * 100;
        return (
          <div key={stage} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div className="relative w-full overflow-hidden rounded-t-md bg-muted/50">
                <div
                  className="w-full rounded-t-md bg-primary/70 transition-all duration-500"
                  style={{ height: `${Math.max(6, h)}%`, minHeight: 6 }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums">{counts[i]}</span>
            <span className="text-center text-[11px] leading-tight text-muted-foreground line-clamp-2">
              {label(playerStatusLabels, stage, lang)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
