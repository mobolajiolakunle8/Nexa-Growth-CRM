import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers, workspaces } from "@/db/schema";
import {
  FirebaseAuthError,
  firebaseErrorMessage,
  firebaseSignIn,
  firebaseSignUp,
  firebaseUpdateProfile,
} from "@/lib/firebase/rest";
import { signSession, type SessionUser } from "@/lib/auth/session";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function checkPassword(password: string, stored: string | null) {
  if (!stored?.startsWith("scrypt:")) return false;
  const [, salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function issue(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  workspaceId: number | null;
  role: string;
  provider: string;
}) {
  if (!user.workspaceId) throw new Error("This account has no workspace.");
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

async function createWorkspaceAccount(input: {
  uid: string;
  email: string;
  displayName: string;
  workspaceName: string;
  passwordHash: string | null;
  provider: string;
}) {
  const [workspace] = await db
    .insert(workspaces)
    .values({ name: input.workspaceName, ownerUid: input.uid })
    .returning();
  const [user] = await db
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
  return issue(user);
}

export async function registerWorkspace(input: {
  email?: string;
  password?: string;
  displayName?: string;
  workspaceName?: string;
}) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const displayName = String(input.displayName ?? "").trim();
  const workspaceName =
    String(input.workspaceName ?? "").trim() ||
    (displayName ? `${displayName}'s workspace` : "My workspace");

  if (!validEmail(email)) throw new Error("Enter a valid email address.");
  if (password.length < 6) throw new Error("Use a password with at least 6 characters.");
  if (displayName.length < 2) throw new Error("Enter your name.");

  const [existing] = await db.select().from(appUsers).where(eq(appUsers.email, email));
  if (existing) {
    throw new Error("An account already exists with this email. Log in instead.");
  }

  let uid = `ws_${randomBytes(12).toString("hex")}`;
  let provider = "workspace";

  try {
    const firebaseUser = await firebaseSignUp(email, password);
    uid = firebaseUser.localId || uid;
    provider = "firebase";
    if (firebaseUser.idToken && displayName) {
      await firebaseUpdateProfile(firebaseUser.idToken, displayName).catch(() => undefined);
    }
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      const friendly = firebaseErrorMessage(error.code);
      if (friendly && error.code.includes("EMAIL_EXISTS")) throw new Error(friendly);
      // Provider disabled or the browser/project cannot complete Firebase
      // sign-up. The workspace account below still lets the team in.
    } else {
      throw error;
    }
  }

  return createWorkspaceAccount({
    uid,
    email,
    displayName,
    workspaceName: workspaceName.slice(0, 180),
    passwordHash: hashPassword(password),
    provider,
  });
}

export async function loginWorkspace(input: { email?: string; password?: string }) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  if (!validEmail(email) || !password) {
    throw new Error("Enter your email and password.");
  }

  const [local] = await db.select().from(appUsers).where(eq(appUsers.email, email));
  if (local?.passwordHash && checkPassword(password, local.passwordHash)) {
    await db
      .update(appUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(appUsers.id, local.id));
    return issue(local);
  }

  try {
    const firebaseUser = await firebaseSignIn(email, password);
    const [known] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.uid, firebaseUser.localId));
    if (known) {
      await db
        .update(appUsers)
        .set({ lastLoginAt: new Date(), provider: "firebase" })
        .where(eq(appUsers.id, known.id));
      return issue(known);
    }
    return createWorkspaceAccount({
      uid: firebaseUser.localId,
      email: firebaseUser.email || email,
      displayName: firebaseUser.displayName || email.split("@")[0],
      workspaceName: "My workspace",
      passwordHash: hashPassword(password),
      provider: "firebase",
    });
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      const friendly = firebaseErrorMessage(error.code);
      if (friendly) throw new Error(friendly);
    }
    throw new Error("Email or password is incorrect.");
  }
}
