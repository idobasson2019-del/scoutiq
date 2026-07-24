"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role, TeamStatus, User } from "@/types";
import { DEMO_PASSWORD } from "@/data/users";
import { useUsers } from "@/lib/users-store";
import { useTeams } from "@/lib/teams-store";

const STORAGE_KEY = "scoutiq.user";

type LoginResult =
  | { ok: true; blocked: boolean }
  | { ok: false; reason: "invalid" };

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function isBlockedStatus(status: TeamStatus | undefined): boolean {
  return status === "suspended" || status === "contract_ended";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { users, ready: usersReady, findByCredential } = useUsers();
  const { getTeam } = useTeams();
  const [userId, setUserId] = useState<string | null>(null);
  const [authRead, setAuthRead] = useState(false);

  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    setUserId(id);
    setAuthRead(true);
  }, []);

  const user = useMemo(
    () => (userId ? users.find((u) => u.id === userId) ?? null : null),
    [userId, users],
  );

  const blockedFor = useCallback(
    (u: User | null) => {
      if (!u?.teamId) return false;
      return isBlockedStatus(getTeam(u.teamId)?.status);
    },
    [getTeam],
  );

  const login = useCallback(
    (identifier: string, password: string): LoginResult => {
      const found = findByCredential(identifier);
      // Each user may have their own mock password; otherwise the shared demo
      // password applies. (Placeholder for real hashed auth via Supabase.)
      const expected = found?.password ?? DEMO_PASSWORD;
      if (!found || password !== expected) {
        return { ok: false, reason: "invalid" };
      }
      window.localStorage.setItem(STORAGE_KEY, found.id);
      setUserId(found.id);
      return { ok: true, blocked: blockedFor(found) };
    },
    [findByCredential, blockedFor],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready: authRead && usersReady,
      isAdmin: user?.role === "owner",
      login,
      logout,
    }),
    [user, authRead, usersReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Hook: is the given user's team blocked (suspended / contract ended)? */
export function useIsBlocked(teamId: string | null): boolean {
  const { getTeam } = useTeams();
  if (!teamId) return false;
  return isBlockedStatus(getTeam(teamId)?.status);
}

export function roleCanAccessAdmin(role: Role | undefined) {
  return role === "owner";
}
