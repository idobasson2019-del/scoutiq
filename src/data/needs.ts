import type { RecruitmentNeed } from "@/types";

// Demo recruitment needs cleared — start empty.
export const needs: RecruitmentNeed[] = [];

export function needById(id: string) {
  return needs.find((n) => n.id === id);
}

/** Single scouting department: every role sees all recruitment needs. */
export function needsForTeam(_teamId: string | null, _isAdmin: boolean) {
  return needs;
}
