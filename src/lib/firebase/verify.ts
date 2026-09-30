import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { FIREBASE_PROJECT_ID } from "@/lib/firebase/config";

/**
 * Firebase ID tokens are RS256 JWTs signed by Google. We verify them against
 * Google's published JWK set — this gives real cryptographic verification
 * without needing a service-account private key on the server.
 */
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type VerifiedUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
  provider: string;
};

type FirebaseClaims = JWTPayload & {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  user_id?: string;
  firebase?: { sign_in_provider?: string };
};

export async function verifyIdToken(token: string): Promise<VerifiedUser> {
  if (!token || token.split(".").length !== 3) {
    throw new Error("Malformed ID token.");
  }

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  });

  const claims = payload as FirebaseClaims;
  const uid = claims.sub ?? claims.user_id;
  if (!uid) throw new Error("ID token is missing a subject.");

  return {
    uid,
    email: claims.email ?? null,
    emailVerified: Boolean(claims.email_verified),
    name: claims.name ?? null,
    picture: claims.picture ?? null,
    provider: claims.firebase?.sign_in_provider ?? "password",
  };
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

export async function requireUser(request: Request) {
  const token = bearerToken(request);
  if (!token) throw new Error("Missing bearer token.");
  return verifyIdToken(token);
}
