import type { Team } from "@/types";

// Demo teams cleared — start empty.
export const teams: Team[] = [];

export function teamName(id: string | null): string {
  if (!id) return "";
  return teams.find((t) => t.id === id)?.name ?? "";
}

export function teamById(id: string | null): Team | undefined {
  if (!id) return undefined;
  return teams.find((t) => t.id === id);
}
