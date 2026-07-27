import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { a as exportIndicadoresPDF, i as exportExamesXLSX, n as exportColabsXLSX, r as exportExamesPDF, t as exportColabsPDF } from "./reports-BQ4cHgP-.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as FileSpreadsheet, w as FileText, z as ChartColumn } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { t as supabase } from "./client-D3NoJT_3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/relatorios-DXNlfqvA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RelatoriosPage() {
	const [empresa, setEmpresa] = (0, import_react.useState)("__all__");
	const [unidade, setUnidade] = (0, import_react.useState)("__all__");
	const [statusColab, setStatusColab] = (0, import_react.useState)("__all__");
	const [dtIni, setDtIni] = (0, import_react.useState)("");
	const [dtFim, setDtFim] = (0, import_react.useState)("");
	const { data: colabs = [] } = useQuery({
		queryKey: ["rel-colabs"],
		queryFn: async () => {
			const { data, error } = await supabase.from("colaboradores").select("*").order("nome").limit(5e3);
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: exames = [] } = useQuery({
		queryKey: ["rel-exames"],
		queryFn: async () => {
			const { data, error } = await supabase.from("exames").select("*, colaborador:colaboradores!inner(id,nome,empresa,unidade)").order("data_agendada", {
				ascending: false,
				nullsFirst: false
			}).limit(5e3);
			if (error) throw error;
			return data ?? [];
		}
	});
	const empresas = (0, import_react.useMemo)(() => Array.from(new Set(colabs.map((c) => c.empresa).filter(Boolean))).sort(), [colabs]);
	const unidades = (0, import_react.useMemo)(() => Array.from(new Set(colabs.map((c) => c.unidade).filter(Boolean))).sort(), [colabs]);
	const colabsFiltered = (0, import_react.useMemo)(() => colabs.filter((c) => {
		if (empresa !== "__all__" && c.empresa !== empresa) return false;
		if (unidade !== "__all__" && c.unidade !== unidade) return false;
		if (statusColab !== "__all__" && c.status !== statusColab) return false;
		return true;
	}), [
		colabs,
		empresa,
		unidade,
		statusColab
	]);
	const examesFiltered = (0, import_react.useMemo)(() => exames.filter((r) => {
		if (empresa !== "__all__" && r.colaborador?.empresa !== empresa) return false;
		if (unidade !== "__all__" && r.colaborador?.unidade !== unidade) return false;
		if (dtIni && (!r.data_agendada || r.data_agendada < dtIni)) return false;
		if (dtFim && (!r.data_agendada || r.data_agendada > dtFim)) return false;
		return true;
	}), [
		exames,
		empresa,
		unidade,
		dtIni,
		dtFim
	]);
	const stats = (0, import_react.useMemo)(() => {
		const total = examesFiltered.length;
		const compareceu = examesFiltered.filter((e) => e.status === "compareceu" || e.status === "realizado").length;
		return {
			total,
			compareceu,
			faltou: examesFiltered.filter((e) => e.status === "faltou").length,
			pend: examesFiltered.filter((e) => e.status === "pendente").length,
			taxa: total ? Math.round(compareceu / total * 100) : 0
		};
	}, [examesFiltered]);
	const filtroLabel = [
		empresa !== "__all__" ? `Empresa: ${empresa}` : null,
		unidade !== "__all__" ? `Unidade: ${unidade}` : null,
		statusColab !== "__all__" ? `Status: ${statusColab}` : null
	].filter(Boolean).join(" · ") || "Todos os registros";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Relatórios",
			description: "Exporte dados e indicadores em PDF ou Excel"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-lg border border-border bg-card p-4 shadow-panel mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-5 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Empresa"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: empresa,
						onValueChange: setEmpresa,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "__all__",
							children: "Todas"
						}), empresas.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: e,
							children: e
						}, e))] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Unidade"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: unidade,
						onValueChange: setUnidade,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "__all__",
							children: "Todas"
						}), unidades.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: u,
							children: u
						}, u))] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Status do ASO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusColab,
						onValueChange: setStatusColab,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "__all__",
								children: "Todos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "em_dia",
								children: "Em dia"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "a_vencer",
								children: "A vencer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "vencido",
								children: "Vencido"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "sem_exame",
								children: "Sem exame"
							})
						] })]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Período (de)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: dtIni,
						onChange: (e) => setDtIni(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Período (até)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: dtFim,
						onChange: (e) => setDtFim(e.target.value)
					})] })
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 md:grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					title: "Situação dos ASOs",
					desc: `${colabsFiltered.length} colaboradores no filtro atual`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-primary" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => exportColabsPDF(colabsFiltered, filtroLabel),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), " PDF"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => exportColabsXLSX(colabsFiltered),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), " Excel"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					title: "Histórico de exames",
					desc: `${examesFiltered.length} exames — comparecimento: ${stats.taxa}%`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-5 w-5 text-primary" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => exportExamesPDF(examesFiltered),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), " PDF"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => exportExamesXLSX(examesFiltered),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), " Excel"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Indicadores por unidade/setor",
					desc: "Consolidado de ASOs por status",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-5 w-5 text-primary" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => exportIndicadoresPDF(colabsFiltered),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), " PDF"]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card p-4 shadow-panel mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium mb-3",
				children: "Estatísticas de comparecimento (filtro atual)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Total exames",
						value: stats.total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Compareceram",
						value: stats.compareceu,
						tone: "ok"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Faltas",
						value: stats.faltou,
						tone: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Pendências",
						value: stats.pend,
						tone: "warn"
					})
				]
			})]
		})
	] });
}
function Card({ title, desc, icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-4 shadow-panel flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					children: title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground min-h-[32px]",
				children: desc
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 flex-wrap",
				children
			})
		]
	});
}
function Kpi({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-2xl font-semibold ${tone === "ok" ? "text-status-ok-foreground" : tone === "warn" ? "text-status-warn-foreground" : tone === "danger" ? "text-status-danger" : ""}`,
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground mt-1",
			children: label
		})]
	});
}
//#endregion
export { RelatoriosPage as component };
