"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { RecruitmentNeed, DealType, Foot } from "@/types";
import { needs as seedNeeds } from "@/data/needs";

const STORAGE_KEY = "scoutiq.needs";

export interface NewNeedInput {
  title: string;
  position: string;
  secondaryPosition: string;
  count: number;
  minAge: number;
  maxAge: number;
  foot: Foot | "any";
  minHeight: number;
  nationality: string;
  leagues: string[];
  transferBudget: number;
  maxSalary: number;
  dealType: DealType;
  deadline: string;
  urgency: "low" | "medium" | "high";
  formation: string;
  playStyle: string;
  keyAttributes: string[];
  notes: string;
  openedBy: string;
}

function buildNeed(input: NewNeedInput): RecruitmentNeed {
  return {
    id: "n" + Date.now().toString(36),
    teamId: "org",
    status: "new",
    openedDate: new Date().toISOString().slice(0, 10),
    proposedPlayerIds: [],
    ...input,
  };
}

interface NeedsContextValue {
  needs: RecruitmentNeed[];
  addNeed: (input: NewNeedInput) => RecruitmentNeed;
  getNeed: (id: string) => RecruitmentNeed | undefined;
  removeNeed: (id: string) => void;
}

const NeedsContext = createContext<NeedsContextValue | null>(null);

export function NeedsProvider({ children }: { children: React.ReactNode }) {
  const [needs, setNeeds] = useState<RecruitmentNeed[]>(seedNeeds);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setNeeds(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const persist = useCallback((next: RecruitmentNeed[]) => {
    setNeeds(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const addNeed = useCallback(
    (input: NewNeedInput) => {
      const need = buildNeed(input);
      persist([need, ...needs]);
      return need;
    },
    [needs, persist],
  );

  const getNeed = useCallback(
    (id: string) => needs.find((n) => n.id === id),
    [needs],
  );

  const removeNeed = useCallback(
    (id: string) => persist(needs.filter((n) => n.id !== id)),
    [needs, persist],
  );

  const value = useMemo<NeedsContextValue>(
    () => ({ needs, addNeed, getNeed, removeNeed }),
    [needs, addNeed, getNeed, removeNeed],
  );

  return <NeedsContext.Provider value={value}>{children}</NeedsContext.Provider>;
}

export function useNeeds() {
  const ctx = useContext(NeedsContext);
  if (!ctx) throw new Error("useNeeds must be used within NeedsProvider");
  return ctx;
}
