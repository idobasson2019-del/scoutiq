"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export function NoAccess() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <ShieldX className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{t("noaccess.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("noaccess.body")}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">{t("noaccess.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
