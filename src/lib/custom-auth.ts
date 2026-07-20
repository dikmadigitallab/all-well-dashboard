// Autenticação 100% custom — sem Supabase Auth
<<<<<<< HEAD
// CLIENTE: chama /api/login, guarda token no localStorage
=======
// Servidor: valida credenciais, gera/verifica JWT
// Cliente: guarda token no localStorage

import { SignJWT, jwtVerify } from "jose";
import { createServerFn } from "@tanstack/react-start";

// --- Config ---
function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_JWT_SECRET || "fallback-dev-secret"
  );
}
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

<<<<<<< HEAD
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
=======
// --- Server: Login ---
export const login = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { username, password } = data;

    const validUser = process.env.AUTH_USERNAME;
    const validPass = process.env.AUTH_PASSWORD;

    if (username !== validUser || password !== validPass) {
      return { ok: false as const, error: "Usuário ou senha inválidos" };
    }

    const user: AuthUser = {
      id: "user-001",
      username: process.env.AUTH_USERNAME || "maria_eduarda",
      fullName: process.env.AUTH_USER_FULL_NAME || "Maria Eduarda",
      role: process.env.AUTH_USER_ROLE || "admin",
    };

    const token = await new SignJWT({ sub: user.id, ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(getSecret());

    return { ok: true as const, token, user };
  });

// --- Server: Verificar token ---
export const verifyToken = createServerFn({ method: "GET" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { payload } = await jwtVerify(data.token, getSecret(), {
        algorithms: ["HS256"],
      });
      return {
        ok: true as const,
        user: {
          id: payload.sub as string,
          username: payload.username as string,
          fullName: payload.fullName as string,
          role: payload.role as string,
        } as AuthUser,
      };
    } catch {
      return { ok: false as const, error: "Token inválido ou expirado" };
    }
  });

// --- Client helpers ---
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
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
<<<<<<< HEAD
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.username || !parsed.role) return null;
    return parsed as AuthUser;
=======
    return raw ? JSON.parse(raw) : null;
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
  } catch {
    return null;
  }
}
