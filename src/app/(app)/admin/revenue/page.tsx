"use client";

import { useEffect, useState } from "react";
import { Wallet, CalendarDays, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamLogo, EmptyState } from "@/components/common/misc";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useTeams } from "@/lib/teams-store";
import { formatCurrency } from "@/lib/utils";

const RATES_KEY = "scoutiq.rates";

/** Editable approximate defaults — the owner updates them to the live rate. */
const DEFAULT_RATES = { EUR: 4, USD: 3.7 };

export default function RevenuePage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { teams } = useTeams();

  const [rates, setRates] = useState(DEFAULT_RATES);
  const [draft, setDraft] = useState(DEFAULT_RATES);

  useEffect(() => {
    const raw = window.localStorage.getItem(RATES_KEY);
    if (raw) {
      try {
        const parsed = { ...DEFAULT_RATES, ...JSON.parse(raw) };
        setRates(parsed);
        setDraft(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const saveRates = () => {
    setRates(draft);
    window.localStorage.setItem(RATES_KEY, JSON.stringify(draft));
    toast(t("revenue.ratesSaved"));
  };

  /** Convert any supported currency into shekels. */
  const toIls = (amount: number, currency: string) => {
    if (currency === "ILS") return amount;
    if (currency === "EUR") return amount * rates.EUR;
    if (currency === "USD") return amount * rates.USD;
    return amount;
  };

  const rows = teams
    .filter((tm) => tm.monthlyPrice > 0)
    .map((tm) => {
      const currency = tm.currency || "EUR";
      const monthlyIls = toIls(tm.monthlyPrice, currency);
      return {
        team: tm,
        currency,
        monthly: tm.monthlyPrice,
        yearly: tm.monthlyPrice * 12,
        monthlyIls,
        yearlyIls: monthlyIls * 12,
      };
    });

  const totalMonthlyIls = rows.reduce((s, r) => s + r.monthlyIls, 0);
  const totalYearlyIls = totalMonthlyIls * 12;

  // Original amounts grouped by currency (before conversion).
  const byCurrency = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.currency] = (acc[r.currency] ?? 0) + r.monthly;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title={t("revenue.title")}
        subtitle={t("revenue.subtitle")}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("revenue.title") }]}
      />

      {/* Headline totals, in shekels */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("revenue.monthly")}</div>
              <div className="text-3xl font-semibold tabular-nums text-primary">
                {formatCurrency(totalMonthlyIls, "ILS", lang)}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("revenue.yearly")}</div>
              <div className="text-3xl font-semibold tabular-nums text-primary">
                {formatCurrency(totalYearlyIls, "ILS", lang)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange rates */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t("revenue.rates")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">1 € = ₪</Label>
              <Input
                type="number"
                step="0.01"
                className="w-28"
                value={draft.EUR}
                onChange={(e) => setDraft((d) => ({ ...d, EUR: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">1 $ = ₪</Label>
              <Input
                type="number"
                step="0.01"
                className="w-28"
                value={draft.USD}
                onChange={(e) => setDraft((d) => ({ ...d, USD: Number(e.target.value) }))}
              />
            </div>
            <Button onClick={saveRates}>{t("revenue.saveRates")}</Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{t("revenue.ratesHint")}</span>
          </div>
          {Object.keys(byCurrency).length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">{t("revenue.byCurrency")}:</span>
              {Object.entries(byCurrency).map(([c, amount]) => (
                <span key={c} className="rounded-md border border-border px-2.5 py-1 tabular-nums">
                  {formatCurrency(amount, c, lang)} / {t("revenue.perMonth")}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-club breakdown */}
      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState icon={Wallet} title={t("revenue.empty")} body={t("revenue.emptyBody")} />
        ) : (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">{t("revenue.perTeam")}</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>{t("admin.col.team")}</TableHead>
                  <TableHead>{t("admin.contract.currency")}</TableHead>
                  <TableHead>{t("revenue.monthlyOriginal")}</TableHead>
                  <TableHead>{t("revenue.yearlyOriginal")}</TableHead>
                  <TableHead className="text-primary">{t("revenue.monthlyIls")}</TableHead>
                  <TableHead className="text-primary">{t("revenue.yearlyIls")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.team.id}>
                    <TableCell>
                      <TeamLogo name={r.team.name} color={r.team.logoColor} logoUrl={r.team.logoUrl} size={28} />
                    </TableCell>
                    <TableCell className="font-medium">{r.team.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t(`currency.${r.currency}`)}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(r.monthly, r.currency, lang)}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(r.yearly, r.currency, lang)}</TableCell>
                    <TableCell className="font-semibold tabular-nums text-primary">
                      {formatCurrency(r.monthlyIls, "ILS", lang)}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums text-primary">
                      {formatCurrency(r.yearlyIls, "ILS", lang)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-border hover:bg-transparent">
                  <TableCell />
                  <TableCell className="font-semibold">{t("revenue.total")}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold tabular-nums text-primary">
                    {formatCurrency(totalMonthlyIls, "ILS", lang)}
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums text-primary">
                    {formatCurrency(totalYearlyIls, "ILS", lang)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  );
}
