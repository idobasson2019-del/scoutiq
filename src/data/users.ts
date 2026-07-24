import type { User } from "@/types";

/**
 * Demo login accounts only. No real passwords are stored — mock auth accepts a
 * single shared demo password so the front-end can be exercised. Placeholder to
 * be replaced by Supabase Auth; never ship real credentials.
 *
 * Single scouting department (no clubs/teams). Three roles:
 *  - owner      → full access, including the management area
 *  - scout_lead → all scouting workspace screens, no management area
 *  - scout      → limited: dashboard, players, reports, watchlist, notifications, settings
 */
export const DEMO_PASSWORD = "scoutiq";

export const users: (User & { title: string })[] = [
  {
    id: "u1",
    name: "Ido Basson",
    username: "owner",
    email: "idobasson2019@gmail.com",
    role: "owner",
    teamId: null,
    title: "Owner · Head of Recruitment",
  },
  {
    id: "u2",
    name: "Noa Berkovich",
    username: "lead",
    email: "lead@scoutiq.io",
    role: "scout_lead",
    teamId: null,
    title: "Head of Scouting",
  },
  {
    id: "u3",
    name: "Tomer Halevi",
    username: "scout",
    email: "scout@scoutiq.io",
    role: "scout",
    teamId: null,
    title: "Scout",
  },
];

export function userById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
