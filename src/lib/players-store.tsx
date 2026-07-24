"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Player } from "@/types";
import { players as seedPlayers } from "@/data/players";
import { EMPTY_STATS } from "@/lib/stats";

const STORAGE_KEY = "scoutiq.players";

/**
 * Players a user may see: the owner sees everyone; a team member sees only
 * players proposed to their team.
 */
export function scopePlayers(
  players: Player[],
  teamId: string | null,
  isAdmin: boolean,
): Player[] {
  if (isAdmin) return players;
  if (!teamId) return [];
  return players.filter((p) => p.teamIds.includes(teamId));
}

/** Fields collected from the "Add player" form; the rest get sensible defaults. */
export interface NewPlayerInput {
  name: string;
  age: number;
  nationality: string;
  currentTeam: string;
  league: string;
  position: string;
  secondaryPosition: string;
  foot: Player["foot"];
  height: number;
  weight: number;
  shirtNumber: number;
  marketValue: number;
  salary: number;
  contractEnd: string;
  agent: string;
  scoutingScore: number;
  potential: number;
  status: Player["status"];
  availability: Player["availability"];
  risk: Player["risk"];
  photoUrl?: string;
  /** The single team this player is proposed to ("" = none / owner-only). */
  teamId?: string;
}

const PALETTE = ["#2f7d6b", "#3b6ea5", "#9a5b3b", "#7a4b8a", "#4a7a4a", "#a5623b"];

function buildPlayer(input: NewPlayerInput): Player {
  const id = "p" + Date.now().toString(36);
  const birthYear = new Date().getFullYear() - input.age;
  return {
    id,
    name: input.name.trim(),
    photoColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    photoUrl: input.photoUrl?.trim() || undefined,
    age: input.age,
    birthDate: `${birthYear}-01-01`,
    nationality: input.nationality.trim(),
    nationalityCode: "",
    currentTeam: input.currentTeam.trim(),
    league: input.league.trim(),
    position: input.position,
    secondaryPosition: input.secondaryPosition,
    foot: input.foot,
    height: input.height,
    weight: input.weight,
    shirtNumber: input.shirtNumber,
    marketValue: input.marketValue,
    salary: input.salary,
    contractEnd: input.contractEnd,
    agent: input.agent.trim(),
    scoutingScore: input.scoutingScore,
    status: input.status,
    proposedDate: new Date().toISOString().slice(0, 10),
    availability: input.availability,
    teamIds: input.teamId ? [input.teamId] : [],
    potential: input.potential,
    risk: input.risk,
    stats: { ...EMPTY_STATS },
  };
}

interface PlayersContextValue {
  players: Player[];
  addPlayer: (input: NewPlayerInput) => Player;
  /** Returns false when the browser refused to store the data (quota). */
  updatePlayer: (id: string, patch: Partial<Player>) => boolean;
  removePlayer: (id: string) => void;
  getPlayer: (id: string) => Player | undefined;
}

const PlayersContext = createContext<PlayersContextValue | null>(null);

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>(seedPlayers);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setPlayers(JSON.parse(raw));
      } catch {
        /* ignore corrupt storage */
      }
    }
  }, []);

  /**
   * Writes to localStorage. Uploaded video/photo data URLs can exceed the
   * browser quota, so a failure is reported instead of throwing — the caller
   * shows an error and the previous saved state is left intact.
   */
  const persist = useCallback((next: Player[]) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        return false;
      }
    }
    setPlayers(next);
    return true;
  }, []);

  const addPlayer = useCallback(
    (input: NewPlayerInput) => {
      const player = buildPlayer(input);
      persist([player, ...players]);
      return player;
    },
    [players, persist],
  );

  const updatePlayer = useCallback(
    (id: string, patch: Partial<Player>) =>
      persist(players.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [players, persist],
  );

  const removePlayer = useCallback(
    (id: string) => {
      persist(players.filter((p) => p.id !== id));
    },
    [players, persist],
  );

  const getPlayer = useCallback(
    (id: string) => players.find((p) => p.id === id),
    [players],
  );

  const value = useMemo<PlayersContextValue>(
    () => ({ players, addPlayer, updatePlayer, removePlayer, getPlayer }),
    [players, addPlayer, updatePlayer, removePlayer, getPlayer],
  );

  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error("usePlayers must be used within PlayersProvider");
  return ctx;
}
