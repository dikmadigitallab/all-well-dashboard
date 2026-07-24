// GET/PUT /api/exames/$id — buscar e atualizar exame
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";

export const Route = createFileRoute("/api/exames/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireAuth(request);
          const exame = await prisma.exame.findUnique({
            where: { id: params.id },
            include: { colaborador: { select: { id: true, nome: true, empresa: true } } },
          });
          if (!exame) {
            return Response.json({ ok: false, error: "Exame não encontrado" }, { status: 404 });
          }
          return Response.json({ ok: true, data: exame });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames] GET /:id:", err);
          return Response.json({ ok: false, error: "Erro ao buscar exame" }, { status: 500 });
        }
      },

      PUT: async ({ request, params }) => {
        try {
          await requireAuth(request);
          const body = await request.json();

          const updateData: Record<string, unknown> = {};

          if (body.status !== undefined) updateData.status = body.status;
          if (body.data_1_etapa !== undefined) updateData.data_1_etapa = body.data_1_etapa ? new Date(body.data_1_etapa) : null;
          if (body.data_2_etapa !== undefined) updateData.data_2_etapa = body.data_2_etapa ? new Date(body.data_2_etapa) : null;
          if (body.data_realizado !== undefined) updateData.data_realizado = body.data_realizado ? new Date(body.data_realizado) : null;
          if (body.justificativa_falta !== undefined) updateData.justificativa_falta = body.justificativa_falta;
          if (body.etapa_faltou !== undefined) updateData.etapa_faltou = body.etapa_faltou;
          if (body.clinica !== undefined) updateData.clinica = body.clinica;
          if (body.motivo_pendencia !== undefined) updateData.motivo_pendencia = body.motivo_pendencia;
          if (body.justificativa !== undefined) updateData.justificativa = body.justificativa;
          if (body.arquivo_url !== undefined) updateData.arquivo_url = body.arquivo_url;

          const updated = await prisma.exame.update({
            where: { id: params.id },
            data: updateData,
            include: {
              colaborador: { select: { id: true, nome: true, empresa: true } },
            },
          });

          return Response.json({ ok: true, data: updated });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames] PUT /:id:", err);
          return Response.json({ ok: false, error: "Erro ao atualizar exame" }, { status: 500 });
        }
      },
    },
  },
});