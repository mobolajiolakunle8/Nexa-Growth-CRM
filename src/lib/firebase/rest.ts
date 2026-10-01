import { firebaseConfig } from "@/lib/firebase/config";

const API_KEY = firebaseConfig.apiKey;
const REFERER = `https://${firebaseConfig.authDomain}/`;

export type FirebaseIdentity = {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  displayName?: string;
};

type FirebaseErrorBody = {
  error?: { message?: string };
};

export class FirebaseAuthError extends Error {
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
        headers: {
          "Content-Type": "application/json",
          Referer: REFERER,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      },
    );
  } catch {
    throw new FirebaseAuthError("NETWORK");
  }

  const payload = (await response.json().catch(() => ({}))) as FirebaseErrorBody &
    Record<string, unknown>;
  if (!response.ok) {
    const message = payload.error?.message ?? "FIREBASE_ERROR";
    throw new FirebaseAuthError(message.split(" ")[0] ?? message);
  }
  return payload;
}

function asIdentity(payload: Record<string, unknown>): FirebaseIdentity {
  return {
    localId: String(payload.localId ?? ""),
    email: String(payload.email ?? ""),
    idToken: String(payload.idToken ?? ""),
    refreshToken: String(payload.refreshToken ?? ""),
    displayName:
      typeof payload.displayName === "string" ? payload.displayName : undefined,
  };
}

export async function firebaseSignUp(email: string, password: string) {
  const payload = await callIdentity("accounts:signUp", {
    email,
    password,
    returnSecureToken: true,
  });
  return asIdentity(payload);
}

export async function firebaseSignIn(email: string, password: string) {
  const payload = await callIdentity("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
  return asIdentity(payload);
}

export async function firebaseUpdateProfile(idToken: string, displayName: string) {
  await callIdentity("accounts:update", {
    idToken,
    displayName,
    returnSecureToken: false,
  });
}

export async function firebaseSendReset(email: string) {
  await callIdentity("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}

export function firebaseErrorMessage(code: string) {
  if (code.includes("EMAIL_EXISTS")) {
    return "An account already exists with this email. Log in instead.";
  }
  if (code.includes("INVALID_EMAIL")) return "That email address is not valid.";
  if (code.includes("WEAK_PASSWORD")) {
    return "Choose a password with at least 6 characters.";
  }
  if (
    code.includes("INVALID_PASSWORD") ||
    code.includes("INVALID_LOGIN_CREDENTIALS") ||
    code.includes("EMAIL_NOT_FOUND")
  ) {
    return "Email or password is incorrect.";
  }
  if (code.includes("TOO_MANY_ATTEMPTS")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (code.includes("USER_DISABLED")) return "This account has been disabled.";
  return "";
}
