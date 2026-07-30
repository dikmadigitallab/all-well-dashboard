import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, notAuthenticated, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "resumo_asos",
  title: "Resumo de ASOs",
  description:
    "Retorna os indicadores de ASOs: total de colaboradores ativos e quantidade em dia, a vencer, vencidos e sem registro.",
  inputSchema: {
    empresa: z.string().trim().min(1).optional().describe("Restringe o resumo a uma empresa."),
    unidade: z.string().trim().min(1).optional().describe("Restringe o resumo a uma unidade."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ empresa, unidade }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();

    let query = supabaseForUser(ctx)
      .from("colaboradores")
      .select("status")
      .eq("ativo", true)
      .limit(5000);

    if (empresa) query = query.ilike("empresa", `%${empresa}%`);
    if (unidade) query = query.ilike("unidade", `%${unidade}%`);

    const { data, error } = await query;
    if (error) return errorResult(error.message);

    const resumo = { em_dia: 0, a_vencer: 0, vencido: 0, sem_registro: 0 } as Record<string, number>;
    for (const row of data ?? []) {
      const key = (row as { status: string }).status;
      resumo[key] = (resumo[key] ?? 0) + 1;
    }

    return jsonResult({ total: data?.length ?? 0, por_status: resumo });
  },
});
