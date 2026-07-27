// POST /api/login — autenticação direta no Postgres para evitar dependência do Prisma no runtime
import { createFileRoute } from "@tanstack/react-router";
import { verifyPassword, createToken } from "@/lib/auth.server";
import { Client } from "pg";

type LoginUserRow = {
  id: string;
  username: string;
  password_hash: string;
  full_name: string | null;
  role: string;
  ativo: boolean;
};

function getDatabaseConnectionString(): string {
  const rawUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!rawUrl) throw new Error("DATABASE_URL ou SUPABASE_DB_URL não definido");

  const poolPort = process.env.DATABASE_POOL_PORT;
  if (!poolPort) return rawUrl;

  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes("pooler")) {
      url.port = poolPort;
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function shouldRetryConnection(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("terminated") ||
    message.includes("econnreset") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
}

async function findUserByUsername(username: string): Promise<LoginUserRow | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const client = new Client({
      connectionString: getDatabaseConnectionString(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10_000,
      query_timeout: 10_000,
      keepAlive: true,
    });

    try {
      await client.connect();
      const result = await client.query<LoginUserRow>(
        `select id, username, password_hash, full_name, role::text as role, ativo
         from public.users
         where username = $1
         limit 1`,
        [username],
      );
      return result.rows[0] ?? null;
    } catch (error) {
      lastError = error;
      if (attempt === 3 || !shouldRetryConnection(error)) throw error;
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  throw lastError;
}

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const { username, password } = body || {};

          if (!username || !password) {
            return Response.json(
              { ok: false, error: "username e password obrigatórios" },
              { status: 400 },
            );
          }

          const user = await findUserByUsername(String(username));

          if (!user || !user.ativo) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          const valid = await verifyPassword(String(password), user.password_hash);
          if (!valid) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          const token = await createToken({
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
          });

          return Response.json({
            ok: true,
            token,
            user: {
              id: user.id,
              username: user.username,
              fullName: user.full_name,
              role: user.role,
            },
          });
        } catch (err) {
          console.error("[login]", err);
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { ok: false, error: `Erro interno: ${msg}` },
            { status: 500 },
          );
        }
      },
    },
  },
});
