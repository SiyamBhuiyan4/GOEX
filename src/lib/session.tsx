import { Component, createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const KEY = "mr.session";

type Me = NonNullable<typeof api.auth.me._returnType>;

type Session = {
  token: string;
  /** undefined while loading, null when signed out. */
  me: Me | null | undefined;
  signIn: (token: string, expiresAt: number) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Session | null>(null);

function readStored(): string {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return "";
    const { token, expiresAt } = JSON.parse(raw) as { token: string; expiresAt: number };
    return expiresAt > Date.now() ? token : "";
  } catch {
    return "";
  }
}

/*
  Last-resort catch for the whole app. Only a broken stored session (bad token)
  signs the user out; any other error shows a reload screen instead, so one
  failing page can never log anyone out.
*/
class SessionErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; signedOut: boolean }> {
  state = { hasError: false, signedOut: false };
  static getDerivedStateFromError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const badSession = /token|session|ArgumentValidationError/i.test(msg) && /auth:me|auth\.me/i.test(msg);
    if (badSession) {
      try {
        localStorage.removeItem(KEY);
      } catch {}
    }
    return { hasError: true, signedOut: badSession };
  }
  render() {
    if (this.state.hasError && this.state.signedOut) {
      return (
        <Ctx.Provider value={{ token: "", me: null, signIn: () => {}, signOut: async () => {} }}>
          {this.props.children}
        </Ctx.Provider>
      );
    }
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", fontFamily: "inherit" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>Something went wrong.</p>
            <p style={{ opacity: 0.7, marginTop: 6 }}>You are still signed in.</p>
            <button
              onClick={() => location.reload()}
              style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, background: "#6b21a8", color: "#fff", fontWeight: 600, cursor: "pointer" }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function InnerSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(readStored);
  const me = useQuery(api.auth.me, token ? { token } : "skip");
  const logout = useMutation(api.auth.logout);

  // The server says the session is gone (expired, revoked, suspended) — drop it.
  useEffect(() => {
    if (token && me === null) {
      localStorage.removeItem(KEY);
      setToken("");
    }
  }, [token, me]);

  const signIn = useCallback((t: string, expiresAt: number) => {
    localStorage.setItem(KEY, JSON.stringify({ token: t, expiresAt }));
    setToken(t);
  }, []);

  const signOut = useCallback(async () => {
    const t = token;
    localStorage.removeItem(KEY);
    setToken("");
    if (t) await logout({ token: t }).catch(() => {});
  }, [token, logout]);

  return (
    <Ctx.Provider value={{ token, me: token ? me : null, signIn, signOut }}>{children}</Ctx.Provider>
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionErrorBoundary>
      <InnerSessionProvider>{children}</InnerSessionProvider>
    </SessionErrorBoundary>
  );
}

export function useSession() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession outside SessionProvider");
  return s;
}

/** For pages behind sign-in: the token and the user, both guaranteed. */
export function useAuthed() {
  const { token, me } = useSession();
  if (!me) throw new Error("useAuthed on a signed-out page");
  return { token, me };
}
