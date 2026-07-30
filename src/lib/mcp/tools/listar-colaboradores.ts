import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, notAuthenticated, errorResult, jsonResult } from "../supabase";

export default defineTool({
  name: "listar_colaboradores",
  title: "Listar colaboradores",
  description:
    "Lista colaboradores e a situação do ASO de cada um, com filtros por nome, empresa, unidade e status (em_dia, a_vencer, vencido, sem_registro).",
  inputSchema: {
    busca: z.string().trim().min(1).optional().describe("Trecho do nome do colaborador."),
    empresa: z.string().trim().min(1).optional().describe("Filtra pela empresa."),
    unidade: z.string().trim().min(1).optional().describe("Filtra pela unidade."),
    status: z
      .enum(["em_dia", "a_vencer", "vencido", "sem_registro"])
      .optional()
      .describe("Situação do ASO."),
    limite: z.number().int().min(1).max(100).default(25).describe("Máximo de registros."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ busca, empresa, unidade, status, limite }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();

    let query = supabaseForUser(ctx)
      .from("colaboradores")
      .select(
        "id, nome, empresa, unidade, setor, funcao, status, ultimo_exame, proximo_exame, dias_para_vencer, ativo",
      )
      .eq("ativo", true)
      .order("dias_para_vencer", { ascending: true, nullsFirst: false })
      .limit(limite ?? 25);

    if (busca) query = query.ilike("nome", `%${busca}%`);
    if (empresa) query = query.ilike("empresa", `%${empresa}%`);
    if (unidade) query = query.ilike("unidade", `%${unidade}%`);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult({ total: data?.length ?? 0, colaboradores: data ?? [] });
  },
});
