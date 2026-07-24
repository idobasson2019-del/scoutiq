"use client";

import { PageHeader } from "@/components/layout/page";
import { PlayersView } from "@/components/players/players-view";
import { useI18n } from "@/lib/i18n";
import { usePlayers } from "@/lib/players-store";

export default function AdminPlayersPage() {
  const { t } = useI18n();
  const { players } = usePlayers();
  return (
    <>
      <PageHeader
        title={t("admin.allPlayers.title")}
        subtitle={`${players.length} ${t("players.count")} · ${t("admin.allPlayers.subtitle")}`}
        breadcrumbs={[{ label: t("nav.adminSection") }, { label: t("admin.allPlayers.title") }]}
      />
      <PlayersView players={players} />
    </>
  );
}
