"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role, User } from "@/types";
import { users as seedUsers } from "@/data/users";

const STORAGE_KEY = "scoutiq.users";

export interface NewUserInput {
  name: string;
  email: string;
  username: string;
  role: Role;
  teamId: string | null;
  title?: string;
  password?: string;
}

function buildUser(input: NewUserInput): User {
  return {
    id: "u" + Date.now().toString(36),
    name: input.name.trim(),
    email: input.email.trim(),
    username: input.username.trim() || input.email.trim(),
    role: input.role,
    teamId: input.teamId,
    title: input.title,
    password: input.password?.trim() || undefined,
  };
}

interface UsersContextValue {
  users: User[];
  ready: boolean;
  addUser: (input: NewUserInput) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;
  userById: (id: string) => User | undefined;
  findByCredential: (identifier: string) => User | undefined;
  usersForTeam: (teamId: string | null) => User[];
}

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUsers(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: User[]) => {
    setUsers(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const addUser = useCallback(
    (input: NewUserInput) => {
      const user = buildUser(input);
      persist([...users, user]);
      return user;
    },
    [users, persist],
  );

  const updateUser = useCallback(
    (id: string, patch: Partial<User>) =>
      persist(users.map((u) => (u.id === id ? { ...u, ...patch } : u))),
    [users, persist],
  );

  const removeUser = useCallback(
    (id: string) => persist(users.filter((u) => u.id !== id)),
    [users, persist],
  );

  const userById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  const findByCredential = useCallback(
    (identifier: string) => {
      const id = identifier.trim().toLowerCase();
      return users.find(
        (u) => u.username.toLowerCase() === id || u.email.toLowerCase() === id,
      );
    },
    [users],
  );

  const usersForTeam = useCallback(
    (teamId: string | null) => users.filter((u) => u.teamId === teamId),
    [users],
  );

  const value = useMemo<UsersContextValue>(
    () => ({
      users,
      ready,
      addUser,
      updateUser,
      removeUser,
      userById,
      findByCredential,
      usersForTeam,
    }),
    [users, ready, addUser, updateUser, removeUser, userById, findByCredential, usersForTeam],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}
