"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Eye,
  Printer,
  FileDown,
  StickyNote,
  Bookmark,
  Share2,
  MoreHorizontal,
  Search,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/misc";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useReports } from "@/lib/reports-store";
import { label, positionLabels } from "@/lib/i18n/labels";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { reports, markRead, removeReport } = useReports();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [readState, setReadState] = useState<Record<string, boolean>>({});
  const [removeId, setRemoveId] = useState<string | null>(null);

  // Single scouting department: every role sees all reports.
  const teamReports = reports;

  const filtered = useMemo(
    () =>
      teamReports.filter((r) => {
        if (q && !r.playerName.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [teamReports, q],
  );

  const isRead = (id: string, fallback: boolean) =>
    readState[id] ?? fallback;

  return (
    <>
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("filter.name")} className="ps-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title={t("common.noResults")} body={t("common.noResultsBody")} />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("col.player")}</TableHead>
                <TableHead>{t("col.position")}</TableHead>
                <TableHead>{t("col.author")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("col.readStatus")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const read = isRead(r.id, r.read);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.playerName}</TableCell>
                    <TableCell><Badge variant="outline">{label(positionLabels, r.position, lang)}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{r.author}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatDate(r.date, lang)}</TableCell>
                    <TableCell>
                      {read ? (
                        <Badge variant="muted">{t("reports.markRead")}</Badge>
                      ) : (
                        <Badge>{t("notif.filter.unread")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/players/view?id=${r.playerId}&tab=report`)}>
                          <Eye className="h-4 w-4" /> {t("reports.view")}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { markRead(r.id); setReadState((s) => ({ ...s, [r.id]: true })); }}>
                              <CheckCircle2 className="h-4 w-4" /> {t("reports.markRead")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.print()}>
                              <Printer className="h-4 w-4" /> {t("common.print")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast(t("common.saved"))}>
                              <FileDown className="h-4 w-4" /> {t("common.export")} PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast(t("common.saved"))}>
                              <StickyNote className="h-4 w-4" /> {t("common.addNote")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast(t("watch.added"))}>
                              <Bookmark className="h-4 w-4" /> {t("profile.addToWatchlist")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast(t("reports.shared"))}>
                              <Share2 className="h-4 w-4" /> {t("reports.share")}
                            </DropdownMenuItem>
                            {/* Only the owner writes reports, so only the owner deletes them. */}
                            {isAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setRemoveId(r.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> {t("report.delete")}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
        title={t("report.deleteConfirm")}
        description={t("report.deleteBody")}
        destructive
        confirmLabel={t("report.delete")}
        onConfirm={() => { if (removeId) { removeReport(removeId); toast(t("report.deleted")); } }}
      />
    </>
  );
}
