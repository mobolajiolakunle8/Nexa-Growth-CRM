import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";
import { resolveMigrationUrl } from "./src/db/url";

// drizzle-kit runs outside Next.js, so load .env / .env.local manually.
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const url =
  resolveMigrationUrl()?.url ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url,
    // hosted providers need TLS; local postgres does not
    ssl: /@(localhost|127\.0\.0\.1)/.test(url)
      ? false
      : { rejectUnauthorized: false },
  },
} satisfies Config;
