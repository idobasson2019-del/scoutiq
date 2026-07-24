import type { PlayerStats } from "@/types";

/**
 * Zeroed stats. Also used to fill in fields for players that were saved
 * before a given stat existed, so the UI never renders `undefined`.
 */
export const EMPTY_STATS: PlayerStats = {
  goals: 0,
  assists: 0,
  appearances: 0,
  minutes: 0,
  yellowCards: 0,
  redCards: 0,
  passAccuracy: 0,
  defensiveRating: 0,
};

export function withStatDefaults(stats?: Partial<PlayerStats>): PlayerStats {
  return { ...EMPTY_STATS, ...stats };
}
