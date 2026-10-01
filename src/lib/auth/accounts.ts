import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers, workspaces } from "@/db/schema";
import { authMode, MIN_PASSWORD_LENGTH } from "@/lib/auth/config";
import { AuthError } from "@/lib/auth/errors";
import { signSession, type SessionUser } from "@/lib/auth/session";
import {
  assertNotThrottled,
  clearFailures,
  recordFailure,
  throttleKey,
} from "@/lib/auth/throttle";
import {
  explainFirebaseError,
  firebaseSetDisplayName,
  firebaseSignIn,
  firebaseSignUp,
} from "@/lib/firebase/rest";

/* ───────────────────────── password hashing ───────────────────────── */

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

// A real hash to compare against when the account does not exist, so a missing
// user and a wrong password take the same time and cannot be told apart.
const DECOY_HASH = hashPassword(randomBytes(12).toString("hex"));

function verifyPassword(password: string, stored: string | null) {
  const target = stored?.startsWith("scrypt:") ? stored : DECOY_HASH;
  const [, salt, hash] = target.split(":");
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  const matches =
    actual.length === expected.length && timingSafeEqual(actual, expected);
  return matches && target === stored;
}

/* ───────────────────────────── validation ──────────────────────────── */

function cleanEmail(raw: unknown) {
  const email = String(raw ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    throw new AuthError("Enter a valid email address.", 400);
  }
  return email;
}

/* ─────────────────────────────── sessions ───────────────────────────── */

type UserRow = typeof appUsers.$inferSelect;

async function startSession(user: UserRow) {
  if (!user.workspaceId) {
    throw new AuthError("This account has no workspace. Contact support.", 409);
  }
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, user.workspaceId));

  const sessionUser: SessionUser = {
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? user.email ?? "Workspace owner",
    workspaceId: user.workspaceId,
    workspaceName: workspace?.name ?? "Workspace",
    role: user.role,
    provider: user.provider,
  };
  return { user: sessionUser, token: await signSession(sessionUser) };
}

async function createAccountWithWorkspace(input: {
  uid: string;
  email: string;
  displayName: string;
  workspaceName: string;
  passwordHash: string | null;
  provider: "local" | "firebase";
}) {
  // One transaction: a failure can never leave a user without a workspace or a
  // workspace without an owner.
  const user = await db.transaction(async (tx) => {
    const [workspace] = await tx
      .insert(workspaces)
      .values({ name: input.workspaceName, ownerUid: input.uid })
      .returning();
    const [created] = await tx
      .insert(appUsers)
      .values({
        uid: input.uid,
        email: input.email,
        displayName: input.displayName,
        passwordHash: input.passwordHash,
        provider: input.provider,
        role: "owner",
        workspaceId: workspace.id,
        company: input.workspaceName,
        plan: "workspace",
        emailVerified: input.provider === "firebase",
      })
      .returning();
    return created;
  });
  return startSession(user);
}

/* ─────────────────────────────── sign up ───────────────────────────── */

export async function registerWorkspace(input: {
  email?: string;
  password?: string;
  displayName?: string;
  workspaceName?: string;
}) {
  const email = cleanEmail(input.email);
  const password = String(input.password ?? "");
  const displayName = String(input.displayName ?? "").trim().slice(0, 120);
  const workspaceName = (
    String(input.workspaceName ?? "").trim() || `${displayName}'s workspace`
  ).slice(0, 180);

  if (displayName.length < 2) throw new AuthError("Enter your name.", 400);
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`,
      400,
    );
  }

  const [existing] = await db
    .select({ id: appUsers.id })
    .from(appUsers)
    .where(eq(appUsers.email, email));
  if (existing) {
    throw new AuthError("An account already exists with this email. Log in instead.", 409);
  }

  if (authMode() === "firebase") {
    let identity;
    try {
      identity = await firebaseSignUp(email, password);
      if (displayName) {
        await firebaseSetDisplayName(identity.idToken, displayName).catch(
          () => undefined,
        );
      }
    } catch (error) {
      throw explainFirebaseError(error);
    }
    return createAccountWithWorkspace({
      uid: identity.localId,
      email,
      displayName,
      workspaceName,
      passwordHash: null,
      provider: "firebase",
    });
  }

  return createAccountWithWorkspace({
    uid: `usr_${randomBytes(12).toString("hex")}`,
    email,
    displayName,
    workspaceName,
    passwordHash: hashPassword(password),
    provider: "local",
  });
}

/* ─────────────────────────────── log in ────────────────────────────── */

export async function loginWorkspace(input: {
  email?: string;
  password?: string;
  ip: string;
}) {
  const email = cleanEmail(input.email);
  const password = String(input.password ?? "");
  if (!password) throw new AuthError("Enter your password.", 400);

  const key = throttleKey(email, input.ip);
  await assertNotThrottled(key);

  const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email));

  if (authMode() === "firebase") {
    let identity;
    try {
      identity = await firebaseSignIn(email, password);
    } catch (error) {
      const explained = explainFirebaseError(error);
      if (explained.status === 401) await recordFailure(key);
      throw explained;
    }

    const [known] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.uid, identity.localId));
    await clearFailures(key);

    if (known) {
      await db
        .update(appUsers)
        .set({ lastLoginAt: new Date() })
        .where(eq(appUsers.id, known.id));
      return startSession(known);
    }
    // Valid Firebase identity that has never opened a workspace here.
    return createAccountWithWorkspace({
      uid: identity.localId,
      email,
      displayName: identity.displayName || email.split("@")[0],
      workspaceName: `${identity.displayName || email.split("@")[0]}'s workspace`,
      passwordHash: null,
      provider: "firebase",
    });
  }

  // local mode: the database is the single source of truth
  if (!user || user.provider !== "local" || !verifyPassword(password, user.passwordHash)) {
    await recordFailure(key);
    throw new AuthError("Email or password is incorrect.", 401);
  }

  await clearFailures(key);
  await db
    .update(appUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(appUsers.id, user.id));
  return startSession(user);
}
