// GET /api/exames — listar agendamentos
// POST /api/exames — criar novo agendamento
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";

export const Route = createFileRoute("/api/exames/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAuth(request);

          const url = new URL(request.url);
          const statusFilter = url.searchParams.get("status");

          const where = statusFilter ? { status: statusFilter } : {};

          const exames = await prisma.exame.findMany({
            where,
            orderBy: { data_agendada: "asc" },
            include: {
              colaborador: {
                select: { id: true, nome: true, empresa: true, cpf: true },
              },
            },
          });

          return Response.json({ ok: true, data: exames });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames] GET:", err);
          return Response.json(
            { ok: false, error: "Erro ao buscar exames" },
            { status: 500 },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const body = await request.json();

          if (!body.colaborador_id || !body.data_agendada) {
            return Response.json(
              { ok: false, error: "colaborador_id e data_agendada são obrigatórios" },
              { status: 400 },
            );
          }

          const exame = await prisma.exame.create({
            data: {
              colaborador_id: body.colaborador_id,
              tipo: body.tipo ?? "periodico",
              data_agendada: new Date(body.data_agendada),
              data_1_etapa: body.data_1_etapa ? new Date(body.data_1_etapa) : null,
              data_2_etapa: body.data_2_etapa ? new Date(body.data_2_etapa) : null,
              status: "agendado",
              clinica: body.clinica ?? null,
              created_by: user.sub,
            },
            include: {
              colaborador: {
                select: { id: true, nome: true, empresa: true },
              },
            },
          });

          return Response.json({ ok: true, data: exame }, { status: 201 });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames] POST:", err);
          return Response.json(
            { ok: false, error: "Erro ao criar exame" },
            { status: 500 },
          );
        }
      },
    },
  },
});
