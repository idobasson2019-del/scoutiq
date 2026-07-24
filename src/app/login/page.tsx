"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

const demoAccounts = [
  { labelKey: "role.owner", id: "owner" },
  { labelKey: "role.scout_lead", id: "lead" },
  { labelKey: "role.scout", id: "scout" },
];

// On the public build the quick-login shortcuts and the visible password hint
// are hidden, so the deployed site does not advertise how to get in.
const showDemoLogin = process.env.NEXT_PUBLIC_SCOUTIQ_PUBLIC !== "true";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    // Simulated auth latency
    setTimeout(() => {
      const res = login(identifier, password);
      setLoading(false);
      if (!res.ok) {
        setError(true);
        return;
      }
      router.replace(res.blocked ? "/inactive" : "/dashboard");
    }, 550);
  };

  const fillDemo = (id: string) => {
    setIdentifier(id);
    setPassword("scoutiq");
    setError(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(172 62% 45% / 0.10), transparent 70%)",
        }}
      />
      <div className="absolute end-4 top-4">
        <LanguageToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center gap-2 text-center">
          <Logo showTagline={false} className="scale-125" />
          <p className="mt-2 text-sm text-muted-foreground">{t("brand.tagline")}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5 text-center">
              <h1 className="text-lg font-semibold">{t("auth.title")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">{t("auth.identifier")}</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t("auth.identifierPlaceholder")}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{t("auth.invalid")}</p>
              )}

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(v) => setRemember(Boolean(v))}
                  />
                  {t("auth.remember")}
                </label>
                <button
                  type="button"
                  onClick={() => toast(t("auth.forgotSent"), "info")}
                  className="text-sm text-primary hover:underline"
                >
                  {t("auth.forgot")}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>

            {showDemoLogin && (
              <div className="mt-6 border-t border-border pt-4">
                <p className="mb-2 text-center text-xs text-muted-foreground">
                  {t("auth.demoHint")} — <span className="font-mono">scoutiq</span>
                </p>
                <div className="flex justify-center gap-2">
                  {demoAccounts.map((a) => (
                    <Button
                      key={a.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemo(a.id)}
                    >
                      {t(a.labelKey)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
