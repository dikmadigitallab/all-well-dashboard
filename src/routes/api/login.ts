// POST /api/login — autenticação via Prisma (usa o pool compartilhado, sem criar conexões avulsas)
import { createFileRoute } from "@tanstack/react-router";
import { verifyPassword, createToken } from "@/lib/auth.server";
import { prisma } from "@/lib/prisma.server";

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

          const user = await prisma.user.findUnique({
            where: { username: String(username) },
            select: { id: true, username: true, password_hash: true, full_name: true, role: true, ativo: true },
          });

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
