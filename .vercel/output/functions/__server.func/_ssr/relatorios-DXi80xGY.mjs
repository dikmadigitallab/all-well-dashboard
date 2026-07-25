import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as FileSpreadsheet, w as FileText, z as ChartColumn } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { n as formatCPF, r as formatDate, t as STATUS_LABEL } from "./colaboradores-D6aiYvsj.mjs";
import { i as writeSync, r as utils } from "../_libs/xlsx.mjs";
import { t as require_FileSaver_min } from "../_libs/file-saver.mjs";
import { a as TIPO_LABEL, i as STATUS_EXAME_LABEL, n as MOTIVO_LABEL, o as supabase } from "./exames-CU41fIOt.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { t as autoTable } from "../_libs/jspdf-autotable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/relatorios-DXi80xGY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_FileSaver_min = require_FileSaver_min();
var import_jspdf_node_min = /* @__PURE__ */ __toESM(require_jspdf_node_min());
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function pdfHeader(doc, title, subtitle) {
	doc.setFontSize(16);
	doc.setFont("helvetica", "bold");
	doc.text("Controle de ASOs", 14, 16);
	doc.setFontSize(11);
	doc.setFont("helvetica", "normal");
	doc.text(title, 14, 23);
	if (subtitle) {
		doc.setFontSize(9);
		doc.setTextColor(120);
		doc.text(subtitle, 14, 29);
		doc.setTextColor(0);
	}
	doc.setDrawColor(220);
	doc.line(14, 32, 196, 32);
}
function exportColabsPDF(rows, filtroLabel) {
	const doc = new import_jspdf_node_min.default({ orientation: "landscape" });
	pdfHeader(doc, `Situação dos ASOs — ${rows.length} colaboradores`, filtroLabel);
	autoTable(doc, {
		startY: 36,
		styles: {
			fontSize: 8,
			cellPadding: 2
		},
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		head: [[
			"Nome",
			"Empresa",
			"Unidade",
			"Função",
			"CPF",
			"Próx. exame",
			"Dias",
			"Status"
		]],
		body: rows.map((r) => [
			r.nome ?? "—",
			r.empresa ?? "—",
			r.unidade ?? "—",
			r.funcao ?? "—",
			formatCPF(r.cpf),
			formatDate(r.proximo_exame),
			r.dias_para_vencer ?? "—",
			STATUS_LABEL[r.status ?? "sem_exame"]
		])
	});
	doc.save(`asos_${today()}.pdf`);
}
function exportColabsXLSX(rows) {
	const data = rows.map((r) => ({
		Nome: r.nome,
		Empresa: r.empresa,
		Unidade: r.unidade,
		Área: r.area,
		Setor: r.setor,
		Função: r.funcao,
		"Matrícula SAP": r.matricula_sap,
		CPF: r.cpf,
		RG: r.rg,
		PIS: r.pis,
		Nascimento: r.nascimento,
		Escala: r.escala_turno,
		GHE: r.ghe,
		"Periodicidade (m)": r.periodicidade_meses,
		"Último exame": r.ultimo_exame,
		"Próximo exame": r.proximo_exame,
		"Dias p/ vencer": r.dias_para_vencer,
		Status: STATUS_LABEL[r.status ?? "sem_exame"]
	}));
	const ws = utils.json_to_sheet(data);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "ASOs");
	const buf = writeSync(wb, {
		bookType: "xlsx",
		type: "array"
	});
	(0, import_FileSaver_min.saveAs)(new Blob([buf]), `asos_${today()}.xlsx`);
}
function exportExamesPDF(rows, titulo = "Histórico de exames") {
	const doc = new import_jspdf_node_min.default({ orientation: "landscape" });
	pdfHeader(doc, `${titulo} — ${rows.length} registros`);
	autoTable(doc, {
		startY: 36,
		styles: {
			fontSize: 8,
			cellPadding: 2
		},
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		head: [[
			"Colaborador",
			"Empresa/Unidade",
			"Tipo",
			"Agendado",
			"Realizado",
			"Vencimento",
			"Status",
			"Motivo"
		]],
		body: rows.map((r) => [
			r.colaborador?.nome ?? "—",
			`${r.colaborador?.empresa ?? "—"} / ${r.colaborador?.unidade ?? "—"}`,
			TIPO_LABEL[r.tipo],
			formatDate(r.data_agendada),
			formatDate(r.data_realizado),
			formatDate(r.data_vencimento),
			STATUS_EXAME_LABEL[r.status],
			r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : "—"
		])
	});
	doc.save(`exames_${today()}.pdf`);
}
function exportExamesXLSX(rows) {
	const data = rows.map((r) => ({
		Colaborador: r.colaborador?.nome ?? "",
		Empresa: r.colaborador?.empresa ?? "",
		Unidade: r.colaborador?.unidade ?? "",
		Tipo: TIPO_LABEL[r.tipo],
		Agendado: r.data_agendada,
		Realizado: r.data_realizado,
		Vencimento: r.data_vencimento,
		Status: STATUS_EXAME_LABEL[r.status],
		Motivo: r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : "",
		Justificativa: r.justificativa ?? ""
	}));
	const ws = utils.json_to_sheet(data);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "Exames");
	const buf = writeSync(wb, {
		bookType: "xlsx",
		type: "array"
	});
	(0, import_FileSaver_min.saveAs)(new Blob([buf]), `exames_${today()}.xlsx`);
}
function exportIndicadoresPDF(colabs) {
	const doc = new import_jspdf_node_min.default();
	pdfHeader(doc, "Indicadores por unidade e setor");
	const total = colabs.length;
	const porStatus = {};
	for (const c of colabs) porStatus[c.status ?? "sem_exame"] = (porStatus[c.status ?? "sem_exame"] ?? 0) + 1;
	autoTable(doc, {
		startY: 38,
		head: [["Indicador", "Valor"]],
		body: [
			["Total de colaboradores", String(total)],
			["Em dia", String(porStatus["em_dia"] ?? 0)],
			["A vencer (≤30 dias)", String(porStatus["a_vencer"] ?? 0)],
			["Vencidos", String(porStatus["vencido"] ?? 0)],
			["Sem exame", String(porStatus["sem_exame"] ?? 0)]
		],
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		styles: { fontSize: 10 }
	});
	const agrupa = (key) => {
		const m = /* @__PURE__ */ new Map();
		for (const c of colabs) {
			const k = c[key] ?? "—";
			const cur = m.get(k) ?? {
				total: 0,
				vencido: 0,
				a_vencer: 0,
				em_dia: 0,
				sem_exame: 0
			};
			cur.total++;
			cur[c.status ?? "sem_exame"]++;
			m.set(k, cur);
		}
		return Array.from(m.entries()).sort((a, b) => b[1].total - a[1].total);
	};
	autoTable(doc, {
		head: [[
			"Unidade",
			"Total",
			"Em dia",
			"A vencer",
			"Vencido",
			"Sem exame"
		]],
		body: agrupa("unidade").map(([k, v]) => [
			k,
			v.total,
			v.em_dia,
			v.a_vencer,
			v.vencido,
			v.sem_exame
		]),
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		styles: { fontSize: 9 }
	});
	autoTable(doc, {
		head: [[
			"Setor",
			"Total",
			"Em dia",
			"A vencer",
			"Vencido",
			"Sem exame"
		]],
		body: agrupa("setor").map(([k, v]) => [
			k,
			v.total,
			v.em_dia,
			v.a_vencer,
			v.vencido,
			v.sem_exame
		]),
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		styles: { fontSize: 9 }
	});
	doc.save(`indicadores_${today()}.pdf`);
}
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
