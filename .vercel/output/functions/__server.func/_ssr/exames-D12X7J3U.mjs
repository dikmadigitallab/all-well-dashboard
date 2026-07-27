import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./use-auth-LCVRQC72.mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { t as Textarea } from "./textarea-DjqHhWkA.mjs";
import { r as formatDate } from "./colaboradores-D6aiYvsj.mjs";
import { a as TIPO_LABEL, i as STATUS_EXAME_LABEL, n as MOTIVO_LABEL, r as STATUS_EXAME_CLASSES } from "./exames-Y-GpGzpK.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { N as CircleAlert, R as Check, V as CalendarPlus, t as X } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-BvYONHWJ.mjs";
import { t as supabase } from "./client-D3NoJT_3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exames-D12X7J3U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExamesPage() {
	const { isAdmin } = useAuth();
	const qc = useQueryClient();
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [empresa, setEmpresa] = (0, import_react.useState)("__all__");
	const [openNew, setOpenNew] = (0, import_react.useState)(false);
	const { data: rows = [], isLoading } = useQuery({
		queryKey: ["exames-lista"],
		queryFn: async () => {
			const { data, error } = await supabase.from("exames").select("*, colaborador:colaboradores!inner(id,nome,empresa,unidade)").order("data_agendada", {
				ascending: true,
				nullsFirst: false
			}).limit(500);
			if (error) throw error;
			return data ?? [];
		}
	});
	const empresas = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.colaborador?.empresa).filter(Boolean))).sort(), [rows]);
	const filtered = (0, import_react.useMemo)(() => rows.filter((r) => {
		if (statusFilter !== "all" && r.status !== statusFilter) return false;
		if (empresa !== "__all__" && r.colaborador?.empresa !== empresa) return false;
		return true;
	}), [
		rows,
		statusFilter,
		empresa
	]);
	const mark = useMutation({
		mutationFn: async (args) => {
			const { error } = await supabase.from("exames").update(args.patch).eq("id", args.id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["exames-lista"] });
			qc.invalidateQueries({ queryKey: ["pendencias-list"] });
			toast.success("Exame atualizado");
		},
		onError: (e) => toast.error("Erro", { description: e.message })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Agenda de exames",
		description: "Convocações, comparecimentos e reagendamentos",
		actions: isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open: openNew,
			onOpenChange: setOpenNew,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "h-4 w-4 mr-2" }), "Novo exame"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewExameDialog, { onClose: () => setOpenNew(false) })]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-4 shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-3 mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-[180px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs text-muted-foreground",
					children: "Status"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: statusFilter,
					onValueChange: (v) => setStatusFilter(v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "Todos"
					}), Object.keys(STATUS_EXAME_LABEL).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: s,
						children: STATUS_EXAME_LABEL[s]
					}, s))] })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-[180px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
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
				})]
			})]
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
							children: "Agendado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-2",
							children: "Realizado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left p-2",
							children: "Status"
						}),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right p-2",
							children: "Ações"
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
						children: "Nenhum exame encontrado."
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
								children: formatDate(r.data_agendada)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: formatDate(r.data_realizado)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "p-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", STATUS_EXAME_CLASSES[r.status]),
									children: STATUS_EXAME_LABEL[r.status]
								}), r.status === "pendente" && r.motivo_pendencia && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-xs text-muted-foreground",
									children: MOTIVO_LABEL[r.motivo_pendencia]
								})]
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											title: "Compareceu",
											onClick: () => mark.mutate({
												id: r.id,
												patch: {
													status: "compareceu",
													data_realizado: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
												}
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-status-ok-foreground" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											title: "Faltou",
											onClick: () => mark.mutate({
												id: r.id,
												patch: { status: "faltou" }
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-status-danger" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkPendenteButton, {
											id: r.id,
											onDone: () => qc.invalidateQueries({ queryKey: ["exames-lista"] })
										})
									]
								})
							})
						]
					}, r.id))
				] })]
			})
		})]
	})] });
}
function MarkPendenteButton({ id, onDone }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [motivo, setMotivo] = (0, import_react.useState)("agendamento");
	const [just, setJust] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const submit = async () => {
		setBusy(true);
		const { error } = await supabase.from("exames").update({
			status: "pendente",
			motivo_pendencia: motivo,
			justificativa: just || null
		}).eq("id", id);
		setBusy(false);
		if (error) return toast.error("Erro", { description: error.message });
		toast.success("Pendência registrada");
		setOpen(false);
		onDone();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				title: "Marcar pendência",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-status-warn-foreground" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Registrar pendência" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Motivo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: motivo,
					onValueChange: (v) => setMotivo(v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(MOTIVO_LABEL).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: m,
						children: MOTIVO_LABEL[m]
					}, m)) })]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Justificativa (opcional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 3,
					value: just,
					onChange: (e) => setJust(e.target.value)
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setOpen(false),
				children: "Cancelar"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: submit,
				disabled: busy,
				children: "Registrar"
			})] })
		] })]
	});
}
function NewExameDialog({ onClose }) {
	const qc = useQueryClient();
	const [colaboradorId, setColaboradorId] = (0, import_react.useState)("");
	const [tipo, setTipo] = (0, import_react.useState)("periodico");
	const [dataAgendada, setDataAgendada] = (0, import_react.useState)("");
	const [clinica, setClinica] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { data: colabs = [] } = useQuery({
		queryKey: ["colabs-select"],
		queryFn: async () => {
			const { data, error } = await supabase.from("colaboradores").select("id,nome,empresa").eq("ativo", true).order("nome").limit(2e3);
			if (error) throw error;
			return data;
		}
	});
	const submit = async () => {
		if (!colaboradorId) return toast.error("Selecione um colaborador");
		if (!dataAgendada) return toast.error("Informe a data agendada");
		setBusy(true);
		const { error } = await supabase.from("exames").insert({
			colaborador_id: colaboradorId,
			tipo,
			data_agendada: dataAgendada,
			clinica: clinica || null,
			status: "agendado"
		});
		setBusy(false);
		if (error) return toast.error("Erro", { description: error.message });
		toast.success("Exame agendado");
		qc.invalidateQueries({ queryKey: ["exames-lista"] });
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Novo exame" }) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Colaborador"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: colaboradorId,
					onValueChange: setColaboradorId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Selecione..." }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: colabs.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: c.id,
						children: [
							c.nome,
							" ",
							c.empresa ? `· ${c.empresa}` : ""
						]
					}, c.id)) })]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Tipo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: tipo,
						onValueChange: (v) => setTipo(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(TIPO_LABEL).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: t,
							children: TIPO_LABEL[t]
						}, t)) })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Data agendada"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: dataAgendada,
						onChange: (e) => setDataAgendada(e.target.value)
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Clínica (opcional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: clinica,
					onChange: (e) => setClinica(e.target.value)
				})] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: onClose,
			children: "Cancelar"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: submit,
			disabled: busy,
			children: "Agendar"
		})] })
	] });
}
//#endregion
export { ExamesPage as component };
