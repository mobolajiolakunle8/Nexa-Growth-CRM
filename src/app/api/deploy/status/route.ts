import { sql } from "drizzle-orm";
import { checkDatabase, db, isServerless } from "@/db";
import { authMode } from "@/lib/auth/config";
import { getAuthSecret } from "@/lib/auth/secret";
import { firebaseConfig } from "@/lib/firebase/config";
import { probeFirebase } from "@/lib/firebase/rest";

export const dynamic = "force-dynamic";

/**
 * NEXT_PUBLIC_* values are inlined at build time, so a dynamic
 * `process.env[key]` lookup is unreliable on the server. We instead assert on
 * the resolved config object the app actually boots with.
 */
const PUBLIC_CHECKS: Record<string, boolean> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: Boolean(firebaseConfig.apiKey),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: Boolean(firebaseConfig.authDomain),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: Boolean(firebaseConfig.projectId),
  NEXT_PUBLIC_FIREBASE_APP_ID: Boolean(firebaseConfig.appId),
};

const REQUIRED_SERVER_ENV = ["DATABASE_URL"];

const EXPECTED_TABLES = [
  "companies",
  "contacts",
  "deals",
  "tasks",
  "activities",
  "app_users",
  "stripe_invoices",
  "integration_connections",
];

/**
 * Post-deploy readiness probe. Reports whether the environment is wired up
 * correctly without ever echoing secret values back to the caller.
 */
export async function GET() {
  const env = {
    public: PUBLIC_CHECKS,
    server: Object.fromEntries(
      REQUIRED_SERVER_ENV.map((key) => [key, Boolean(process.env[key])]),
    ),
  };

  const missing = [
    ...Object.entries(PUBLIC_CHECKS)
      .filter(([, present]) => !present)
      .map(([key]) => key),
    ...REQUIRED_SERVER_ENV.filter((key) => !process.env[key]),
  ];

  let database: Record<string, unknown> = { connected: false };
  const missingTables: string[] = [];

  try {
    const { latencyMs } = await checkDatabase();
    const result = await db.execute<{ table_name: string }>(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    );
    const present = new Set(result.rows.map((row) => row.table_name));
    for (const table of EXPECTED_TABLES) {
      if (!present.has(table)) missingTables.push(table);
    }
    database = {
      connected: true,
      latencyMs,
      tableCount: present.size,
      missingTables,
    };
  } catch (error) {
    database = {
      connected: false,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }

  const mode = authMode();
  const secret = await getAuthSecret().catch(() => null);
  const firebase = mode === "firebase" ? await probeFirebase() : null;
  const auth = {
    mode,
    sessionSecret: secret?.source ?? "unavailable",
    firebase,
  };
  const authReady =
    secret !== null &&
    (mode === "local" ||
      (firebase?.reachable === true && firebase.emailPasswordEnabled === true));
  if (!authReady) {
    missing.push(
      mode === "firebase"
        ? "AUTH_PROVIDER=firebase but Firebase Email/Password sign-in is not usable"
        : "session secret",
    );
  }

  const ready =
    authReady &&
    missing.length === 0 &&
    database.connected === true &&
    missingTables.length === 0;

  return Response.json(
    {
      ready,
      app: "NexagrowthCRM",
      currency: "NGN",
      deployment: {
        platform: process.env.VERCEL ? "vercel" : "self-hosted",
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
        region: process.env.VERCEL_REGION ?? "local",
        url: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        serverlessPooling: isServerless,
      },
      env,
      auth,
      missing,
      database,
      checkedAt: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
