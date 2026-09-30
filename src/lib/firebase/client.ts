"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import { firebaseConfig } from "@/lib/firebase/config";

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    void setPersistence(authInstance, browserLocalPersistence).catch(() => {
      /* persistence is best-effort in restricted browsers */
    });
  }
  return authInstance;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Analytics is optional: it only loads in a browser that supports it and when a
 * measurementId is configured. Failures never block authentication.
 */
export async function initFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) return null;
    return getAnalytics(getFirebaseApp());
  } catch {
    return null;
  }
}

export function friendlyAuthError(code: string | undefined, fallback: string) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact your workspace admin.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with this email. Try logging in.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before finishing.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google popup. Allow popups and retry.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network problem reaching Firebase. Check your connection.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in the Firebase console yet.";
    case "auth/unauthorized-domain":
      return "This domain is not authorised in Firebase Auth settings.";
    default:
      return fallback;
  }
}
