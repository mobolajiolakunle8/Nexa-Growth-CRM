import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

/**
 * Signing key for session cookies.
 *
 * Preferred: set AUTH_SECRET (>= 32 chars) in the environment.
 * Otherwise a random 256-bit key is generated once and stored in Postgres so
 * every serverless instance signs and verifies with the same key. It is never
 * derived from anything public.
 */
const SETTING_KEY = "auth_secret";

let cached: { key: Uint8Array; source: "env" | "database" } | null = null;

export async function getAuthSecret() {
  if (cached) return cached;

  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv) {
    if (fromEnv.length < 32) {
      throw new Error("AUTH_SECRET must be at least 32 characters long.");
    }
    cached = { key: new TextEncoder().encode(fromEnv), source: "env" };
    return cached;
  }

  let [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, SETTING_KEY));

  if (!row) {
    await db
      .insert(appSettings)
      .values({ key: SETTING_KEY, value: randomBytes(32).toString("hex") })
      .onConflictDoNothing();
    [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, SETTING_KEY));
  }

  cached = { key: new TextEncoder().encode(row.value), source: "database" };
  return cached;
}
