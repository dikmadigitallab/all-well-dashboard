// GET/POST /api/exames/historico — listar e registrar histórico de eventos
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";

export const Route = createFileRoute("/api/exames/historico")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAuth(request);
          const url = new URL(request.url);
          const colaboradorId = url.searchParams.get("colaborador_id");

          const where: Record<string, unknown> = {};
          if (colaboradorId) where.colaborador_id = colaboradorId;

          const historico = await prisma.exameHistorico.findMany({
            where,
            orderBy: { created_at: "desc" },
            take: 200,
            include: {
              exame: {
                select: { id: true, tipo: true, status: true, data_agendada: true },
              },
            },
          });

          return Response.json({ ok: true, data: historico });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames/historico] GET:", err);
          return Response.json({ ok: false, error: "Erro ao buscar histórico" }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          await requireAuth(request);
          const body = await request.json();

          if (!body.colaborador_id || !body.evento || !body.descricao) {
            return Response.json(
              { ok: false, error: "colaborador_id, evento e descricao são obrigatórios" },
              { status: 400 },
            );
          }

          const registro = await prisma.exameHistorico.create({
            data: {
              colaborador_id: body.colaborador_id,
              exame_id: body.exame_id || null,
              evento: body.evento,
              descricao: body.descricao,
              detalhes: body.detalhes || undefined,
            },
          });

          return Response.json({ ok: true, data: registro }, { status: 201 });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames/historico] POST:", err);
          return Response.json({ ok: false, error: "Erro ao registrar histórico" }, { status: 500 });
        }
      },
    },
  },
});