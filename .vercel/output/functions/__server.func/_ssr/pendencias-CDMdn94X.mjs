import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./use-auth-LCVRQC72.mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { r as formatDate } from "./colaboradores-D6aiYvsj.mjs";
import { a as TIPO_LABEL, n as MOTIVO_LABEL, t as MOTIVO_COLORS } from "./exames-Y-GpGzpK.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as CircleCheck, a as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { d as ResponsiveContainer, f as Tooltip, l as Pie, p as Legend, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
import { t as supabase } from "./client-D3NoJT_3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pendencias-CDMdn94X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PendenciasPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [motivo, setMotivo] = (0, import_react.useState)("all");
	const { data: rows = [], isLoading } = useQuery({
		queryKey: ["pendencias-list"],
		queryFn: async () => {
			const { data, error } = await supabase.from("exames").select("*, colaborador:colaboradores!inner(id,nome,empresa,unidade)").eq("status", "pendente").order("updated_at", { ascending: false }).limit(1e3);
			if (error) throw error;
			return data ?? [];
		}
	});
	const byMotivo = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const r of rows) {
			const k = r.motivo_pendencia ?? "outro";
			m.set(k, (m.get(k) ?? 0) + 1);
		}
		return Array.from(m.entries()).map(([k, v]) => ({
			motivo: k,
			label: MOTIVO_LABEL[k],
			value: v,
			color: MOTIVO_COLORS[k]
		}));
	}, [rows]);
	const filtered = motivo === "all" ? rows : rows.filter((r) => r.motivo_pendencia === motivo);
	const resolve = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("exames").update({
				status: "agendado",
				motivo_pendencia: null,
				justificativa: null
			}).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["pendencias-list"] });
			qc.invalidateQueries({ queryKey: ["exames-lista"] });
			toast.success("Pendência resolvida");
		},
		onError: (e) => toast.error("Erro", { description: e.message })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Pendências",
			description: "Exames pendentes por motivo, com histórico e ações"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-4 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-status-warn-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: "Total pendências"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-3xl font-semibold",
						children: rows.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground mt-1",
						children: "Exames com status pendente"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-4 shadow-panel lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium mb-2",
					children: "Distribuição por motivo"
				}), byMotivo.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-52 flex items-center justify-center text-sm text-muted-foreground",
					children: "Sem pendências."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-52",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: byMotivo,
							dataKey: "value",
							nameKey: "label",
							innerRadius: 40,
							outerRadius: 72,
							children: byMotivo.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: d.color }, d.motivo))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {})
					] }) })
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card p-4 shadow-panel mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-3 mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-[220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Motivo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: motivo,
						onValueChange: (v) => setMotivo(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Todos"
						}), Object.keys(MOTIVO_LABEL).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: m,
							children: MOTIVO_LABEL[m]
						}, m))] })]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-muted-foreground border-b border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-2",
								children: "Colaborador"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-2",
								children: "Empresa/Unidade"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-2",
								children: "Tipo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-2",
								children: "Motivo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-2",
								children: "Justificativa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-2",
								children: "Desde"
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right p-2",
								children: "Ação"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 7,
							className: "p-6 text-center text-muted-foreground",
							children: "Carregando..."
						}) }),
						!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 7,
							className: "p-6 text-center text-muted-foreground",
							children: "Nenhuma pendência."
						}) }),
						filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 hover:bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2 font-medium",
									children: r.colaborador?.nome ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "p-2 text-muted-foreground",
									children: [
										r.colaborador?.empresa ?? "—",
										" · ",
										r.colaborador?.unidade ?? "—"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: TIPO_LABEL[r.tipo]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2 text-muted-foreground max-w-[300px] truncate",
									title: r.justificativa ?? "",
									children: r.justificativa ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2",
									children: formatDate(r.updated_at)
								}),
								isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-2 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => resolve.mutate(r.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 mr-1" }), " Resolver"]
									})
								})
							]
						}, r.id))
					] })]
				})
			})]
		})
	] });
}
//#endregion
export { PendenciasPage as component };
