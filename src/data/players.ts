import type { Player } from "@/types";

// Demo players cleared — start with an empty roster and add your own.
export const players: Player[] = [];

export function playerById(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

/**
 * Single scouting department: every role sees the full player pool. Screen and
 * action access is controlled by role, not data partitioning. (Signature kept
 * for a future multi-tenant Supabase model.)
 */
export function playersForTeam(_teamId: string | null, _isAdmin: boolean): Player[] {
  return players;
}
