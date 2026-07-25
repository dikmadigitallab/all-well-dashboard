import { o as __toESM } from "./_runtime.mjs";
import { t as authFetch } from "./_ssr/custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { L as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, l as Trigger2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./_ssr/use-auth-LCVRQC72.mjs";
import { n as PageHeader, t as PageContainer } from "./_ssr/page-header-s_STzGKq.mjs";
import { n as buttonVariants, r as cn, t as Button } from "./_ssr/button-PwNqyxv_.mjs";
import { t as Input } from "./_ssr/input-uzm9g8Y7.mjs";
import { t as Label } from "./_ssr/label-BeT0bXvu.mjs";
import { t as Textarea } from "./_ssr/textarea-DjqHhWkA.mjs";
import { g as Link, v as useNavigate, y as useParams } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { A as Clock, B as Calendar, K as ArrowLeft, M as CircleCheck, O as Download, U as Ban, a as TriangleAlert, j as CircleX, o as Trash2, p as Save, w as FileText, x as History, y as LoaderCircle } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-C2Gf_Mkm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AlertDialog = Root2;
var AlertDialogTrigger = Trigger2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var EMPTY = {
	nome: "",
	empresa: null,
	area: null,
	setor: null,
	funcao: null,
	matricula_sap: null,
	cpf: null,
	rg: null,
	pis: null,
	nascimento: null,
	escala_turno: null,
	ghe: null,
	periodicidade_meses: 12,
	ultimo_exame: null,
	proximo_exame: null,
	observacoes: null
};
function EditColab() {
	const { id } = useParams({ from: "/_authenticated/colaboradores/$id" });
	const navigate = useNavigate();
	const { isAdmin } = useAuth();
	const isNew = id === "novo";
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { data, isLoading } = useQuery({
		queryKey: ["colab", id],
		queryFn: async () => {
			if (isNew) return null;
			const res = await authFetch(`/api/colaboradores/${id}`);
			if (!res.ok) throw new Error("Erro ao buscar colaborador");
			return (await res.json()).data;
		},
		enabled: !isNew
	});
	const { data: asos = [], isLoading: loadingAsos } = useQuery({
		queryKey: ["asos", id],
		queryFn: async () => {
			if (isNew) return [];
			const res = await authFetch(`/api/asos/listar?colaborador_id=${id}`);
			if (!res.ok) return [];
			return (await res.json()).data ?? [];
		},
		enabled: !isNew
	});
	const { data: historico = [], isLoading: loadingHistorico } = useQuery({
		queryKey: ["historico", id],
		queryFn: async () => {
			if (isNew) return [];
			const res = await authFetch(`/api/exames/historico?colaborador_id=${id}`);
			if (!res.ok) return [];
			return (await res.json()).data ?? [];
		},
		enabled: !isNew
	});
	(0, import_react.useEffect)(() => {
		if (!data) return;
		setForm({
			...data,
			ultimo_exame: data.ultimo_exame?.slice(0, 10) ?? null,
			proximo_exame: data.proximo_exame?.slice(0, 10) ?? null,
			nascimento: data.nascimento?.slice(0, 10) ?? null
		});
	}, [data]);
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const save = async (e) => {
		e.preventDefault();
		if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
		setBusy(true);
		try {
			if (isNew) {
				const res = await authFetch("/api/colaboradores", {
					method: "POST",
					body: JSON.stringify(form)
				});
				if (!res.ok) throw new Error((await res.json()).error);
				const json = await res.json();
				toast.success("Colaborador criado");
				navigate({
					to: "/colaboradores/$id",
					params: { id: json.data.id }
				});
			} else {
				const { id: _drop, created_at: _c, updated_at: _u, created_by: _cb, dias_para_vencer: _d, status: _s, exames: _e, alertas: _a, ...upd } = form;
				const res = await authFetch(`/api/colaboradores/${id}`, {
					method: "PUT",
					body: JSON.stringify(upd)
				});
				if (!res.ok) throw new Error((await res.json()).error);
				toast.success("Alterações salvas");
			}
		} catch (err) {
			toast.error("Erro ao salvar", { description: err instanceof Error ? err.message : "Erro desconhecido" });
		} finally {
			setBusy(false);
		}
	};
	const remove = async () => {
		try {
			const res = await authFetch(`/api/colaboradores/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error((await res.json()).error);
			toast.success("Colaborador removido");
			navigate({ to: "/colaboradores" });
		} catch (err) {
			toast.error("Erro ao remover", { description: err instanceof Error ? err.message : "Erro desconhecido" });
		}
	};
	if (!isNew && isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Carregando..."
	}) });
	const readOnly = !isAdmin;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: isNew ? "Novo colaborador" : form.nome || "Colaborador",
			description: isNew ? "Preencha os dados do colaborador" : "Detalhes e edição do cadastro",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/colaboradores",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Voltar"]
					})
				}),
				!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => gerarASO(form),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), "Gerar ASO (PDF)"]
				}),
				!isNew && isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-2" }), "Remover"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Remover colaborador?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Esta ação é permanente e removerá também o histórico de exames." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancelar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: remove,
					children: "Remover"
				})] })] })] })
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "rounded-lg border border-border bg-card p-6 shadow-panel",
			children: [
				readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 rounded-md bg-muted p-3 text-xs text-muted-foreground",
					children: "Você está em modo somente leitura (perfil Gestor)."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					disabled: readOnly || busy,
					className: "grid grid-cols-1 md:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nome completo *",
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								value: form.nome ?? "",
								onChange: (e) => set("nome", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Matrícula SAP",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.matricula_sap ?? "",
								onChange: (e) => set("matricula_sap", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Empresa",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.empresa ?? "",
								onChange: (e) => set("empresa", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Área",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.area ?? "",
								onChange: (e) => set("area", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Setor",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.setor ?? "",
								onChange: (e) => set("setor", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Função",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.funcao ?? "",
								onChange: (e) => set("funcao", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Escala / Turno",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.escala_turno ?? "",
								onChange: (e) => set("escala_turno", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "CPF",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.cpf ?? "",
								onChange: (e) => set("cpf", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "RG",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.rg ?? "",
								onChange: (e) => set("rg", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "PIS",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.pis ?? "",
								onChange: (e) => set("pis", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Data de nascimento",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.nascimento ?? "",
								onChange: (e) => set("nascimento", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "GHE",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.ghe ?? "",
								onChange: (e) => set("ghe", e.target.value || null)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Periodicidade (meses)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								value: form.periodicidade_meses ?? 12,
								onChange: (e) => {
									const meses = Number(e.target.value) || 12;
									set("periodicidade_meses", meses);
									if (form.ultimo_exame) {
										const d = new Date(form.ultimo_exame);
										d.setMonth(d.getMonth() + meses);
										set("proximo_exame", d.toISOString().slice(0, 10));
									}
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Último exame",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.ultimo_exame ?? "",
								onChange: (e) => {
									const val = e.target.value || null;
									set("ultimo_exame", val);
									if (val && form.periodicidade_meses) {
										const d = new Date(val);
										d.setMonth(d.getMonth() + form.periodicidade_meses);
										set("proximo_exame", d.toISOString().slice(0, 10));
									} else set("proximo_exame", null);
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Próximo exame",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								readOnly: true,
								value: form.proximo_exame ?? "",
								className: "cursor-default opacity-80"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Observações",
							className: "md:col-span-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: form.observacoes ?? "",
								onChange: (e) => set("observacoes", e.target.value || null)
							})
						})
					]
				}),
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-2" }), isNew ? "Criar colaborador" : "Salvar alterações"]
					})
				})
			]
		}),
		!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-lg border border-border bg-card p-6 shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm font-medium mb-4 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), "ASOs do colaborador"]
			}), loadingAsos ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Carregando..."]
			}) : asos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Nenhum ASO encontrado no storage."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: asos.map((aso, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-md border border-border bg-muted/20 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium truncate",
							children: aso.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: new Date(aso.createdAt).toLocaleString("pt-BR")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "ml-3 shrink-0",
						onClick: () => window.open(aso.url, "_blank"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), "Baixar"]
					})]
				}, aso.name))
			})]
		}),
		!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-lg border border-border bg-card p-6 shadow-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm font-medium mb-4 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-4 w-4" }), "Histórico de eventos"]
			}), loadingHistorico ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Carregando..."]
			}) : historico.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: "Nenhum evento registrado ainda."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: historico.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3 rounded-md border border-border bg-muted/10 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventoIcon, { evento: entry.evento })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventoLabel, { evento: entry.evento })
								}), entry.exame && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded",
									children: entry.exame.tipo.replace(/_/g, " ")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm mt-0.5",
								children: entry.descricao
							}),
							entry.detalhes?.justificativa && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground mt-0.5 italic",
								children: ["Justificativa: ", entry.detalhes.justificativa]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: new Date(entry.created_at).toLocaleString("pt-BR")
							})
						]
					})]
				}, entry.id))
			})]
		})
	] });
}
function Field({ label, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs text-muted-foreground mb-1.5 block",
			children: label
		}), children]
	});
}
function EventoIcon({ evento }) {
	const size = "h-3.5 w-3.5";
	switch (evento) {
		case "agendado": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: `${size} text-blue-500` });
		case "compareceu_1": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `${size} text-purple-500` });
		case "compareceu_2": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `${size} text-indigo-500` });
		case "faltou": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: `${size} text-red-500` });
		case "cancelado": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: `${size} text-slate-400` });
		case "liberado": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `${size} text-green-500` });
		case "aso_anexado": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: `${size} text-amber-500` });
		case "pendente": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `${size} text-orange-500` });
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: `${size} text-muted-foreground` });
	}
}
function EventoLabel({ evento }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: {
		agendado: "Agendado",
		compareceu_1: "1ª etapa",
		compareceu_2: "2ª etapa",
		faltou: "Faltou",
		cancelado: "Cancelado",
		liberado: "Liberado",
		aso_anexado: "ASO anexado",
		pendente: "Pendente"
	}[evento] ?? evento });
}
//#endregion
export { EditColab as component };
