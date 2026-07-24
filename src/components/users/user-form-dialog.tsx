"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useUsers } from "@/lib/users-store";
import { useTeams } from "@/lib/teams-store";
import { DEMO_PASSWORD } from "@/data/users";
import type { Role, User } from "@/types";

const ROLE_TITLES: Record<Role, string> = {
  owner: "Owner",
  scout_lead: "Head of Scouting",
  scout: "Scout",
};

export function UserFormDialog({
  open,
  onOpenChange,
  fixedRole,
  fixedTeamId,
  allowedRoles = ["scout", "scout_lead", "owner"],
  onCreated,
  successMessage,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fixedRole?: Role;
  fixedTeamId?: string | null;
  allowedRoles?: Role[];
  onCreated?: () => void;
  successMessage?: string;
  editing?: User;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { addUser, updateUser } = useUsers();
  const { teams } = useTeams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(fixedRole ?? allowedRoles[0]);
  const [teamId, setTeamId] = useState<string>(fixedTeamId ?? "");

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setEmail(editing?.email ?? "");
      setUsername(editing?.username ?? "");
      setPassword("");
      setRole(editing?.role ?? fixedRole ?? allowedRoles[0]);
      setTeamId(editing?.teamId ?? fixedTeamId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const teamForRole = role === "owner" ? null : teamId || null;
    if (editing) {
      updateUser(editing.id, {
        name,
        email,
        username: username || email,
        role,
        teamId: teamForRole,
        title: ROLE_TITLES[role],
        // Only overwrite the password when a new one is typed.
        ...(password ? { password } : {}),
      });
      onOpenChange(false);
      toast(t("admin.users.updated"));
      onCreated?.();
      return;
    }
    addUser({
      name,
      email,
      username: username || email,
      password: password || undefined,
      role,
      teamId: teamForRole,
      title: ROLE_TITLES[role],
    });
    onOpenChange(false);
    toast(successMessage ?? t("admin.users.created"));
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t("admin.users.editTitle")
              : fixedRole === "scout"
                ? t("team.createScout")
                : t("admin.users.create")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("settings.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("settings.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("admin.users.username")}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={email} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("admin.users.password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("admin.users.passwordHint")} autoComplete="new-password" />
            </div>
            {!fixedRole && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("admin.col.role")}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allowedRoles.map((r) => (
                      <SelectItem key={r} value={r}>{t(`role.${r}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!fixedTeamId && role !== "owner" && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">{t("admin.col.assignedTeam")}</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger><SelectValue placeholder={t("admin.users.assign")} /></SelectTrigger>
                  <SelectContent>
                    {teams.map((tm) => (
                      <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {editing
                ? t("admin.users.passwordKeep")
                : password
                  ? t("admin.users.credentialHint")
                  : <>{t("admin.users.passwordHint")}: <span className="font-mono">{DEMO_PASSWORD}</span></>}
              <br />
              {t("admin.users.passwordMockNote")}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit">{editing ? t("common.save") : t("common.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
