"use client";

import { useState } from "react";
import { Camera, LogOut, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monogram } from "@/components/common/misc";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useUsers } from "@/lib/users-store";
import { useToast } from "@/components/ui/toast";
import type { Lang } from "@/types";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const { updateUser } = useUsers();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = () => {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast(t("settings.passwordMismatch"), "error");
      return;
    }
    if (user) updateUser(user.id, { password: newPassword });
    setNewPassword("");
    setConfirmPassword("");
    toast(t("settings.passwordChanged"));
  };

  return (
    <>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t("settings.tab.profile")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.tab.notifications")}</TabsTrigger>
          <TabsTrigger value="display">{t("settings.tab.display")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.tab.security")}</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card className="max-w-2xl">
            <CardHeader><CardTitle>{t("settings.tab.profile")}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Monogram name={user?.name ?? "SQ"} color="hsl(var(--primary))" size={64} />
                <Button variant="outline" onClick={() => toast(t("common.saved"))}>
                  <Camera className="h-4 w-4" /> {t("settings.changePhoto")}
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("settings.name")}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("settings.email")}</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.language")}</Label>
                <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => toast(t("common.saved"))}>{t("common.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="max-w-2xl">
            <CardHeader><CardTitle>{t("settings.notifPrefs")}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                { k: "settings.notif.email", d: true },
                { k: "settings.notif.reports", d: true },
                { k: "settings.notif.needs", d: true },
                { k: "settings.notif.messages", d: false },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-3">
                  <span className="text-sm">{t(row.k)}</span>
                  <Switch defaultChecked={row.d} onCheckedChange={() => toast(t("common.saved"))} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display */}
        <TabsContent value="display">
          <Card className="max-w-2xl">
            <CardHeader><CardTitle>{t("settings.display")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">{t("settings.display.density")}</span>
                <Switch onCheckedChange={() => toast(t("common.saved"))} />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>{t("settings.display.defaultView")}</Label>
                <Select defaultValue="table">
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">{t("common.tableView")}</SelectItem>
                    <SelectItem value="cards">{t("common.cardView")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.language")}</Label>
                <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="max-w-2xl">
            <CardHeader><CardTitle>{t("settings.changePassword")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("settings.currentPassword")}</Label>
                <Input type="password" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("settings.newPassword")}</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("settings.confirmPassword")}</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t("admin.users.passwordMockNote")}</p>
              <Button onClick={changePassword} disabled={!newPassword}>
                <ShieldCheck className="h-4 w-4" /> {t("settings.changePassword")}
              </Button>
              <Separator />
              <Button variant="outline" className="text-destructive" onClick={() => toast(t("common.saved"), "info")}>
                <LogOut className="h-4 w-4" /> {t("settings.logoutAll")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
