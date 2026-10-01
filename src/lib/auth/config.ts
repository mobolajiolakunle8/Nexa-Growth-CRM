/**
 * Exactly one identity provider is active at a time. There is no runtime
 * fallback between them: if the configured provider cannot complete a request
 * the user gets a clear error, never a silently different kind of account.
 *
 *   local     (default) accounts live in this app's Postgres database, with
 *             scrypt-hashed passwords. Works on any domain with no third-party
 *             setup.
 *   firebase  accounts live in Firebase Authentication (email + password). The
 *             Firebase project must have Email/Password enabled.
 */
export type AuthMode = "local" | "firebase";

export function authMode(): AuthMode {
  const raw = (process.env.AUTH_PROVIDER ?? "local").trim().toLowerCase();
  return raw === "firebase" ? "firebase" : "local";
}

export const MIN_PASSWORD_LENGTH = 8;
