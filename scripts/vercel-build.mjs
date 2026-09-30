#!/usr/bin/env node
/**
 * Vercel build pipeline for NexagrowthCRM.
 *
 * 1. Push the Drizzle schema so a fresh database is provisioned automatically.
 *    A failure here is logged but does not abort the build — the app boots and
 *    reports the problem on /api/deploy/status instead of hard-failing deploys.
 * 2. Run `next build`, which must succeed.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

// Vercel injects env vars into the process directly. Locally we mirror that by
// loading .env.local / .env so the checks below behave identically.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    const { config } = await import("dotenv");
    config({ path: file, quiet: true });
  }
}

const cyan = (text) => `\u001b[36m${text}\u001b[0m`;
const yellow = (text) => `\u001b[33m${text}\u001b[0m`;
const green = (text) => `\u001b[32m${text}\u001b[0m`;

function run(command, args) {
  return spawnSync(command, args, { stdio: "inherit", shell: false });
}

console.log(cyan("▸ NexagrowthCRM · Vercel build"));

if (process.env.DATABASE_URL) {
  if (process.env.SKIP_DB_PUSH === "1") {
    console.log(yellow("▸ SKIP_DB_PUSH=1 — skipping schema sync"));
  } else {
    console.log(cyan("▸ Syncing Drizzle schema to the database…"));
    const push = run("npx", ["drizzle-kit", "push", "--force"]);
    if (push.status !== 0) {
      console.log(
        yellow(
          "▸ Schema sync failed. Continuing so the deploy still ships; check /api/deploy/status after release.",
        ),
      );
    } else {
      console.log(green("▸ Schema is up to date."));
    }
  }
} else {
  console.log(
    yellow("▸ DATABASE_URL not set at build time — skipping schema sync."),
  );
}

console.log(cyan("▸ Building Next.js…"));
const build = run("npx", ["next", "build"]);
process.exit(build.status ?? 1);
