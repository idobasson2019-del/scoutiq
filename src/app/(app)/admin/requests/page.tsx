"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamLogo } from "@/components/common/misc";
import { NeedStatusBadge, UrgencyBadge } from "@/components/common/status-badges";
import { useI18n } from "@/lib/i18n";
import { useNeeds } from "@/lib/needs-store";
import { useTeams } from "@/lib/teams-store";
import { label, positionLabels, dealTypeLabels } from "@/lib/i18n/labels";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminRequestsPage() {
  const { t, lang } = useI18n();
  const { needs } = useNeeds();
  const { getTeam } = useTeams();
  const router = useRouter();

  return (
    <>
      <PageHeader
        title={t("admin.allRequests.title")}
        subtitle={t("admin.allRequests.subtitle")}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("admin.allRequests.title") }]}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("needs.field.title")}</TableHead>
              <TableHead>{t("admin.col.team")}</TableHead>
              <TableHead>{t("col.position")}</TableHead>
              <TableHead>{t("needs.field.dealType")}</TableHead>
              <TableHead>{t("needs.budget")}</TableHead>
              <TableHead>{t("needs.openedBy")}</TableHead>
              <TableHead>{t("needs.field.deadline")}</TableHead>
              <TableHead>{t("needs.urgency")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {needs.map((n) => {
              const team = getTeam(n.teamId);
              return (
                <TableRow key={n.id} className="cursor-pointer" onClick={() => router.push(`/needs/view?id=${n.id}`)}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TeamLogo name={team?.name ?? ""} color={team?.logoColor ?? "#333"} logoUrl={team?.logoUrl} size={24} />
                      <span className="text-muted-foreground">{team?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{label(positionLabels, n.position, lang)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{label(dealTypeLabels, n.dealType, lang)}</TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(n.transferBudget, "EUR", lang)}</TableCell>
                  <TableCell className="text-muted-foreground">{n.openedBy}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(n.deadline, lang)}</TableCell>
                  <TableCell><UrgencyBadge urgency={n.urgency} /></TableCell>
                  <TableCell><NeedStatusBadge status={n.status} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
