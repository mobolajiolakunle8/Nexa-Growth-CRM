import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/auth/secret";

export const SESSION_COOKIE = "nxg_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  uid: string;
  email: string;
  name: string;
  workspaceId: number;
  workspaceName: string;
  role: string;
  provider: string;
};

export async function signSession(user: SessionUser) {
  const { key } = await getAuthSecret();
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key);
}

export async function readSessionToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { key } = await getAuthSecret();
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const workspaceId = Number(payload.workspaceId);
    if (!payload.uid || !Number.isFinite(workspaceId)) return null;
    return {
      uid: String(payload.uid),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      workspaceId,
      workspaceName: String(payload.workspaceName ?? "Workspace"),
      role: String(payload.role ?? "owner"),
      provider: String(payload.provider ?? "local"),
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export async function readRequestSession(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const token = match
    ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1))
    : "";
  return readSessionToken(token);
}

export async function readPageSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

function cookieAttributes(maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function applySession(response: Response, token: string) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; ${cookieAttributes(MAX_AGE_SECONDS)}`,
  );
  return response;
}

export function clearSession(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; ${cookieAttributes(0)}`,
  );
  return response;
}
