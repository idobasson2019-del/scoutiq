"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Trash2 } from "lucide-react";
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
import { Monogram, EmptyState } from "@/components/common/misc";
import { PlayerStatusBadge } from "@/components/common/status-badges";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { watchlist as initialWatch } from "@/data/misc";
import { usePlayers } from "@/lib/players-store";
import { label, positionLabels } from "@/lib/i18n/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function WatchlistPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const { getPlayer } = usePlayers();

  const [items, setItems] = useState(initialWatch);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const remove = (id: string) => {
    setItems((prev) => prev.filter((w) => w.id !== id));
    toast(t("watch.removed"));
  };

  return (
    <>
      <PageHeader title={t("watch.title")} subtitle={t("watch.subtitle")} />

      {items.length === 0 ? (
        <EmptyState icon={Bookmark} title={t("watch.empty")} body={t("watch.emptyBody")} />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead>{t("col.name")}</TableHead>
                <TableHead>{t("col.position")}</TableHead>
                <TableHead>{t("col.age")}</TableHead>
                <TableHead>{t("col.currentTeam")}</TableHead>
                <TableHead>{t("col.marketValue")}</TableHead>
                <TableHead>{t("col.score")}</TableHead>
                <TableHead>{t("watch.reason")}</TableHead>
                <TableHead>{t("watch.addedBy")}</TableHead>
                <TableHead>{t("watch.nextReview")}</TableHead>
                <TableHead>{t("col.status")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((w) => {
                const p = getPlayer(w.playerId);
                if (!p) return null;
                return (
                  <TableRow key={w.id} className="cursor-pointer" onClick={() => router.push(`/players/view?id=${p.id}`)}>
                    <TableCell><Monogram name={p.name} color={p.photoColor} imageUrl={p.photoUrl} size={32} /></TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{label(positionLabels, p.position, lang)}</TableCell>
                    <TableCell className="tabular-nums">{p.age}</TableCell>
                    <TableCell className="text-muted-foreground">{p.currentTeam}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(p.marketValue, "EUR", lang)}</TableCell>
                    <TableCell className="font-semibold tabular-nums">{p.scoutingScore}</TableCell>
                    <TableCell className="max-w-[220px] text-sm text-muted-foreground">{w.reason}</TableCell>
                    <TableCell className="text-muted-foreground">{w.addedBy}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatDate(w.nextReview, lang)}</TableCell>
                    <TableCell><PlayerStatusBadge status={w.status} /></TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setRemoveId(w.id); }}
                        aria-label={t("watch.remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title={t("watch.remove")}
        description={t("confirm.title")}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => removeId && remove(removeId)}
      />
    </>
  );
}
