"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ScoutingReport } from "@/types";
import { reports as seedReports } from "@/data/reports";

const STORAGE_KEY = "scoutiq.reports";

export interface NewReportInput {
  playerId: string;
  playerName: string;
  position: string;
  author: string;
  type: "live" | "video" | "data";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  decisionMaking: number;
  offBall: number;
  styleFit: number;
  risk: "low" | "medium" | "high";
  potential: number;
  overall: number;
  recommendation: "sign" | "monitor" | "pass";
}

function buildReport(input: NewReportInput): ScoutingReport {
  return {
    id: "r" + Date.now().toString(36),
    date: new Date().toISOString().slice(0, 10),
    read: false,
    ...input,
  };
}

interface ReportsContextValue {
  reports: ScoutingReport[];
  addReport: (input: NewReportInput) => ScoutingReport;
  getReportForPlayer: (playerId: string) => ScoutingReport | undefined;
  markRead: (id: string) => void;
  removeReport: (id: string) => void;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<ScoutingReport[]>(seedReports);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setReports(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const persist = useCallback((next: ScoutingReport[]) => {
    setReports(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const addReport = useCallback(
    (input: NewReportInput) => {
      const report = buildReport(input);
      // Keep one report per player as the "current" one (newest first).
      persist([report, ...reports.filter((r) => r.playerId !== input.playerId)]);
      return report;
    },
    [reports, persist],
  );

  const getReportForPlayer = useCallback(
    (playerId: string) => reports.find((r) => r.playerId === playerId),
    [reports],
  );

  const markRead = useCallback(
    (id: string) => persist(reports.map((r) => (r.id === id ? { ...r, read: true } : r))),
    [reports, persist],
  );

  const removeReport = useCallback(
    (id: string) => persist(reports.filter((r) => r.id !== id)),
    [reports, persist],
  );

  const value = useMemo<ReportsContextValue>(
    () => ({ reports, addReport, getReportForPlayer, markRead, removeReport }),
    [reports, addReport, getReportForPlayer, markRead, removeReport],
  );

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}
