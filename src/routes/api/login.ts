// POST /api/login — autenticação contra banco de dados (pg direto, sem Prisma WASM)
import { createFileRoute } from "@tanstack/react-router";
import { Pool } from "pg";
import { verifyPassword, createToken } from "@/lib/auth.server";

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : { rejectUnauthorized: process.env.NODE_ENV === "production" },
    });
  }
  return _pool;
}

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { username, password } = body || {};

          if (!username || !password) {
            return Response.json(
              { ok: false, error: "username e password obrigatórios" },
              { status: 400 },
            );
          }

          const { rows } = await getPool().query(
            `SELECT id, username, password_hash, full_name, role, ativo
             FROM users WHERE username = $1 LIMIT 1`,
            [username],
          );
          const user = rows[0];

          if (!user || !user.ativo) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          const valid = await verifyPassword(password, user.password_hash);
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
