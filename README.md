# ScoutIQ

Front-end prototype for a professional football scouting and recruitment workspace.
Bilingual Hebrew/English with full RTL support, desktop-first, dark theme.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Radix UI · Lucide

## Running locally

```bash
npm install
npm run dev     # development server on http://localhost:5183
npm run build   # production build
npm start       # production server on http://localhost:5183
```

## Deploying to GitHub Pages

```bash
npm run build:pages
```

This produces a static export in `out/` with the `/scoutiq` base path, ready to be
published to the `gh-pages` branch.

## Notes on data and security

This is a front-end prototype. All data (players, needs, reports, teams, users)
lives in the browser's `localStorage` — there is no backend and no server-side
storage. Login is simulated client-side; **no real credentials belong in this
repository**, and none are stored here. Passwords set through the UI are
prototype-only values kept in the visitor's own browser.

There is no payment or card processing in the app — club billing is handled
outside the product, per contract.

The data layer is isolated behind context stores (`src/lib/*-store.tsx`) so it can
later be swapped for Supabase Auth and Row Level Security without touching the UI.
