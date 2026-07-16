// Autenticação 100% custom — sem Supabase Auth
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

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

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
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
