"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Monogram } from "@/components/common/misc";
import { useI18n } from "@/lib/i18n";
import { label, positionLabels, footLabels } from "@/lib/i18n/labels";
import { formatCurrency } from "@/lib/utils";
import type { Player } from "@/types";

export function PlayerCard({ player }: { player: Player }) {
  const { t, lang } = useI18n();
  return (
    <Link href={`/players/view?id=${player.id}`}>
      <Card className="p-4 transition-colors hover:border-primary/40">
        <div className="flex items-start gap-3">
          <Monogram name={player.name} color={player.photoColor} imageUrl={player.photoUrl} size={48} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{player.name}</div>
            <div className="text-xs text-muted-foreground">
              {player.nationality} · {player.age} {t("common.years")}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">{player.currentTeam}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
          <div>
            <div className="text-muted-foreground">{t("col.position")}</div>
            <div className="mt-0.5 font-medium">{label(positionLabels, player.position, lang)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("col.foot")}</div>
            <div className="mt-0.5 font-medium">{label(footLabels, player.foot, lang)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t("col.marketValue")}</div>
            <div className="mt-0.5 font-medium">{formatCurrency(player.marketValue, "EUR", lang)}</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
