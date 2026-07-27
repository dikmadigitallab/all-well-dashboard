import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as STATUS_LABEL } from "./colaboradores-D6aiYvsj.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { B as Calendar, M as CircleCheck, a as TriangleAlert, j as CircleX, m as RotateCcw, n as Users } from "../_libs/lucide-react.mjs";
import { t as ptBR, u as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BHsBzqjb.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-CtDpYC8D.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as BarChart, o as Line, p as Legend, r as LineChart, s as CartesianGrid, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DmceRK7d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_COLORS = {
	em_dia: "var(--status-ok)",
	a_vencer: "var(--status-warn)",
	vencido: "var(--status-danger)",
	sem_exame: "var(--status-neutral)"
};
function Dashboard() {
	const [empresa, setEmpresa] = (0, import_react.useState)("__all__");
	const [area, setArea] = (0, import_react.useState)("__all__");
	const [setor, setSetor] = (0, import_react.useState)("__all__");
	const [periodo, setPeriodo] = (0, import_react.useState)("mensal");
	const [dataInicio, setDataInicio] = (0, import_react.useState)(void 0);
	const [dataFim, setDataFim] = (0, import_react.useState)(void 0);
	const { data: rows = [], isLoading } = useQuery({
		queryKey: ["colab-dash"],
		queryFn: async () => {
			const res = await authFetch("/api/colaboradores");
			if (!res.ok) throw new Error("Erro ao buscar dados");
			return (await res.json()).data.map(({ id, empresa, area, setor, funcao, status, proximo_exame, ativo }) => ({
				id,
				empresa,
				area,
				setor,
				funcao,
				status,
				proximo_exame,
				ativo
			}));
		}
	});
	const empresas = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.empresa).filter(Boolean))).sort(), [rows]);
	const areas = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.area).filter(Boolean))).sort(), [rows]);
	const setores = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.setor).filter(Boolean))).sort(), [rows]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => (empresa === "__all__" || r.empresa === empresa) && (area === "__all__" || r.area === area) && (setor === "__all__" || r.setor === setor) && (dataInicio ? r.proximo_exame ? new Date(r.proximo_exame) >= dataInicio : false : true) && (dataFim ? r.proximo_exame ? new Date(r.proximo_exame) <= dataFim : false : true)), [
		rows,
		empresa,
		area,
		setor,
		dataInicio,
		dataFim
	]);
	const total = filtered.length;
	const counts = (0, import_react.useMemo)(() => {
		const c = {
			em_dia: 0,
			a_vencer: 0,
			vencido: 0,
			sem_exame: 0
		};
		for (const r of filtered) c[r.status ?? "sem_exame"]++;
		return c;
	}, [filtered]);
	const pct = (n) => total ? Math.round(n / total * 100) : 0;
	const statusData = [
		{
			name: "Em dia",
			value: counts.em_dia,
			key: "em_dia"
		},
		{
			name: "A vencer",
			value: counts.a_vencer,
			key: "a_vencer"
		},
		{
			name: "Vencido",
			value: counts.vencido,
			key: "vencido"
		},
		{
			name: "Sem exame",
			value: counts.sem_exame,
			key: "sem_exame"
		}
	];
	const porArea = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const r of filtered) {
			const k = r.area || "—";
			const cur = map.get(k) ?? {
				em_dia: 0,
				a_vencer: 0,
				vencido: 0,
				sem_exame: 0
			};
			cur[r.status ?? "sem_exame"]++;
			map.set(k, cur);
		}
		return Array.from(map.entries()).map(([name, v]) => ({
			name,
			...v
		})).sort((a, b) => b.em_dia + b.a_vencer + b.vencido + b.sem_exame - (a.em_dia + a.a_vencer + a.vencido + a.sem_exame)).slice(0, 10);
	}, [filtered]);
	const evolucao = (0, import_react.useMemo)(() => {
		const buckets = /* @__PURE__ */ new Map();
		const now = /* @__PURE__ */ new Date();
		const bucketKey = (d) => {
			if (periodo === "semanal") {
				const week = Math.floor((d.getTime() - now.getTime()) / (7 * 864e5));
				return `S${week >= 0 ? "+" : ""}${week}`;
			}
			if (periodo === "trimestral") return `${d.getFullYear()}·T${Math.floor(d.getMonth() / 3) + 1}`;
			if (periodo === "anual") return `${d.getFullYear()}`;
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		};
		for (const r of filtered) {
			if (!r.proximo_exame) continue;
			const d = new Date(r.proximo_exame);
			const k = bucketKey(d);
			const b = buckets.get(k) ?? {
				periodo: k,
				vencidos: 0,
				a_vencer: 0
			};
			if (d < now) b.vencidos++;
			else b.a_vencer++;
			buckets.set(k, b);
		}
		return Array.from(buckets.values()).sort((a, b) => a.periodo.localeCompare(b.periodo)).slice(-12);
	}, [filtered, periodo]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Dashboard gerencial",
			description: isLoading ? "Carregando dados..." : `${total} colaboradores no filtro atual`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: cn("w-[160px] justify-start", !dataInicio && "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }), dataInicio ? format(dataInicio, "dd/MM/yy") : "Data início"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: dataInicio,
							onSelect: setDataInicio,
							locale: ptBR
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: cn("w-[160px] justify-start", !dataFim && "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }), dataFim ? format(dataFim, "dd/MM/yy") : "Data fim"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: dataFim,
							onSelect: setDataFim,
							locale: ptBR
						})
					})] }),
					(dataInicio || dataFim || empresa !== "__all__" || area !== "__all__" || setor !== "__all__") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setDataInicio(void 0);
							setDataFim(void 0);
							setEmpresa("__all__");
							setArea("__all__");
							setSetor("__all__");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3 mr-1" }), " Limpar"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: empresa,
						onChange: setEmpresa,
						placeholder: "Empresa",
						options: empresas
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: area,
						onChange: setArea,
						placeholder: "Área",
						options: areas
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						value: setor,
						onChange: setSetor,
						placeholder: "Setor",
						options: setores
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: periodo,
						onValueChange: (v) => setPeriodo(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[140px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "semanal",
								children: "Semanal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "mensal",
								children: "Mensal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "trimestral",
								children: "Trimestral"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "anual",
								children: "Anual"
							})
						] })]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					icon: Users,
					label: "Total",
					value: total,
					tone: "neutral"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					icon: CircleCheck,
					label: STATUS_LABEL.em_dia,
					value: counts.em_dia,
					pct: pct(counts.em_dia),
					tone: "ok"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					icon: TriangleAlert,
					label: STATUS_LABEL.a_vencer,
					value: counts.a_vencer,
					pct: pct(counts.a_vencer),
					tone: "warn"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					icon: CircleX,
					label: STATUS_LABEL.vencido,
					value: counts.vencido,
					pct: pct(counts.vencido),
					tone: "danger"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-1 rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium mb-4",
					children: "Distribuição de status"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: statusData,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 50,
								outerRadius: 90,
								paddingAngle: 2,
								children: statusData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: STATUS_COLORS[d.key] }, d.key))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								verticalAlign: "bottom",
								height: 24,
								iconSize: 8
							})
						] })
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2 rounded-lg border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium mb-4",
					children: "Colaboradores por área (top 10)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: porArea,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "var(--border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: { fontSize: 11 },
									interval: 0,
									angle: -25,
									textAnchor: "end",
									height: 70
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { iconSize: 10 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "em_dia",
									stackId: "a",
									fill: "var(--status-ok)",
									name: "Em dia"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "a_vencer",
									stackId: "a",
									fill: "var(--status-warn)",
									name: "A vencer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "vencido",
									stackId: "a",
									fill: "var(--status-danger)",
									name: "Vencido"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "sem_exame",
									stackId: "a",
									fill: "var(--status-neutral)",
									name: "Sem exame"
								})
							]
						})
					})
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium mb-4",
				children: "Evolução dos próximos vencimentos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-72",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: evolucao,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: "var(--border)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "periodo",
								tick: { fontSize: 11 }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { iconSize: 10 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "a_vencer",
								stroke: "var(--status-warn)",
								strokeWidth: 2,
								name: "A vencer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "vencidos",
								stroke: "var(--status-danger)",
								strokeWidth: 2,
								name: "Vencidos"
							})
						]
					})
				})
			})]
		})
	] });
}
function FilterSelect({ value, onChange, placeholder, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			className: "w-[160px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
			value: "__all__",
			children: [
				"Todas as ",
				placeholder.toLowerCase(),
				"s"
			]
		}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o,
			children: o
		}, o))] })]
	});
}
function KpiCard({ icon: Icon, label, value, pct, tone }) {
	const toneClass = {
		ok: "text-status-ok bg-status-ok/15",
		warn: "text-status-warn bg-status-warn/20",
		danger: "text-status-danger bg-status-danger/15",
		neutral: "text-primary bg-primary/10"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-5 shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `h-8 w-8 rounded-md flex items-center justify-center ${toneClass}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex items-baseline gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-3xl font-semibold tracking-tight",
				children: value.toLocaleString("pt-BR")
			}), pct !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm text-muted-foreground",
				children: [pct, "%"]
			})]
		})]
	});
}
//#endregion
export { Dashboard as component };
