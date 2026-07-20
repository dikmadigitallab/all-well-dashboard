import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/custom-auth";
import { login as loginFn, storeToken, clearToken, getStoredToken, getStoredUser } from "@/lib/custom-auth";

export type AppRole = "admin" | "gestor";

interface AuthState {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera sessão do localStorage
    const savedUser = getStoredUser();
    const savedToken = getStoredToken();
    if (savedUser && savedToken) {
      setUser(savedUser);
      setRole((savedUser.role as AppRole) ?? "gestor");
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
<<<<<<< HEAD
    const result = await loginFn(username, password);
=======
    const result = await loginFn({ username, password });
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
    if (!result.ok) {
      return { error: result.error };
    }
    storeToken(result.token, result.user);
    setUser(result.user);
    setRole((result.user.role as AppRole) ?? "gestor");
    return { error: null };
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        role,
        loading,
        isAdmin: role === "admin",
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
