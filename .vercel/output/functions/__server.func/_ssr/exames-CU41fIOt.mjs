import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exames-CU41fIOt.js
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createSupabaseClient() {
	const SUPABASE_URL = "https://gsxznhzbvcmkytfhkvug.supabase.co";
	const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JSwy9Cnd0FMIt-j9TJCi5Q_DPfkgEYF";
	return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
		auth: {
			storage: typeof window !== "undefined" ? localStorage : void 0,
			persistSession: true,
			autoRefreshToken: true
		}
	});
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
var TIPO_LABEL = {
	admissional: "Admissional",
	periodico: "Periódico",
	demissional: "Demissional",
	retorno_ao_trabalho: "Retorno ao trabalho",
	mudanca_riscos: "Mudança de riscos",
	complementar: "Complementar"
};
var STATUS_EXAME_LABEL = {
	agendado: "Agendado",
	compareceu: "Compareceu",
	faltou: "Faltou",
	pendente: "Pendente",
	cancelado: "Cancelado",
	realizado: "Realizado"
};
var STATUS_EXAME_CLASSES = {
	agendado: "bg-primary/15 text-primary border-primary/30",
	compareceu: "bg-status-ok/20 text-status-ok-foreground border-status-ok/40",
	realizado: "bg-status-ok/20 text-status-ok-foreground border-status-ok/40",
	faltou: "bg-status-danger/20 text-status-danger border-status-danger/40",
	pendente: "bg-status-warn/25 text-status-warn-foreground border-status-warn/50",
	cancelado: "bg-status-neutral/40 text-status-neutral-foreground border-status-neutral/60"
};
var MOTIVO_LABEL = {
	agendamento: "Agendamento",
	falta_colaborador: "Falta do colaborador",
	documentacao: "Documentação",
	afastamento: "Afastamento",
	recusa: "Recusa",
	outro: "Outro"
};
var MOTIVO_COLORS = {
	agendamento: "#0ea5e9",
	falta_colaborador: "#ef4444",
	documentacao: "#f59e0b",
	afastamento: "#8b5cf6",
	recusa: "#ec4899",
	outro: "#64748b"
};
//#endregion
export { TIPO_LABEL as a, STATUS_EXAME_LABEL as i, MOTIVO_LABEL as n, supabase as o, STATUS_EXAME_CLASSES as r, MOTIVO_COLORS as t };
