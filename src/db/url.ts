/**
 * Resolves the Postgres connection string from the environment.
 *
 * Hosted providers inject different variable names: Neon and Supabase via the
 * Vercel Marketplace set DATABASE_URL and/or POSTGRES_URL, older Vercel
 * Postgres sets POSTGRES_URL / POSTGRES_PRISMA_URL. Accepting all of them means
 * connecting a database in Vercel → Storage works without renaming anything.
 */

// Runtime queries: prefer pooled connections (serverless-friendly).
const RUNTIME_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
  "SUPABASE_DB_URL",
] as const;

// Schema migrations: prefer direct (non-pooled) connections, which DDL needs
// on PgBouncer-style poolers.
const MIGRATION_KEYS = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  ...RUNTIME_KEYS,
] as const;

export type ResolvedDatabaseUrl = { url: string; source: string };

function resolve(keys: readonly string[]): ResolvedDatabaseUrl | null {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value && /^postgres(ql)?:\/\//i.test(value)) {
      return { url: value, source: key };
    }
  }
  return null;
}

export function resolveDatabaseUrl() {
  return resolve(RUNTIME_KEYS);
}

export function resolveMigrationUrl() {
  return resolve(MIGRATION_KEYS);
}

export const DATABASE_ENV_KEYS = RUNTIME_KEYS;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      `No Postgres connection string found. Set one of: ${RUNTIME_KEYS.join(", ")}.`,
    );
    this.name = "DatabaseNotConfiguredError";
  }
}
