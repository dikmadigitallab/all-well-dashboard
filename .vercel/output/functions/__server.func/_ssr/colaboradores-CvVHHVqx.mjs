import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./use-auth-LCVRQC72.mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as ChevronRight, G as ArrowUpDown, I as ChevronLeft, O as Download, R as Check, W as ArrowUp, f as Search, h as Plus, q as ArrowDown, s as SquareCheckBig, w as FileText, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { i as statusBadge, n as formatCPF, r as formatDate } from "./colaboradores-D6aiYvsj.mjs";
import { i as writeSync, r as utils } from "../_libs/xlsx.mjs";
import { t as require_FileSaver_min } from "../_libs/file-saver.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/colaboradores-CvVHHVqx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_FileSaver_min = require_FileSaver_min();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function ColabList() {
	const { isAdmin } = useAuth();
	const [q, setQ] = (0, import_react.useState)("");
	const [empresa, setEmpresa] = (0, import_react.useState)("__all__");
	const [area, setArea] = (0, import_react.useState)("__all__");
	const [status, setStatus] = (0, import_react.useState)("__all__");
	const [proxExame, setProxExame] = (0, import_react.useState)("__all__");
	const [sortKey, setSortKey] = (0, import_react.useState)("nome");
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [gerando, setGerando] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const perPage = 8;
	const { data: rows = [], isLoading } = useQuery({
		queryKey: ["colaboradores-list"],
		queryFn: async () => {
			const res = await authFetch("/api/colaboradores");
			if (!res.ok) throw new Error("Erro ao buscar colaboradores");
			return (await res.json()).data;
		}
	});
	const empresas = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.empresa).filter(Boolean))).sort(), [rows]);
	const areas = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.area).filter(Boolean))).sort(), [rows]);
	const toggleSort = (key) => {
		if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortKey(key);
			setSortDir("asc");
		}
	};
	const toggleSelect = (id) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const resetPage = (0, import_react.useCallback)(() => setPage(1), []);
	(0, import_react.useEffect)(() => resetPage(), [
		q,
		empresa,
		area,
		status,
		proxExame,
		sortKey,
		sortDir,
		resetPage
	]);
	const toggleSelectAll = () => {
		const visible = paginado.map((r) => r.id);
		if (visible.every((id) => selectedIds.has(id))) setSelectedIds((prev) => {
			const next = new Set(prev);
			for (const id of visible) next.delete(id);
			return next;
		});
		else setSelectedIds((prev) => {
			const next = new Set(prev);
			for (const id of visible) next.add(id);
			return next;
		});
	};
	const gerarFormularios = async () => {
		if (selectedIds.size === 0) return;
		setGerando(true);
		try {
			const res = await authFetch("/api/gerar-formularios-colaboradores", {
				method: "POST",
				body: JSON.stringify({ colaborador_ids: Array.from(selectedIds) })
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao gerar formulários");
			}
			(0, import_FileSaver_min.saveAs)(await res.blob(), `formularios_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.zip`);
			toast.success(`${selectedIds.size} formulários gerados com sucesso!`);
		} catch (err) {
			toast.error("Erro ao gerar formulários", { description: err instanceof Error ? err.message : "Erro desconhecido" });
		} finally {
			setGerando(false);
		}
	};
	const filtered = (0, import_react.useMemo)(() => {
		const qq = q.trim().toLowerCase();
		return rows.filter((r) => {
			if (empresa !== "__all__" && r.empresa !== empresa) return false;
			if (area !== "__all__" && r.area !== area) return false;
			if (status !== "__all__" && r.status !== status) return false;
			if (proxExame !== "__all__") {
				if (!r.proximo_exame) return false;
				if (r.proximo_exame.slice(0, 7) !== proxExame) return false;
			}
			if (!qq) return true;
			const digits = qq.replace(/\D/g, "");
			return r.nome?.toLowerCase().includes(qq) || r.funcao?.toLowerCase().includes(qq) || r.matricula_sap?.toLowerCase().includes(qq) || digits.length > 0 && r.cpf?.replace(/\D/g, "").includes(digits);
		});
	}, [
		rows,
		q,
		empresa,
		area,
		status,
		proxExame
	]);
	const sorted = (0, import_react.useMemo)(() => {
		const arr = [...filtered];
		const dir = sortDir === "asc" ? 1 : -1;
		arr.sort((a, b) => {
			const va = a[sortKey];
			const vb = b[sortKey];
			if (va == null && vb == null) return 0;
			if (va == null) return 1;
			if (vb == null) return -1;
			if (sortKey === "dias_para_vencer") return (va - vb) * dir;
			return String(va).localeCompare(String(vb), "pt-BR") * dir;
		});
		return arr;
	}, [
		filtered,
		sortKey,
		sortDir
	]);
	const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
	const paginado = (0, import_react.useMemo)(() => sorted.slice((page - 1) * perPage, page * perPage), [
		sorted,
		page,
		perPage
	]);
	const exportar = () => {
		const data = filtered.map((r) => ({
			Nome: r.nome,
			Empresa: r.empresa,
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
			"Periodicidade (meses)": r.periodicidade_meses,
			"Último exame": r.ultimo_exame,
			"Próximo exame": r.proximo_exame,
			"Dias p/ vencer": r.dias_para_vencer,
			Status: r.status
		}));
		const ws = utils.json_to_sheet(data);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, "Colaboradores");
		const buf = writeSync(wb, {
			bookType: "xlsx",
			type: "array"
		});
		(0, import_FileSaver_min.saveAs)(new Blob([buf], { type: "application/octet-stream" }), `colaboradores_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.xlsx`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Colaboradores",
			description: isLoading ? "Carregando..." : `${filtered.length} colaboradores · Página ${page} de ${totalPages}`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				selectedIds.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground self-center",
					children: [selectedIds.size, " selecionado(s)"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: gerarFormularios,
					disabled: selectedIds.size === 0 || gerando,
					children: [gerando ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), gerando ? "Gerando..." : "Gerar formulários"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: toggleSelectAll,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-4 w-4 mr-2" }), "Selecionar"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: exportar,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-2" }), "Exportar"]
				}),
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/colaboradores/$id",
						params: { id: "novo" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), "Novo colaborador"]
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2 mb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[240px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Buscar por nome, CPF, matrícula ou função...",
						value: q,
						onChange: (e) => setQ(e.target.value),
						className: "pl-9"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: empresa,
					onValueChange: setEmpresa,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-[180px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Empresa" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "__all__",
						children: "Todas as empresas"
					}), empresas.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: e,
						children: e
					}, e))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: area,
					onValueChange: setArea,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-[160px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Área" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "__all__",
						children: "Todas as áreas"
					}), areas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: a,
						children: a
					}, a))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: status,
					onValueChange: setStatus,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-[160px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Status" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "__all__",
							children: "Todos os status"
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
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 w-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: paginado.length > 0 && paginado.every((r) => selectedIds.has(r.id)),
									onCheckedChange: toggleSelectAll
								})
							}), [
								["nome", "Nome"],
								["empresa", "Empresa"],
								["area", "Área"],
								["funcao", "Função"],
								["cpf", "CPF"],
								["proximo_exame", "Próx. exame"],
								["dias_para_vencer", "Dias"],
								["status", "Status"]
							].map(([key, label]) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors",
									onClick: () => toggleSort(key),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(sortKey === key ? sortDir === "asc" ? ArrowUp : ArrowDown : ArrowUpDown, { className: "h-3 w-3" })]
									})
								}, key);
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: paginado.map((r) => {
							const b = statusBadge(r.status);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: selectedIds.has(r.id),
											onCheckedChange: () => toggleSelect(r.id)
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/colaboradores/$id",
											params: { id: r.id },
											className: "font-medium hover:underline",
											children: r.nome
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground",
										children: r.empresa ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground",
										children: r.area ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground",
										children: r.funcao ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground tabular-nums",
										children: formatCPF(r.cpf)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground tabular-nums",
										children: formatDate(r.proximo_exame)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 tabular-nums",
										children: r.dias_para_vencer ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", b.className),
											children: b.label
										})
									})
								]
							}, r.id);
						}) })]
					})
				}),
				totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-3 border-t border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							(page - 1) * perPage + 1,
							"–",
							Math.min(page * perPage, sorted.length),
							" de ",
							sorted.length,
							" resultados"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-7 px-2",
								disabled: page <= 1,
								onClick: () => setPage((p) => Math.max(1, p - 1)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
							}),
							(() => {
								const pages = [];
								const delta = 2;
								const start = Math.max(1, page - delta);
								const end = Math.min(totalPages, page + delta);
								if (start > 1) pages.push(1);
								if (start > 2) pages.push("…");
								for (let i = start; i <= end; i++) pages.push(i);
								if (end < totalPages - 1) pages.push("…");
								if (end < totalPages) pages.push(totalPages);
								return pages.map((p, i) => typeof p === "string" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-1 text-xs text-muted-foreground",
									children: "…"
								}, `ellipsis-${i}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: p === page ? "default" : "ghost",
									size: "sm",
									className: "h-7 min-w-[28px] px-1 text-xs",
									onClick: () => setPage(p),
									children: p
								}, p));
							})(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-7 px-2",
								disabled: page >= totalPages,
								onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
							})
						]
					})]
				}),
				!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-12 text-center text-sm text-muted-foreground",
					children: [
						"Nenhum colaborador encontrado.",
						" ",
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/importar",
							className: "text-primary hover:underline",
							children: "Importe sua planilha"
						}),
						"."
					]
				})
			]
		})
	] });
}
//#endregion
export { ColabList as component };
