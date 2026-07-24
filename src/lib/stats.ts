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
  cleanSheets: 0,
  goalsConceded: 0,
  saves: 0,
  penaltiesSaved: 0,
  savePct: 0,
};

export function withStatDefaults(stats?: Partial<PlayerStats>): PlayerStats {
  return { ...EMPTY_STATS, ...stats };
}

export interface StatField {
  key: keyof PlayerStats;
  labelKey: string;
  /** Counts render as number tiles, ratings as 0–100 bars. */
  kind: "count" | "rating";
  accent?: "warning" | "destructive";
  /** Which end of the range wins on the compare screen. Defaults to "high". */
  better?: "high" | "low";
}

/** Outfield players: goals and assists matter, goals conceded doesn't. */
export const OUTFIELD_STATS: StatField[] = [
  { key: "goals", labelKey: "stat.goals", kind: "count" },
  { key: "assists", labelKey: "stat.assists", kind: "count" },
  { key: "appearances", labelKey: "stat.appearances", kind: "count" },
  { key: "minutes", labelKey: "stat.minutes", kind: "count" },
  { key: "yellowCards", labelKey: "stat.yellowCards", kind: "count", accent: "warning", better: "low" },
  { key: "redCards", labelKey: "stat.redCards", kind: "count", accent: "destructive", better: "low" },
  { key: "passAccuracy", labelKey: "stat.passAccuracy", kind: "rating" },
  { key: "defensiveRating", labelKey: "stat.defensiveRating", kind: "rating" },
];

/** Goalkeepers are judged on clean sheets and saves instead. */
export const GOALKEEPER_STATS: StatField[] = [
  { key: "appearances", labelKey: "stat.appearances", kind: "count" },
  { key: "minutes", labelKey: "stat.minutes", kind: "count" },
  { key: "cleanSheets", labelKey: "stat.cleanSheets", kind: "count" },
  { key: "goalsConceded", labelKey: "stat.goalsConceded", kind: "count", better: "low" },
  { key: "saves", labelKey: "stat.saves", kind: "count" },
  { key: "penaltiesSaved", labelKey: "stat.penaltiesSaved", kind: "count" },
  { key: "yellowCards", labelKey: "stat.yellowCards", kind: "count", accent: "warning", better: "low" },
  { key: "redCards", labelKey: "stat.redCards", kind: "count", accent: "destructive", better: "low" },
  { key: "savePct", labelKey: "stat.savePct", kind: "rating" },
  { key: "passAccuracy", labelKey: "stat.passAccuracy", kind: "rating" },
];

export function isGoalkeeper(position: string | undefined): boolean {
  return position === "GK";
}

/** Single source of truth for which stats a position shows and edits. */
export function statFieldsFor(position: string | undefined): StatField[] {
  return isGoalkeeper(position) ? GOALKEEPER_STATS : OUTFIELD_STATS;
}
