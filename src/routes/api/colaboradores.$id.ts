// GET /api/colaboradores/$id — buscar um
// PUT /api/colaboradores/$id — atualizar
// DELETE /api/colaboradores/$id — excluir
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";

function parseDate(v: unknown): Date | null {
  if (!v || v === "") return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const Route = createFileRoute("/api/colaboradores/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const colaborador = await prisma.colaborador.findUnique({
            where: { id: params.id },
            include: { exames: { orderBy: { created_at: "desc" } } },
          });
          if (!colaborador) {
            return Response.json(
              { ok: false, error: "Colaborador não encontrado" },
              { status: 404 }
            );
          }
          return Response.json({ ok: true, data: colaborador });
        } catch (err) {
          console.error("[api/colaboradores] GET /:id:", err);
          return Response.json(
            { ok: false, error: "Erro ao buscar colaborador" },
            { status: 500 }
          );
        }
      },
      PUT: async ({ params, request }) => {
        try {
          const body = await request.json();
          const updated = await prisma.colaborador.update({
            where: { id: params.id },
            data: {
              nome: body.nome,
              empresa: body.empresa ?? null,
              area: body.area ?? null,
              setor: body.setor ?? null,
              funcao: body.funcao ?? null,
              matricula_sap: body.matricula_sap ?? null,
              cpf: body.cpf ?? null,
              rg: body.rg ?? null,
              pis: body.pis ?? null,
              nascimento: parseDate(body.nascimento),
              escala_turno: body.escala_turno ?? null,
              ghe: body.ghe ?? null,
              periodicidade_meses: body.periodicidade_meses ?? 12,
              unidade: body.unidade ?? null,
              ultimo_exame: parseDate(body.ultimo_exame),
              proximo_exame: parseDate(body.proximo_exame),
              status: body.status ?? "sem_exame",
              observacoes: body.observacoes ?? null,
              ativo: body.ativo ?? true,
            },
          });
          return Response.json({ ok: true, data: updated });
        } catch (err) {
          console.error("[api/colaboradores] PUT /:id:", err);
          return Response.json(
            { ok: false, error: "Erro ao atualizar colaborador" },
            { status: 500 }
          );
        }
      },
      DELETE: async ({ params }) => {
        try {
          await prisma.colaborador.delete({
            where: { id: params.id },
          });
          return Response.json({ ok: true });
        } catch (err) {
          console.error("[api/colaboradores] DELETE /:id:", err);
          return Response.json(
            { ok: false, error: "Erro ao excluir colaborador" },
            { status: 500 }
          );
        }
      },
    },
  },
});
