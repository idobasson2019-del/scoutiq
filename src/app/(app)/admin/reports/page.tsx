"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useReports } from "@/lib/reports-store";
import { label, positionLabels } from "@/lib/i18n/labels";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { reports, removeReport } = useReports();
  const router = useRouter();
  const [removeId, setRemoveId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title={t("admin.allReports.title")}
        subtitle={t("admin.allReports.subtitle")}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("admin.allReports.title") }]}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("col.player")}</TableHead>
              <TableHead>{t("col.position")}</TableHead>
              <TableHead>{t("col.author")}</TableHead>
              <TableHead>{t("common.date")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.playerName}</TableCell>
                <TableCell><Badge variant="outline">{label(positionLabels, r.position, lang)}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{r.author}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{formatDate(r.date, lang)}</TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/players/view?id=${r.playerId}&tab=report`)}>
                      <Eye className="h-4 w-4" /> {t("reports.view")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label={t("report.delete")}
                      onClick={() => setRemoveId(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title={t("report.deleteConfirm")}
        description={t("report.deleteBody")}
        destructive
        confirmLabel={t("report.delete")}
        onConfirm={() => { if (removeId) { removeReport(removeId); toast(t("report.deleted")); } }}
      />
    </>
  );
}
