// GET /api/notificacoes — alertas de colaboradores vencendo (60 dias) e vencidos
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";

export const Route = createFileRoute("/api/notificacoes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAuth(request);

          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const daqui60 = new Date(now);
          daqui60.setDate(daqui60.getDate() + 60);

          const colaboradores = await prisma.colaborador.findMany({
            where: {
              proximo_exame: { not: null },
              ativo: true,
            },
            select: {
              id: true,
              nome: true,
              empresa: true,
              proximo_exame: true,
              status: true,
              dias_para_vencer: true,
            },
          });

          const a_vencer: Array<{
            id: string;
            nome: string;
            empresa: string | null;
            proximo_exame: string | null;
            status: string;
            dias_para_vencer: number | null;
          }> = [];

          const vencidos: Array<{
            id: string;
            nome: string;
            empresa: string | null;
            proximo_exame: string | null;
            status: string;
            dias_para_vencer: number | null;
          }> = [];

          for (const c of colaboradores) {
            if (!c.proximo_exame) continue;
            const exame = new Date(c.proximo_exame);
            exame.setHours(0, 0, 0, 0);

            const item = {
              id: c.id,
              nome: c.nome,
              empresa: c.empresa,
              proximo_exame: c.proximo_exame.toISOString(),
              status: c.status,
              dias_para_vencer: c.dias_para_vencer,
            };

            if (exame < now) {
              vencidos.push(item);
            } else if (exame >= now && exame <= daqui60) {
              a_vencer.push(item);
            }
          }

          a_vencer.sort((a, b) => (a.dias_para_vencer ?? 999) - (b.dias_para_vencer ?? 999));
          vencidos.sort((a, b) => {
            if (!a.proximo_exame || !b.proximo_exame) return 0;
            return new Date(a.proximo_exame).getTime() - new Date(b.proximo_exame).getTime();
          });

          return Response.json({
            ok: true,
            data: {
              total: a_vencer.length + vencidos.length,
              a_vencer,
              vencidos,
              totais: {
                a_vencer: a_vencer.length,
                vencidos: vencidos.length,
              },
            },
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/notificacoes] GET:", err);
          return Response.json(
            { ok: false, error: "Erro ao buscar notificações" },
            { status: 500 },
          );
        }
      },
    },
  },
});
