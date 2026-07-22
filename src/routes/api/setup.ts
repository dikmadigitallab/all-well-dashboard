// POST /api/setup — cria primeiro usuário admin (apenas se não houver nenhum)
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { hashPassword } from "@/lib/auth.server";

export const Route = createFileRoute("/api/setup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Só funciona se não existir nenhum usuário
          const count = await prisma.user.count();
          if (count > 0) {
            return Response.json(
              {
                ok: false,
                error: "Setup já foi realizado. Delete os usuários existentes para refazer.",
              },
              { status: 400 },
            );
          }

          const body = await request.json();
          const username = (body.username as string) || "admin";
          const password = (body.password as string) || "admin123";
          const fullName = (body.fullName as string) || "Administrador";

          if (!username || username.length < 3) {
            return Response.json(
              { ok: false, error: "Username deve ter no mínimo 3 caracteres" },
              { status: 400 },
            );
          }

          if (!password || password.length < 4) {
            return Response.json(
              { ok: false, error: "Senha deve ter no mínimo 4 caracteres" },
              { status: 400 },
            );
          }

          const existing = await prisma.user.findUnique({ where: { username } });
          if (existing) {
            return Response.json(
              { ok: false, error: `Usuário "${username}" já existe` },
              { status: 400 },
            );
          }

          const password_hash = await hashPassword(password);

          const user = await prisma.user.create({
            data: {
              username,
              password_hash,
              full_name: fullName,
              role: "admin",
              ativo: true,
            },
          });

          console.log(`[setup] Admin criado: ${user.username}`);

          return Response.json(
            {
              ok: true,
              message: "Admin criado com sucesso",
              user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
              },
            },
            { status: 201 },
          );
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[setup]", err);
          return Response.json({ ok: false, error: "Erro interno do servidor" }, { status: 500 });
        }
      },
    },
  },
});
