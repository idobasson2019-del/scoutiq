"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, KeyRound, Trash2, Pencil } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Monogram } from "@/components/common/misc";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useUsers } from "@/lib/users-store";
import { useTeams } from "@/lib/teams-store";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user: current } = useAuth();
  const { users, removeUser } = useUsers();
  const { teamName } = useTeams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title={t("admin.users.title")}
        subtitle={t("admin.users.subtitle")}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("admin.users.title") }]}
        actions={<Button onClick={() => setCreateOpen(true)}><Plus /> {t("admin.users.new")}</Button>}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead>{t("admin.col.user")}</TableHead>
              <TableHead>{t("admin.col.email")}</TableHead>
              <TableHead>{t("admin.col.role")}</TableHead>
              <TableHead>{t("admin.col.assignedTeam")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell><Monogram name={u.name} color="hsl(var(--primary))" size={32} /></TableCell>
                <TableCell>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.title}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge variant={u.role === "owner" ? "default" : "secondary"}>{t(`role.${u.role}`)}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{u.teamId ? teamName(u.teamId) : "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditUser(u)}><Pencil className="h-4 w-4" /> {t("admin.users.edit")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast(t("admin.users.resetDone"))}><KeyRound className="h-4 w-4" /> {t("admin.users.resetPassword")}</DropdownMenuItem>
                      {u.id !== current?.id && (
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setRemoveId(u.id)}>
                          <Trash2 className="h-4 w-4" /> {t("common.delete")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <UserFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        allowedRoles={["scout", "scout_lead", "owner"]}
      />

      <UserFormDialog
        open={editUser !== null}
        onOpenChange={(o) => !o && setEditUser(null)}
        editing={editUser ?? undefined}
        allowedRoles={["scout", "scout_lead", "owner"]}
      />

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title={t("confirm.title")}
        destructive
        confirmLabel={t("common.delete")}
        onConfirm={() => { if (removeId) { removeUser(removeId); toast(t("common.saved")); } }}
      />
    </>
  );
}
