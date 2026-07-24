import type { ScoutingReport } from "@/types";

// Demo scouting reports cleared together with the demo players.
export const reports: ScoutingReport[] = [];

export function reportById(id: string) {
  return reports.find((r) => r.id === id);
}

export function reportForPlayer(playerId: string) {
  return reports.find((r) => r.playerId === playerId);
}
