"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { PlayersView } from "@/components/players/players-view";
import { AddPlayerDialog } from "@/components/players/add-player-dialog";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { usePlayers, scopePlayers } from "@/lib/players-store";

export default function PlayersPage() {
  const { t } = useI18n();
  const { user, isAdmin } = useAuth();
  const { players: allPlayers } = usePlayers();
  const players = scopePlayers(allPlayers, user?.teamId ?? null, isAdmin);
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={t("players.title")}
        subtitle={`${players.length} ${t("players.count")} · ${t("players.subtitle")}`}
        actions={
          isAdmin ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> {t("players.add")}
            </Button>
          ) : undefined
        }
      />
      <PlayersView players={players} initialQuery={q} />
      {isAdmin && (
        <AddPlayerDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onAdded={(id) => router.push(`/players/view?id=${id}`)}
        />
      )}
    </>
  );
}
