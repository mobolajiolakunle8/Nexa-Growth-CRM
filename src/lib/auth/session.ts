import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { firebaseConfig } from "@/lib/firebase/config";

export const SESSION_COOKIE = "nxg_session";

export type SessionUser = {
  uid: string;
  email: string;
  name: string;
  workspaceId: number;
  workspaceName: string;
  role: string;
  provider: string;
};

function secret() {
  const raw =
    process.env.AUTH_SECRET ||
    `${firebaseConfig.apiKey}:nexagrowth-workspace-session`;
  return new TextEncoder().encode(raw);
}

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function readSessionToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const workspaceId = Number(payload.workspaceId);
    if (!payload.uid || !Number.isFinite(workspaceId)) return null;
    return {
      uid: String(payload.uid),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      workspaceId,
      workspaceName: String(payload.workspaceName ?? "Workspace"),
      role: String(payload.role ?? "owner"),
      provider: String(payload.provider ?? "workspace"),
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function readRequestSession(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : "";
  return readSessionToken(token);
}

export async function readPageSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function applySession(response: Response, token: string) {
  const options = sessionCookieOptions();
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly; SameSite=Lax${
      options.secure ? "; Secure" : ""
    }`,
  );
  return response;
}

export function clearSession(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  );
  return response;
}
