// GET /api/colaboradores — listar
// POST /api/colaboradores — criar (single ou batch)
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";

function parseDate(v: unknown): Date | null {
  if (!v || v === "") return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const Route = createFileRoute("/api/colaboradores")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const colaboradores = await prisma.colaborador.findMany({
            orderBy: { nome: "asc" },
            take: 5000,
          });
          return Response.json({ ok: true, data: colaboradores });
        } catch (err) {
          console.error("[api/colaboradores] GET:", err);
          return Response.json(
            { ok: false, error: "Erro ao buscar colaboradores" },
            { status: 500 }
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          const data = (item: Record<string, unknown>) => ({
            nome: item.nome as string,
            empresa: (item.empresa as string) ?? null,
            area: (item.area as string) ?? null,
            setor: (item.setor as string) ?? null,
            funcao: (item.funcao as string) ?? null,
            matricula_sap: (item.matricula_sap as string) ?? null,
            cpf: (item.cpf as string) ?? null,
            rg: (item.rg as string) ?? null,
            pis: (item.pis as string) ?? null,
            nascimento: parseDate(item.nascimento),
            escala_turno: (item.escala_turno as string) ?? null,
            ghe: (item.ghe as string) ?? null,
            periodicidade_meses: (item.periodicidade_meses as number) ?? 12,
            unidade: (item.unidade as string) ?? null,
            ultimo_exame: parseDate(item.ultimo_exame),
            proximo_exame: parseDate(item.proximo_exame),
            status: (item.status as string) ?? "sem_exame",
            observacoes: (item.observacoes as string) ?? null,
            ativo: item.ativo !== undefined ? (item.ativo as boolean) : true,
            created_by: (item.created_by as string) ?? null,
          });

          // Batch insert
          if (Array.isArray(body)) {
            const created = await prisma.$transaction(
              body.map((item) => prisma.colaborador.create({ data: data(item) }))
            );
            return Response.json({ ok: true, data: created }, { status: 201 });
          }

          // Single insert
          const created = await prisma.colaborador.create({ data: data(body) });
          return Response.json({ ok: true, data: created }, { status: 201 });
        } catch (err) {
          console.error("[api/colaboradores] POST:", err);
          return Response.json(
            { ok: false, error: "Erro ao criar colaborador" },
            { status: 500 }
          );
        }
      },
    },
  },
});
