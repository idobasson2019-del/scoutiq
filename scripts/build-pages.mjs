// Builds the static export for GitHub Pages.
// Kept as a script so the env var works the same on Windows and POSIX shells.
import { spawnSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_SCOUTIQ_PUBLIC: "true" },
});

if (result.status !== 0) process.exit(result.status ?? 1);

// Tells GitHub Pages not to run Jekyll, which would drop the _next folder.
if (existsSync("out")) writeFileSync("out/.nojekyll", "");

console.log("\nStatic export ready in ./out");
