// Autenticação 100% custom — sem Supabase Auth
// CLIENTE: chama /api/login, guarda token no localStorage

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

// --- Login via API ---
export async function login(
  username: string,
  password: string
): Promise<{ ok: true; token: string; user: AuthUser } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const json = await res.json();
        msg = json.error || msg;
      } catch {
        msg = (await res.text()) || msg;
      }
      return { ok: false, error: msg };
    }

    const data = await res.json();
    return { ok: true, token: data.token, user: data.user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro de conexão";
    return { ok: false, error: msg };
  }
}

// --- Token helpers ---
const TOKEN_KEY = "custom_auth_token";
const USER_KEY = "custom_auth_user";

export function storeToken(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.username || !parsed.role) return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
}
