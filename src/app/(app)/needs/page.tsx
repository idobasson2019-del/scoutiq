"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Target, Users, Wallet, CalendarClock, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/misc";
import { NeedStatusBadge, UrgencyBadge } from "@/components/common/status-badges";
import { NeedFormDialog } from "@/components/needs/need-form-dialog";
import { useI18n } from "@/lib/i18n";
import { useNeeds } from "@/lib/needs-store";
import { useRouter } from "next/navigation";
import { label, positionLabels, dealTypeLabels } from "@/lib/i18n/labels";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function NeedsPage() {
  const { t, lang, dir } = useI18n();
  const { needs } = useNeeds();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={t("needs.title")}
        subtitle={t("needs.subtitle")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> {t("needs.new")}
          </Button>
        }
      />

      {needs.length === 0 ? (
        <EmptyState icon={Target} title={t("common.noResults")} body={t("common.noResultsBody")}
          action={<Button onClick={() => setOpen(true)}><Plus /> {t("needs.new")}</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {needs.map((n) => (
            <Link key={n.id} href={`/needs/view?id=${n.id}`}>
              <Card className="p-5 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                      {n.position}
                    </div>
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {label(positionLabels, n.position, lang)} · {label(dealTypeLabels, n.dealType, lang)}
                      </div>
                    </div>
                  </div>
                  <NeedStatusBadge status={n.status} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Meta icon={Users} label={t("needs.proposedPlayers")} value={String(n.proposedPlayerIds.length)} />
                  <Meta icon={Wallet} label={t("needs.budget")} value={formatCurrency(n.transferBudget, "EUR", lang)} />
                  <Meta icon={CalendarClock} label={t("needs.field.deadline")} value={formatDate(n.deadline, lang)} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <UrgencyBadge urgency={n.urgency} />
                  <span className="flex items-center gap-1 text-xs text-primary">
                    {t("needs.details")}
                    <ArrowLeft className={cn("h-3.5 w-3.5", dir === "ltr" && "rotate-180")} />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NeedFormDialog open={open} onOpenChange={setOpen} onCreated={(id) => router.push(`/needs/view?id=${id}`)} />
    </>
  );
}

function Meta({ icon: Icon, label: l, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{l}</div>
        <div className="truncate font-medium">{value}</div>
      </div>
    </div>
  );
}
