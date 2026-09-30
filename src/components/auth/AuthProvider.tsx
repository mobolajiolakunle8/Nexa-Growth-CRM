"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  getFirebaseAuth,
  googleProvider,
  initFirebaseAnalytics,
} from "@/lib/firebase/client";

export type Profile = {
  id: number;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  provider: string;
  role: string;
  company: string | null;
  phone: string | null;
  plan: string;
  emailVerified: boolean;
};

type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
  company?: string;
  phone?: string;
  plan?: string;
};

type AuthValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingMeta = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    void initFirebaseAnalytics();
  }, []);

  const syncProfile = useCallback(async (current: User) => {
    try {
      const token = await current.getIdToken();
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingMeta.current ?? {}),
      });
      pendingMeta.current = null;
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: Profile };
      if (payload.data) setProfile(payload.data);
    } catch {
      /* the workspace still works if the profile sync is unavailable */
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setUser(current);
      if (current) {
        await syncProfile(current);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [syncProfile]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onIdTokenChanged(auth, (current) => {
      setUser((prev) => (prev?.uid === current?.uid ? prev : current));
    });
  }, []);

  const getToken = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return null;
    return current.getIdToken();
  }, []);

  const authedFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token = await getToken();
      const headers = new Headers(init.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(input, { ...init, headers });
    },
    [getToken],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const auth = getFirebaseAuth();
    pendingMeta.current = {
      displayName: input.displayName ?? "",
      company: input.company ?? "",
      phone: input.phone ?? "",
      plan: input.plan ?? "professional",
    };
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password,
    );
    if (input.displayName?.trim()) {
      await updateProfile(credential.user, {
        displayName: input.displayName.trim(),
      });
      await credential.user.reload();
    }
    await syncProfile(getFirebaseAuth().currentUser ?? credential.user);
  }, [syncProfile]);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(getFirebaseAuth());
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (current) await syncProfile(current);
  }, [syncProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      getToken,
      authedFetch,
      refreshProfile,
    }),
    [
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      getToken,
      authedFetch,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
