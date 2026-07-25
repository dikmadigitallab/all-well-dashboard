import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Calendar, L as ChevronDown, R as Check, V as CalendarPlus, d as Send, f as Search, g as Pencil, m as RotateCcw, o as Trash2, t as X, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as registrarHistorico } from "./historico-BhDclkFM.mjs";
import { t as ptBR, u as format } from "../_libs/date-fns.mjs";
import { t as Calendar$1 } from "./calendar-BHsBzqjb.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-CtDpYC8D.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { t as Badge } from "./badge-B3f60TId.mjs";
import { n as CardContent, t as Card } from "./card-C5Nmk_bj.mjs";
import { t as Separator } from "./separator-UwBgvWUO.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agendar-exames-CzZr62jI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
function AgendarExames() {
	const queryClient = useQueryClient();
	const [date, setDate] = (0, import_react.useState)(void 0);
	const [dataSegundaEtapa, setDataSegundaEtapa] = (0, import_react.useState)(void 0);
	const [colaboradorId, setColaboradorId] = (0, import_react.useState)("");
	const [colaboradorNome, setColaboradorNome] = (0, import_react.useState)("");
	const [colabSearch, setColabSearch] = (0, import_react.useState)("");
	const [colabOpen, setColabOpen] = (0, import_react.useState)(false);
	const [tipo, setTipo] = (0, import_react.useState)("periodico");
	const [clinica, setClinica] = (0, import_react.useState)("");
	const [editingExameId, setEditingExameId] = (0, import_react.useState)(null);
	const [email, setEmail] = (0, import_react.useState)("");
	const [emailNovo, setEmailNovo] = (0, import_react.useState)("");
	const [emailOpen, setEmailOpen] = (0, import_react.useState)(false);
	(0, import_react.useRef)(null);
	const { data: exames = [], isLoading: loadingExames } = useQuery({
		queryKey: ["exames-agendados"],
		queryFn: async () => {
			const res = await authFetch("/api/exames?status=agendado");
			if (!res.ok) throw new Error("Erro ao buscar exames");
			return (await res.json()).data;
		}
	});
	const { data: colaboradores = [] } = useQuery({
		queryKey: ["colaboradores-list"],
		queryFn: async () => {
			const res = await authFetch("/api/colaboradores");
			if (!res.ok) throw new Error("Erro ao buscar colaboradores");
			return (await res.json()).data;
		}
	});
	const { data: emailsContato = [] } = useQuery({
		queryKey: ["emails-contato"],
		queryFn: async () => {
			const res = await authFetch("/api/emails-contato");
			if (!res.ok) throw new Error("Erro ao buscar emails");
			return (await res.json()).data;
		}
	});
	const criarExame = useMutation({
		mutationFn: async (payload) => {
			const res = await authFetch("/api/exames", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao agendar");
			}
			return res.json();
		},
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
			queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
			queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
			const exame = result?.data;
			if (exame) {
				const d = parseDateSafe(exame.data_agendada);
				registrarHistorico({
					colaboradorId: exame.colaborador_id,
					exameId: exame.id,
					evento: "agendado",
					descricao: `Exame agendado para ${d ? format(d, "dd/MM/yyyy") : "data inválida"}`,
					detalhes: {
						tipo: exame.tipo,
						data_agendada: exame.data_agendada
					}
				});
			}
			setDate(void 0);
			setDataSegundaEtapa(void 0);
			setColaboradorId("");
			setColaboradorNome("");
			setColabSearch("");
			setEmail("");
			toast.success("Exame agendado com sucesso!");
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const updateExame = useMutation({
		mutationFn: async ({ exameId, payload }) => {
			const res = await authFetch(`/api/exames/${exameId}`, {
				method: "PUT",
				body: JSON.stringify(payload)
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao reagendar");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
			queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
			queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
			limparForm();
			toast.success("Exame reagendado com sucesso!");
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const salvarEmail = useMutation({
		mutationFn: async (payload) => {
			const res = await authFetch("/api/emails-contato", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao salvar email");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["emails-contato"] });
		}
	});
	const enviarConfirmacao = useMutation({
		mutationFn: async (payload) => {
			const res = await authFetch("/api/exames/enviar-confirmacao", {
				method: "POST",
				body: JSON.stringify(payload)
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao enviar");
			}
			return res.json();
		},
		onSuccess: () => {
			toast.success("Confirmação enviada com sucesso!");
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const cancelarExame = useMutation({
		mutationFn: async (exameId) => {
			const res = await authFetch(`/api/exames/${exameId}`, {
				method: "PUT",
				body: JSON.stringify({
					status: "cancelado",
					data_1_etapa: null,
					data_2_etapa: null,
					justificativa_falta: null,
					etapa_faltou: null
				})
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao cancelar exame");
			}
			return res.json();
		},
		onSuccess: (_data, exameId) => {
			queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
			queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
			queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
			toast.success("Exame desmarcado com sucesso!");
			const exame = exames.find((e) => e.id === exameId);
			if (exame) registrarHistorico({
				colaboradorId: exame.colaborador_id,
				exameId: exame.id,
				evento: "cancelado",
				descricao: "Exame desmarcado/cancelado"
			});
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const colabFiltrados = (0, import_react.useMemo)(() => colaboradores.filter((c) => c.nome.toLowerCase().includes(colabSearch.toLowerCase()) || (c.cpf || "").includes(colabSearch.replace(/\D/g, ""))).slice(0, 30), [colaboradores, colabSearch]);
	const colabSelecionado = (0, import_react.useMemo)(() => colaboradores.find((c) => c.id === colaboradorId), [colaboradores, colaboradorId]);
	const examesPorColaborador = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const ex of exames) {
			const entry = map.get(ex.colaborador_id) ?? {
				colaborador: ex.colaborador,
				exames: []
			};
			entry.exames.push(ex);
			map.set(ex.colaborador_id, entry);
		}
		return Array.from(map.entries()).map(([_, entry]) => entry).sort((a, b) => a.colaborador.nome.localeCompare(b.colaborador.nome));
	}, [exames]);
	const datasComExames = (0, import_react.useMemo)(() => exames.map((e) => e.data_agendada ? e.data_agendada.slice(0, 10) : "").filter(Boolean), [exames]);
	const handleAgendar = async (comEnvio = false) => {
		if (!date) {
			toast.error("Selecione uma data");
			return;
		}
		if (!colaboradorId) {
			toast.error("Selecione um colaborador");
			return;
		}
		const data1 = format(date, "yyyy-MM-dd");
		const data2 = dataSegundaEtapa ? format(dataSegundaEtapa, "yyyy-MM-dd") : null;
		if (editingExameId) await updateExame.mutateAsync({
			exameId: editingExameId,
			payload: {
				data_agendada: data1,
				clinica: clinica || null
			}
		});
		else {
			const result = await criarExame.mutateAsync({
				colaborador_id: colaboradorId,
				data_agendada: data1,
				data_1_etapa: data1,
				data_2_etapa: data2 ?? void 0,
				tipo,
				clinica: clinica || void 0
			});
			if (comEnvio) {
				if (!result?.data?.id) {
					toast.error("Exame criado mas sem ID para enviar confirmação");
					return;
				}
				let emailParaEnviar = email;
				if (emailNovo && !emailsContato.find((e) => e.email === emailNovo.toLowerCase())) {
					emailParaEnviar = (await salvarEmail.mutateAsync({ email: emailNovo })).data.email;
					setEmailNovo("");
				}
				if (!emailParaEnviar) {
					toast.error("Selecione ou digite um email para enviar a confirmação");
					return;
				}
				enviarConfirmacao.mutate({
					exame_id: result.data.id,
					email: emailParaEnviar
				}, {
					onSuccess: () => {
						toast.success("Confirmação enviada com sucesso!");
					},
					onError: (err) => {
						toast.error(err.message);
					}
				});
			}
		}
	};
	const handleAddEmail = async () => {
		const novo = emailNovo.trim().toLowerCase();
		if (!novo) return;
		if (emailsContato.find((e) => e.email === novo)) {
			setEmail(novo);
			setEmailNovo("");
			setEmailOpen(false);
			return;
		}
		await salvarEmail.mutateAsync({ email: novo });
		setEmail(novo);
		setEmailNovo("");
		setEmailOpen(false);
		toast.success("Email salvo na lista!");
	};
	const agendando = criarExame.isPending || updateExame.isPending;
	const limparForm = () => {
		setDate(void 0);
		setDataSegundaEtapa(void 0);
		setColaboradorId("");
		setColaboradorNome("");
		setColabSearch("");
		setEditingExameId(null);
		setEmail("");
		setTipo("periodico");
		setClinica("");
	};
	function parseDateSafe(d) {
		if (!d) return void 0;
		const clean = d.split("T")[0];
		if (!clean) return void 0;
		const dt = /* @__PURE__ */ new Date(clean + "T12:00:00");
		return Number.isNaN(dt.getTime()) ? void 0 : dt;
	}
	const handleEditExame = (ex) => {
		setEditingExameId(ex.id);
		setDate(parseDateSafe(ex.data_agendada));
		setDataSegundaEtapa(parseDateSafe(ex.data_2_etapa));
		setColaboradorId(ex.colaborador_id);
		setColaboradorNome(ex.colaborador.nome);
		setTipo(ex.tipo);
		setClinica(ex.clinica ?? "");
		setEmail("");
		setColabSearch(ex.colaborador.nome);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Agendar Exames ASO",
		description: "Agende exames e envie confirmações por email"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-1 space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Data 1ª etapa" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }), date ? format(date, "dd/MM/yyyy") : "Selecionar data"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: date,
							onSelect: setDate,
							locale: ptBR,
							modifiers: { hasExam: (d) => datasComExames.includes(format(d, "yyyy-MM-dd")) },
							modifiersClassNames: { hasExam: "border-2 border-primary" }
						})
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Data 2ª etapa" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: cn("w-full justify-start text-left font-normal", !dataSegundaEtapa && "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }), dataSegundaEtapa ? format(dataSegundaEtapa, "dd/MM/yyyy") : "Selecionar data"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: dataSegundaEtapa,
							onSelect: setDataSegundaEtapa,
							locale: ptBR
						})
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Colaborador" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: colabOpen,
						onOpenChange: setColabOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								role: "combobox",
								"aria-expanded": colabOpen,
								className: "w-full justify-between",
								children: [colabSelecionado ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: colabSelecionado.nome
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Buscar colaborador..."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 opacity-50" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
							className: "w-[var(--radix-popover-trigger-width)] p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
								placeholder: "Buscar por nome ou CPF...",
								value: colabSearch,
								onValueChange: setColabSearch
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Nenhum colaborador encontrado" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: colabFiltrados.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
								value: c.id,
								onSelect: (value) => {
									setColaboradorId(value);
									setColabOpen(false);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", colaboradorId === c.id ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.nome }), c.empresa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: c.empresa
									})]
								})]
							}, c.id)) })] })] })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tipo de exame" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: tipo,
						onValueChange: setTipo,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "periodico",
								children: "Periódico"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "admissional",
								children: "Admissional"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "demissional",
								children: "Demissional"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "retorno_ao_trabalho",
								children: "Retorno ao trabalho"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "mudanca_riscos",
								children: "Mudança de riscos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "complementar",
								children: "Complementar"
							})
						] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Clínica (opcional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Nome da clínica",
						value: clinica,
						onChange: (e) => setClinica(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email para confirmação" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: emailOpen,
						onOpenChange: setEmailOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								role: "combobox",
								className: "w-full justify-between",
								children: [email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: email
								}) : emailNovo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "truncate text-muted-foreground",
									children: ["Novo: ", emailNovo]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Selecionar ou digitar novo email..."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 opacity-50" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							className: "w-[var(--radix-popover-trigger-width)] p-2 space-y-2",
							children: [
								emailsContato.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-h-36 overflow-y-auto space-y-1",
									children: emailsContato.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setEmail(c.email);
											setEmailNovo("");
											setEmailOpen(false);
										},
										className: cn("w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors", email === c.email && "bg-accent font-medium"),
										children: [c.email, c.nome && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground ml-1",
											children: [
												"(",
												c.nome,
												")"
											]
										})]
									}, c.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "novo@email.com",
										value: emailNovo,
										onChange: (e) => setEmailNovo(e.target.value),
										onKeyDown: (e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddEmail();
											}
										}
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: handleAddEmail,
										disabled: !emailNovo.trim(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Digite um novo email e clique em ✓ para salvá-lo na lista"
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 pt-2",
					children: [
						editingExameId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "w-full text-xs text-muted-foreground",
							onClick: limparForm,
							disabled: agendando,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 mr-1" }), " Cancelar edição"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => handleAgendar(false),
							disabled: agendando || !date || !colaboradorId,
							children: agendando ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
								" ",
								editingExameId ? "Reagendando..." : "Agendando..."
							] }) : editingExameId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4 mr-2" }), " Reagendar"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "h-4 w-4 mr-2" }), " Agendar"] })
						}),
						!editingExameId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "w-full",
							onClick: () => handleAgendar(true),
							disabled: agendando || !date || !colaboradorId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4 mr-2" }), " Agendar e enviar confirmação"]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-2 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm font-medium flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }),
					"Agendamentos por colaborador",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground font-normal ml-1",
						children: [
							"(",
							exames.length,
							" exames)"
						]
					})
				]
			}), loadingExames ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-12 text-center text-sm text-muted-foreground rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mx-auto mb-2 animate-spin" }), "Carregando..."]
			}) : exames.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-12 text-center text-sm text-muted-foreground rounded-lg border border-border bg-card",
				children: "Nenhum exame agendado ainda."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3",
				children: examesPorColaborador.map(({ colaborador, exames: exams }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: colaborador.nome
							}), colaborador.empresa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: colaborador.empresa
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "text-[10px] h-4",
								children: [
									exams.length,
									" ",
									exams.length === 1 ? "exame" : "exames"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: exams.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-md border border-border bg-muted/20 p-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs font-medium",
											children: [ex.tipo.replace(/_/g, " "), ex.clinica && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [" · ", ex.clinica]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-1 mt-1",
											children: [
												ex.data_1_etapa && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "outline",
													className: "text-[10px] h-4 px-1",
													children: ["1ª: ", format(/* @__PURE__ */ new Date(ex.data_1_etapa.slice(0, 10) + "T12:00:00"), "dd/MM")]
												}),
												ex.data_2_etapa && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "outline",
													className: "text-[10px] h-4 px-1",
													children: ["2ª: ", format(/* @__PURE__ */ new Date(ex.data_2_etapa.slice(0, 10) + "T12:00:00"), "dd/MM")]
												}),
												!ex.data_1_etapa && !ex.data_2_etapa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-[10px] h-4 px-1",
													children: ex.data_agendada ? format(/* @__PURE__ */ new Date(ex.data_agendada.slice(0, 10) + "T12:00:00"), "dd/MM") : "—"
												}),
												ex.justificativa_falta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "destructive",
													className: "text-[10px] h-4 px-1",
													children: [
														"Faltou ",
														ex.etapa_faltou,
														"ª etapa"
													]
												})
											]
										}),
										ex.justificativa_falta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] text-destructive mt-0.5 italic",
											children: ex.justificativa_falta
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 shrink-0 ml-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "h-6 w-6 p-0 text-muted-foreground hover:text-primary",
										onClick: () => handleEditExame(ex),
										title: "Reagendar",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "h-6 w-6 p-0 text-muted-foreground hover:text-destructive",
										disabled: cancelarExame.isPending,
										onClick: () => {
											if (window.confirm(`Desmarcar exame de ${colaborador.nome}?`)) cancelarExame.mutate(ex.id);
										},
										title: "Desmarcar",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
									})]
								})]
							}, ex.id))
						})]
					})
				}, colaborador.id))
			})]
		})]
	})] });
}
//#endregion
export { AgendarExames as component };
