"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function InactivePage() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute end-4 top-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo showTagline={false} />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{t("inactive.title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("inactive.body")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              {t("inactive.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
