"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SessionUser = {
  uid: string;
  email: string;
  name: string;
  workspaceId: number;
  workspaceName: string;
  role: string;
  provider: string;
};

type AuthValue = {
  user: SessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    displayName: string;
    workspaceName: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    data?: SessionUser;
  };
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload.data ?? null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { data?: SessionUser | null };
        return payload.data ?? null;
      })
      .then((session) => {
        if (active) setUser(session);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await postJson("/api/auth/login", { email, password });
    setUser(session);
  }, []);

  const signUp = useCallback(
    async (input: {
      email: string;
      password: string;
      displayName: string;
      workspaceName: string;
    }) => {
      const session = await postJson("/api/auth/signup", input);
      setUser(session);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
