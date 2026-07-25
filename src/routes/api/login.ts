// POST /api/login — autenticação contra banco de dados
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { verifyPassword, createToken } from "@/lib/auth.server";

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

          // Busca usuário no banco
          const user = await prisma.user.findUnique({
            where: { username },
          });

          if (!user || !user.ativo) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          // Verifica senha
          const valid = await verifyPassword(password, user.password_hash);
          if (!valid) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          // Gera token JWT
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
          return Response.json({ ok: false, error: "Erro interno do servidor" }, { status: 500 });
        }
      },
    },
  },
});
