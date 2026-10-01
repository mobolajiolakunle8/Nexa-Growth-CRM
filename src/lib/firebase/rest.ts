import { AuthError } from "@/lib/auth/errors";
import { firebaseConfig } from "@/lib/firebase/config";

const API_KEY = firebaseConfig.apiKey;
const REFERER = `https://${firebaseConfig.authDomain}/`;

export type FirebaseIdentity = {
  localId: string;
  email: string;
  idToken: string;
  displayName?: string;
};

export class FirebaseCallError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

async function callIdentity(path: string, body: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/${path}?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Referer: REFERER },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      },
    );
  } catch {
    throw new FirebaseCallError("NETWORK");
  }

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  > & { error?: { message?: string } };

  if (!response.ok) {
    const message = payload.error?.message ?? "FIREBASE_ERROR";
    throw new FirebaseCallError(message.split(" ")[0] ?? message);
  }
  return payload;
}

function asIdentity(payload: Record<string, unknown>): FirebaseIdentity {
  return {
    localId: String(payload.localId ?? ""),
    email: String(payload.email ?? ""),
    idToken: String(payload.idToken ?? ""),
    displayName:
      typeof payload.displayName === "string" ? payload.displayName : undefined,
  };
}

export async function firebaseSignUp(email: string, password: string) {
  return asIdentity(
    await callIdentity("accounts:signUp", {
      email,
      password,
      returnSecureToken: true,
    }),
  );
}

export async function firebaseSignIn(email: string, password: string) {
  return asIdentity(
    await callIdentity("accounts:signInWithPassword", {
      email,
      password,
      returnSecureToken: true,
    }),
  );
}

export async function firebaseSetDisplayName(idToken: string, displayName: string) {
  await callIdentity("accounts:update", {
    idToken,
    displayName,
    returnSecureToken: false,
  });
}

/**
 * Turns a raw Firebase error into something the user (or the operator) can act
 * on. Configuration problems are reported as such, with the exact fix, rather
 * than being papered over.
 */
export function explainFirebaseError(error: unknown): AuthError {
  const code = error instanceof FirebaseCallError ? error.code : "UNKNOWN";

  if (code.includes("EMAIL_EXISTS")) {
    return new AuthError("An account already exists with this email. Log in instead.", 409);
  }
  if (code.includes("INVALID_EMAIL")) {
    return new AuthError("Enter a valid email address.", 400);
  }
  if (code.includes("WEAK_PASSWORD")) {
    return new AuthError("Choose a stronger password.", 400);
  }
  if (
    code.includes("INVALID_PASSWORD") ||
    code.includes("INVALID_LOGIN_CREDENTIALS") ||
    code.includes("EMAIL_NOT_FOUND")
  ) {
    return new AuthError("Email or password is incorrect.", 401);
  }
  if (code.includes("USER_DISABLED")) {
    return new AuthError("This account has been disabled.", 403);
  }
  if (code.includes("TOO_MANY_ATTEMPTS")) {
    return new AuthError("Too many attempts. Wait a few minutes and try again.", 429);
  }
  if (code.includes("OPERATION_NOT_ALLOWED")) {
    return new AuthError(
      "Email/password sign-in is not enabled in the Firebase project. Enable it under Firebase Console → Authentication → Sign-in method, or set AUTH_PROVIDER=local.",
      503,
    );
  }
  if (code === "NETWORK") {
    return new AuthError("The authentication service is unreachable. Try again shortly.", 503);
  }
  console.error("[firebase]", code);
  return new AuthError("The authentication service rejected the request.", 502);
}

export type FirebaseProbe = {
  reachable: boolean;
  emailPasswordEnabled: boolean | null;
  detail: string;
};

/**
 * Cheap readiness check: sign in with a non-existent account. "Not found"
 * proves the provider is enabled; OPERATION_NOT_ALLOWED proves it is not.
 */
export async function probeFirebase(): Promise<FirebaseProbe> {
  try {
    await callIdentity("accounts:signInWithPassword", {
      email: "readiness-probe@nexagrowthcrm.invalid",
      password: "readiness-probe",
      returnSecureToken: false,
    });
    return { reachable: true, emailPasswordEnabled: true, detail: "ok" };
  } catch (error) {
    const code = error instanceof FirebaseCallError ? error.code : "UNKNOWN";
    if (code === "NETWORK") {
      return { reachable: false, emailPasswordEnabled: null, detail: "unreachable" };
    }
    if (code.includes("OPERATION_NOT_ALLOWED")) {
      return {
        reachable: true,
        emailPasswordEnabled: false,
        detail: "Email/Password sign-in is disabled in the Firebase project",
      };
    }
    return { reachable: true, emailPasswordEnabled: true, detail: "ok" };
  }
}
