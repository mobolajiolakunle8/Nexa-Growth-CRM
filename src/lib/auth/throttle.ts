import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { authAttempts } from "@/db/schema";
import { AuthError } from "@/lib/auth/errors";

/**
 * Failed-login throttle stored in Postgres. An in-memory counter would be
 * useless on Vercel because every request can land on a different instance.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

export function throttleKey(email: string, ip: string) {
  return `${email.trim().toLowerCase()}|${ip}`.slice(0, 300);
}

export async function assertNotThrottled(key: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const [row] = await db
    .select({ failures: sql<string>`count(*)` })
    .from(authAttempts)
    .where(and(eq(authAttempts.key, key), gt(authAttempts.createdAt, since)));
  if (Number(row?.failures ?? 0) >= MAX_FAILURES) {
    throw new AuthError(
      "Too many failed attempts. Wait 15 minutes and try again.",
      429,
    );
  }
}

export async function recordFailure(key: string) {
  await db.insert(authAttempts).values({ key });
  // opportunistic cleanup keeps the table small without a cron job
  await db
    .delete(authAttempts)
    .where(sql`${authAttempts.createdAt} < now() - interval '1 day'`);
}

export async function clearFailures(key: string) {
  await db.delete(authAttempts).where(eq(authAttempts.key, key));
}
