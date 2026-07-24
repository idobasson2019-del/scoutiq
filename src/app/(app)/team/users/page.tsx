"use client";

import { useState } from "react";
import { Plus, UsersRound, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Monogram, EmptyState } from "@/components/common/misc";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useUsers } from "@/lib/users-store";
import { useTeams } from "@/lib/teams-store";
import type { User } from "@/types";

export default function TeamUsersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();
  const { usersForTeam, removeUser } = useUsers();
  const { teamName } = useTeams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const teamId = user?.teamId ?? null;
  // Team members other than the lead themselves.
  const members = usersForTeam(teamId).filter((u) => u.id !== user?.id);

  if (!teamId) {
    return (
      <>
        <PageHeader title={t("team.title")} subtitle={t("team.subtitle")} />
        <EmptyState icon={UsersRound} title={t("team.noTeam")} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("team.title")}
        subtitle={`${teamName(teamId)} · ${t("team.subtitle")}`}
        actions={<Button onClick={() => setCreateOpen(true)}><Plus /> {t("team.addScout")}</Button>}
      />

      {members.length === 0 ? (
        <EmptyState icon={UsersRound} title={t("team.empty")} body={t("team.emptyBody")}
          action={<Button onClick={() => setCreateOpen(true)}><Plus /> {t("team.addScout")}</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead>{t("admin.col.user")}</TableHead>
                <TableHead>{t("admin.col.email")}</TableHead>
                <TableHead>{t("admin.col.role")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((u) => (
                <TableRow key={u.id}>
                  <TableCell><Monogram name={u.name} color="hsl(var(--primary))" size={32} /></TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{t(`role.${u.role}`)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label={t("admin.users.edit")} onClick={() => setEditUser(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label={t("team.removeMember")} onClick={() => setRemoveId(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <UserFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        fixedRole="scout"
        fixedTeamId={teamId}
        successMessage={t("team.scoutCreated")}
      />

      <UserFormDialog
        open={editUser !== null}
        onOpenChange={(o) => !o && setEditUser(null)}
        editing={editUser ?? undefined}
        fixedRole="scout"
        fixedTeamId={teamId}
      />

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title={t("team.removeMember")}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => { if (removeId) { removeUser(removeId); toast(t("common.saved")); } }}
      />
    </>
  );
}
