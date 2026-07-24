"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Team, TeamStatus } from "@/types";
import { teams as seedTeams } from "@/data/teams";

const STORAGE_KEY = "scoutiq.teams";

/** Currencies a club can be billed in. */
export const CURRENCIES = ["ILS", "EUR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface NewTeamInput {
  name: string;
  country: string;
  league: string;
  contractStart: string;
  contractEnd: string;
  monthlyPrice: number;
  currency?: string;
  logoUrl?: string;
}

const PALETTE = ["#2f7d6b", "#3b6ea5", "#9a5b3b", "#7a4b8a", "#4a7a4a", "#a5623b"];

function buildTeam(input: NewTeamInput): Team {
  return {
    id: "t" + Date.now().toString(36),
    name: input.name.trim(),
    country: input.country.trim(),
    league: input.league.trim(),
    logoColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    logoUrl: input.logoUrl?.trim() || undefined,
    status: "active",
    users: 0,
    proposedPlayers: 0,
    contractStart: input.contractStart,
    contractEnd: input.contractEnd,
    monthlyPrice: input.monthlyPrice,
    currency: input.currency || "EUR",
    lastActivity: new Date().toISOString(),
  };
}

interface TeamsContextValue {
  teams: Team[];
  addTeam: (input: NewTeamInput) => Team;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  setStatus: (id: string, status: TeamStatus) => void;
  getTeam: (id: string | null) => Team | undefined;
  teamName: (id: string | null) => string;
}

const TeamsContext = createContext<TeamsContextValue | null>(null);

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(seedTeams);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setTeams(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const persist = useCallback((next: Team[]) => {
    setTeams(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const addTeam = useCallback(
    (input: NewTeamInput) => {
      const team = buildTeam(input);
      persist([...teams, team]);
      return team;
    },
    [teams, persist],
  );

  const updateTeam = useCallback(
    (id: string, patch: Partial<Team>) =>
      persist(teams.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [teams, persist],
  );

  const removeTeam = useCallback(
    (id: string) => persist(teams.filter((t) => t.id !== id)),
    [teams, persist],
  );

  const setStatus = useCallback(
    (id: string, status: TeamStatus) =>
      persist(teams.map((t) => (t.id === id ? { ...t, status } : t))),
    [teams, persist],
  );

  const getTeam = useCallback(
    (id: string | null) => (id ? teams.find((t) => t.id === id) : undefined),
    [teams],
  );

  const teamName = useCallback(
    (id: string | null) => (id ? teams.find((t) => t.id === id)?.name ?? "" : ""),
    [teams],
  );

  const value = useMemo<TeamsContextValue>(
    () => ({ teams, addTeam, updateTeam, removeTeam, setStatus, getTeam, teamName }),
    [teams, addTeam, updateTeam, removeTeam, setStatus, getTeam, teamName],
  );

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams must be used within TeamsProvider");
  return ctx;
}
