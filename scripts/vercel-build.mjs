#!/usr/bin/env node
/**
 * Vercel build pipeline for NexagrowthCRM.
 *
 * 1. Resolve the Postgres connection string from any of the names hosted
 *    providers inject (DATABASE_URL, POSTGRES_URL, …).
 * 2. Push the Drizzle schema so a fresh database gets every table.
 * 3. Run `next build`.
 *
 * A production build without a reachable database is refused: shipping a site
 * whose login cannot work is worse than a failed deploy that says why.
 * Set ALLOW_NO_DATABASE=1 to override (e.g. for a marketing-only preview).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

// Vercel injects env vars directly; locally mirror that from .env files.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    const { config } = await import("dotenv");
    config({ path: file, quiet: true });
  }
}

// Keep in sync with src/db/url.ts
const RUNTIME_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
  "SUPABASE_DB_URL",
];
const MIGRATION_KEYS = ["DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING", ...RUNTIME_KEYS];

const cyan = (text) => `\u001b[36m${text}\u001b[0m`;
const yellow = (text) => `\u001b[33m${text}\u001b[0m`;
const green = (text) => `\u001b[32m${text}\u001b[0m`;
const red = (text) => `\u001b[31m${text}\u001b[0m`;

function firstSet(keys) {
  return keys.find((key) => /^postgres(ql)?:\/\//i.test(process.env[key]?.trim() ?? ""));
}

function run(command, args) {
  return spawnSync(command, args, { stdio: "inherit", shell: false });
}

const isProduction = process.env.VERCEL_ENV === "production";
const allowNoDatabase = process.env.ALLOW_NO_DATABASE === "1";

function abort(message) {
  console.error(red(`✖ ${message}`));
  process.exit(1);
}

console.log(cyan("▸ NexagrowthCRM · Vercel build"));

const runtimeKey = firstSet(RUNTIME_KEYS);
const migrationKey = firstSet(MIGRATION_KEYS);

if (!runtimeKey) {
  const message =
    "No Postgres connection string found. Connect a database in Vercel → Storage " +
    "(Neon or Supabase), or set DATABASE_URL in Settings → Environment Variables, then redeploy.";
  if (isProduction && !allowNoDatabase) abort(message);
  console.log(yellow(`▸ ${message}`));
  console.log(yellow("▸ Continuing without a database — login and signup will not work."));
} else {
  console.log(green(`▸ Database: using ${runtimeKey} (migrations via ${migrationKey}).`));

  if (process.env.SKIP_DB_PUSH === "1") {
    console.log(yellow("▸ SKIP_DB_PUSH=1 — skipping schema sync."));
  } else {
    console.log(cyan("▸ Syncing Drizzle schema…"));
    const push = run("npx", ["drizzle-kit", "push", "--force"]);
    if (push.status !== 0) {
      const message =
        "Schema sync failed. Check that the connection string is correct and the database is reachable.";
      if (isProduction && !allowNoDatabase) abort(message);
      console.log(yellow(`▸ ${message}`));
    } else {
      console.log(green("▸ Schema is up to date."));
    }
  }
}

console.log(cyan("▸ Building Next.js…"));
const build = run("npx", ["next", "build"]);
process.exit(build.status ?? 1);
