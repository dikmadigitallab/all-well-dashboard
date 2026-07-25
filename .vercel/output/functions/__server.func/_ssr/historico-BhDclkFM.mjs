import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/historico-BhDclkFM.js
async function registrarHistorico(params) {
	try {
		const res = await authFetch("/api/exames/historico", {
			method: "POST",
			body: JSON.stringify({
				colaborador_id: params.colaboradorId,
				exame_id: params.exameId,
				evento: params.evento,
				descricao: params.descricao,
				detalhes: params.detalhes
			})
		});
		if (!res.ok) {
			const err = await res.json();
			console.error("[historico] erro ao registrar:", err.error);
		}
	} catch (err) {
		console.error("[historico] erro ao registrar:", err);
	}
}
//#endregion
export { registrarHistorico as t };
