import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { DatabaseNotConfiguredError, resolveDatabaseUrl } from "@/db/url";

export { DatabaseNotConfiguredError } from "@/db/url";

/**
 * Serverless-aware Postgres client.
 *
 * On Vercel every warm lambda keeps its own pool, so a large `max` multiplies
 * across instances and exhausts the database. We therefore keep the pool tiny
 * in serverless and cache it on `globalThis` so warm invocations reuse it.
 * Initialisation is lazy so `next build` never fails when DATABASE_URL is
 * absent at build time — it only throws on the first real query.
 */

const globalForDb = globalThis as typeof globalThis & {
  __nexagrowthPool?: Pool;
  __nexagrowthDb?: NodePgDatabase;
};

export const isServerless = Boolean(process.env.VERCEL);

function isLocalConnection(url: string) {
  return /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
}

function buildPoolConfig(url: string): PoolConfig {
  const config: PoolConfig = {
    connectionString: url,
    // one connection per lambda keeps us far below provider limits
    max: Number(process.env.PG_POOL_MAX ?? (isServerless ? 1 : 10)),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT ?? 10_000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT ?? 10_000),
    allowExitOnIdle: isServerless,
  };

  // Hosted providers (Neon, Supabase, Vercel Postgres, RDS) require TLS.
  // Respect an explicit sslmode in the URL when the operator set one.
  if (!isLocalConnection(url) && !/[?&]sslmode=/.test(url)) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

export function getPool(): Pool {
  if (!globalForDb.__nexagrowthPool) {
    const resolved = resolveDatabaseUrl();
    if (!resolved) throw new DatabaseNotConfiguredError();
    const pool = new Pool(buildPoolConfig(resolved.url));
    // A pool-level error must never crash the lambda.
    pool.on("error", (error) => {
      console.error("[db] idle client error", error.message);
    });
    globalForDb.__nexagrowthPool = pool;
  }
  return globalForDb.__nexagrowthPool;
}

function getDb(): NodePgDatabase {
  if (!globalForDb.__nexagrowthDb) {
    globalForDb.__nexagrowthDb = drizzle(getPool());
  }
  return globalForDb.__nexagrowthDb;
}

/**
 * Proxy keeps the familiar `import { db } from "@/db"` API while deferring the
 * real connection until the first property access at request time.
 */
export const db = new Proxy({} as NodePgDatabase, {
  get(_target, property, receiver) {
    const instance = getDb();
    const value = Reflect.get(
      instance as unknown as object,
      property,
      receiver,
    );
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});

export async function checkDatabase() {
  const started = Date.now();
  const client = await getPool().connect();
  try {
    await client.query("select 1");
    return { ok: true as const, latencyMs: Date.now() - started };
  } finally {
    client.release();
  }
}
