"use client";

import { useState } from "react";
import { Info, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { TeamLogo } from "@/components/common/misc";
import { PaymentBadge, TeamStatusBadge } from "@/components/common/status-badges";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { contracts } from "@/data/misc";
import { teamById } from "@/data/teams";
import { paymentLabels, label } from "@/lib/i18n/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contract } from "@/types";

export default function AdminContractsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Contract | null>(null);

  return (
    <>
      <PageHeader
        title={t("admin.contracts.title")}
        subtitle={t("admin.contracts.subtitle")}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("admin.contracts.title") }]}
      />

      <div className="mb-4 flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>{t("admin.contracts.note")}</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead>{t("admin.contract.team")}</TableHead>
              <TableHead>{t("admin.contract.start")}</TableHead>
              <TableHead>{t("admin.contract.end")}</TableHead>
              <TableHead>{t("admin.contract.monthly")}</TableHead>
              <TableHead>{t("admin.contract.yearly")}</TableHead>
              <TableHead className="text-center">{t("admin.contract.seats")}</TableHead>
              <TableHead>{t("admin.contract.payment")}</TableHead>
              <TableHead>{t("admin.contract.status")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => {
              const team = teamById(c.teamId);
              return (
                <TableRow key={c.id}>
                  <TableCell><TeamLogo name={team?.name ?? ""} color={team?.logoColor ?? "#333"} logoUrl={team?.logoUrl} size={32} /></TableCell>
                  <TableCell className="font-medium">{team?.name}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(c.contractStart, lang)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(c.contractEnd, lang)}</TableCell>
                  <TableCell className="tabular-nums">{c.monthlyPrice ? formatCurrency(c.monthlyPrice, c.currency, lang) : "—"}</TableCell>
                  <TableCell className="tabular-nums">{c.yearlyPrice ? formatCurrency(c.yearlyPrice, c.currency, lang) : "—"}</TableCell>
                  <TableCell className="text-center tabular-nums">{c.seats}</TableCell>
                  <TableCell><PaymentBadge status={c.paymentStatus} /></TableCell>
                  <TableCell><TeamStatusBadge status={c.contractStatus} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(c)} aria-label={t("common.edit")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{teamById(editing?.teamId ?? "")?.name}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>{t("admin.contract.start")}</Label><Input type="date" defaultValue={editing.contractStart} /></div>
              <div className="space-y-1.5"><Label>{t("admin.contract.end")}</Label><Input type="date" defaultValue={editing.contractEnd} /></div>
              <div className="space-y-1.5"><Label>{t("admin.contract.monthly")}</Label><Input type="number" defaultValue={editing.monthlyPrice} /></div>
              <div className="space-y-1.5"><Label>{t("admin.contract.yearly")}</Label><Input type="number" defaultValue={editing.yearlyPrice} /></div>
              <div className="space-y-1.5"><Label>{t("admin.contract.seats")}</Label><Input type="number" defaultValue={editing.seats} /></div>
              <div className="space-y-1.5">
                <Label>{t("admin.contract.payment")}</Label>
                <Select defaultValue={editing.paymentStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(paymentLabels).map((p) => <SelectItem key={p} value={p}>{label(paymentLabels, p, lang)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t("admin.contract.contact")}</Label><Input defaultValue={editing.contact} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>{t("admin.contract.notes")}</Label><Textarea defaultValue={editing.notes} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
            <Button onClick={() => { setEditing(null); toast(t("common.saved")); }}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
