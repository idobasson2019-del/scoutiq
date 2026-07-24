"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { ScoutingReport } from "@/types";

/**
 * Written scouting report — free text only (summary, strengths, weaknesses).
 * Numeric ratings were intentionally removed.
 */
export function ScoutingReportView({ report }: { report: ScoutingReport }) {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("report.summary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p dir="auto" className="bidi-plaintext whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {report.summary}
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            {report.author} · {formatDate(report.date, lang)}
          </div>
        </CardContent>
      </Card>

      {(report.strengths.length > 0 || report.weaknesses.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {report.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ThumbsUp className="h-4 w-4 text-success" /> {t("report.strengths")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.strengths.map((s) => (
                    <li key={s} dir="auto" className="bidi-plaintext flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {report.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ThumbsDown className="h-4 w-4 text-warning" /> {t("report.weaknesses")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.weaknesses.map((s) => (
                    <li key={s} dir="auto" className="bidi-plaintext flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
