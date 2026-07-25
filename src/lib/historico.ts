import { authFetch } from "./custom-auth";

interface RegistroHistoricoParams {
  colaboradorId: string;
  exameId?: string;
  evento: string;
  descricao: string;
  detalhes?: Record<string, unknown>;
}

export async function registrarHistorico(params: RegistroHistoricoParams) {
  try {
    const res = await authFetch("/api/exames/historico", {
      method: "POST",
      body: JSON.stringify({
        colaborador_id: params.colaboradorId,
        exame_id: params.exameId,
        evento: params.evento,
        descricao: params.descricao,
        detalhes: params.detalhes,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("[historico] erro ao registrar:", err.error);
    }
  } catch (err) {
    console.error("[historico] erro ao registrar:", err);
  }
}