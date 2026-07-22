import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BCRYPT_ROUNDS = 10;

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("AUTH_JWT_SECRET não definido");
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------
export interface JwtPayload {
  sub: string;
  username: string;
  fullName: string;
  role: string;
}

export async function createToken(user: {
  id: string;
  username: string;
  fullName: string | null;
  role: string;
}): Promise<string> {
  return new SignJWT({
    sub: user.id,
    username: user.username,
    fullName: user.fullName ?? "",
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  return {
    sub: payload.sub as string,
    username: payload.username as string,
    fullName: payload.fullName as string,
    role: payload.role as string,
  };
}

// ---------------------------------------------------------------------------
// Middleware para rotas de API
// ---------------------------------------------------------------------------
/**
 * Extrai o token Bearer do header Authorization e retorna o payload decodificado.
 * Lança Response com status 401 se ausente ou inválido.
 */
export async function requireAuth(request: Request): Promise<JwtPayload> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    throw new Response(JSON.stringify({ ok: false, error: "Token não fornecido" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ ok: false, error: "Formato inválido. Use Bearer token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new Response(JSON.stringify({ ok: false, error: "Token vazio" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return await verifyToken(token);
  } catch {
    throw new Response(JSON.stringify({ ok: false, error: "Token inválido ou expirado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Middleware que exige role específica (ex.: "admin").
 */
export async function requireRole(request: Request, role: string): Promise<JwtPayload> {
  const payload = await requireAuth(request);
  if (payload.role !== role) {
    throw new Response(
      JSON.stringify({
        ok: false,
        error: `Acesso negado. Role "${role}" necessária.`,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }
  return payload;
}
