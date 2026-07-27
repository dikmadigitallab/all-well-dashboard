// POST /api/login — autenticação via Postgres (client fresco por request p/ evitar conexões mortas do pooler)
import { createFileRoute } from "@tanstack/react-router";
import { Client } from "pg";
import { verifyPassword, createToken } from "@/lib/auth.server";

async function queryUser(username: string) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL não configurado");

  const ssl =
    process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false };

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new Client({
      connectionString,
      ssl,
      connectionTimeoutMillis: 10000,
      statement_timeout: 10000,
      query_timeout: 10000,
      keepAlive: true,
    });
    try {
      await client.connect();
      const { rows } = await client.query(
        `SELECT id, username, password_hash, full_name, role, ativo
         FROM users WHERE username = $1 LIMIT 1`,
        [username],
      );
      return rows[0];
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Erros típicos de pooler morto → tentar novamente
      if (!/terminated|ECONNRESET|ETIMEDOUT|socket|EPIPE/i.test(msg) || attempt === 3) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 150 * attempt));
    } finally {
      client.end().catch(() => {});
    }
  }
  throw lastErr;
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

          const user = await queryUser(String(username));

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
