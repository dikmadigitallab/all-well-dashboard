// GET /api/emails-contato — listar emails salvos
// POST /api/emails-contato — adicionar novo email
import { createFileRoute } from "@tanstack/react-router";
import { getPrisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";

export const Route = createFileRoute("/api/emails-contato")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const prisma = getPrisma();

          // Debug: verificar models disponíveis
          const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(prisma));
          const modelKeys = keys.filter(
            (k) => k !== "constructor" && !k.startsWith("_") && k !== "then",
          );
          console.log("[api/emails-contato] models:", modelKeys);
          console.log(
            "[api/emails-contato] emailContato?",
            "emailContato" in prisma,
            typeof prisma.emailContato,
          );

          const emails = await prisma.emailContato.findMany({
            where: { created_by: user.sub },
            orderBy: { created_at: "desc" },
            select: {
              id: true,
              email: true,
              nome: true,
              created_at: true,
            },
          });

          return Response.json({ ok: true, data: emails });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/emails-contato] GET:", err);
          return Response.json(
            { ok: false, error: "Erro ao buscar emails" },
            { status: 500 },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const prisma = getPrisma();
          const body = await request.json();

          if (!body.email) {
            return Response.json(
              { ok: false, error: "email é obrigatório" },
              { status: 400 },
            );
          }

          const emailLimpo = body.email.toLowerCase().trim();

          // Verifica se já existe para este usuário
          const existente = await prisma.emailContato.findFirst({
            where: { email: emailLimpo, created_by: user.sub },
          });

          if (existente) {
            return Response.json({ ok: true, data: existente });
          }

          const contato = await prisma.emailContato.create({
            data: {
              email: emailLimpo,
              nome: body.nome ?? null,
              created_by: user.sub,
            },
          });

          return Response.json({ ok: true, data: contato }, { status: 201 });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/emails-contato] POST:", err);
          return Response.json(
            { ok: false, error: "Erro ao salvar email" },
            { status: 500 },
          );
        }
      },
    },
  },
});
