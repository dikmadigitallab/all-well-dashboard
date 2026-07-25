import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { c as useDroppable, d as CSS, i as PointerSensor, l as useSensor, n as DragOverlay, t as DndContext, u as useSensors } from "../_libs/@dnd-kit/core+[...].mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { t as Textarea } from "./textarea-DjqHhWkA.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Calendar, D as EyeOff, E as Eye, O as Download, S as GripVertical, U as Ban, i as Upload, w as FileText, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as registrarHistorico } from "./historico-BhDclkFM.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { t as Badge } from "./badge-B3f60TId.mjs";
import { n as CardContent, t as Card } from "./card-C5Nmk_bj.mjs";
import { r as formatDate } from "./colaboradores-D6aiYvsj.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-BvYONHWJ.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { n as useSortable, r as verticalListSortingStrategy, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
import { t as restrictToFirstScrollableAncestor } from "../_libs/dnd-kit__modifiers.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kanban-exames-EhWGokIQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
var COLUMNS = [
	{
		id: "a_vencer",
		label: "A vencer",
		color: "text-amber-700 dark:text-amber-400",
		bgColor: "bg-amber-50 dark:bg-amber-950/30",
		borderColor: "border-amber-200 dark:border-amber-800",
		dotColor: "bg-amber-500"
	},
	{
		id: "vencidos",
		label: "Vencidos",
		color: "text-red-700 dark:text-red-400",
		bgColor: "bg-red-50 dark:bg-red-950/30",
		borderColor: "border-red-200 dark:border-red-800",
		dotColor: "bg-red-500"
	},
	{
		id: "a_agendar",
		label: "A agendar",
		color: "text-slate-700 dark:text-slate-400",
		bgColor: "bg-slate-50 dark:bg-slate-950/30",
		borderColor: "border-slate-200 dark:border-slate-800",
		dotColor: "bg-slate-500"
	},
	{
		id: "agendados",
		label: "Agendados",
		color: "text-blue-700 dark:text-blue-400",
		bgColor: "bg-blue-50 dark:bg-blue-950/30",
		borderColor: "border-blue-200 dark:border-blue-800",
		dotColor: "bg-blue-500"
	},
	{
		id: "primeira_etapa",
		label: "1ª etapa",
		color: "text-purple-700 dark:text-purple-400",
		bgColor: "bg-purple-50 dark:bg-purple-950/30",
		borderColor: "border-purple-200 dark:border-purple-800",
		dotColor: "bg-purple-500"
	},
	{
		id: "segunda_etapa",
		label: "2ª etapa",
		color: "text-indigo-700 dark:text-indigo-400",
		bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
		borderColor: "border-indigo-200 dark:border-indigo-800",
		dotColor: "bg-indigo-500"
	},
	{
		id: "pendente",
		label: "Pendente",
		color: "text-orange-700 dark:text-orange-400",
		bgColor: "bg-orange-50 dark:bg-orange-950/30",
		borderColor: "border-orange-200 dark:border-orange-800",
		dotColor: "bg-orange-500"
	},
	{
		id: "liberado",
		label: "Liberado",
		color: "text-green-700 dark:text-green-400",
		bgColor: "bg-green-50 dark:bg-green-950/30",
		borderColor: "border-green-200 dark:border-green-800",
		dotColor: "bg-green-500"
	}
];
function isWithinDays(dateStr, days) {
	if (!dateStr) return false;
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return false;
	const diff = date.getTime() - Date.now();
	return diff >= 0 && diff <= days * 24 * 60 * 60 * 1e3;
}
function todayISO() {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
var STATUS_LABEL = {
	agendado: {
		label: "Agendado",
		variant: "secondary"
	},
	compareceu: {
		label: "1ª etapa",
		variant: "default"
	},
	realizado: {
		label: "2ª etapa",
		variant: "default"
	},
	pendente: {
		label: "Pendente",
		variant: "destructive"
	},
	liberado: {
		label: "Liberado",
		variant: "outline"
	},
	faltou: {
		label: "Faltou",
		variant: "destructive"
	}
};
function getCardDate(colId, item) {
	if ("proximo_exame" in item) return item.proximo_exame;
	if ("data_agendada" in item) {
		const ec = item;
		switch (colId) {
			case "agendados": return ec.data_agendada;
			case "primeira_etapa": return ec.data_1_etapa;
			case "segunda_etapa": return ec.data_2_etapa;
			case "liberado": return ec.data_2_etapa ?? ec.data_1_etapa;
			default: return ec.data_agendada ?? ec.data_1_etapa ?? ec.data_2_etapa ?? null;
		}
	}
	return null;
}
function FaltouDialog({ open, onClose, exameId, colaboradorNome, onConfirm }) {
	const [etapa, setEtapa] = (0, import_react.useState)("1");
	const [justificativa, setJustificativa] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const handleConfirm = async () => {
		if (!justificativa.trim()) {
			toast.error("Informe a justificativa da falta");
			return;
		}
		setSubmitting(true);
		try {
			await onConfirm({
				etapa,
				justificativa: justificativa.trim()
			});
			onClose();
		} catch {} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => {
			if (!v) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Registrar falta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Colaborador: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: colaboradorNome })] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Etapa que faltou" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: etapa,
						onValueChange: setEtapa,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "1",
							children: "1ª etapa"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "2",
							children: "2ª etapa"
						})] })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "justificativa",
						children: ["Justificativa ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-destructive",
							children: "*"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "justificativa",
						placeholder: "Descreva o motivo da falta...",
						value: justificativa,
						onChange: (e) => setJustificativa(e.target.value),
						rows: 3
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				disabled: submitting,
				children: "Cancelar"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "destructive",
				onClick: handleConfirm,
				disabled: submitting || !justificativa.trim(),
				children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), "Salvando..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4 mr-2" }), "Confirmar falta"] })
			})] })
		] })
	});
}
function DraggableCard({ card, columnId, onAction, onFaltou, onUploadAsO, uploading }) {
	const isDraggable = card.type === "exame";
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: `${columnId}::${card.id}`,
		disabled: !isDraggable
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? .4 : 1
		},
		...attributes,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: `shadow-sm hover:shadow-md transition-shadow ${isDragging ? "ring-2 ring-primary" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-3 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-1",
						children: [isDraggable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							...listeners,
							className: "mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0",
							tabIndex: -1,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/colaboradores/$id",
								params: { id: card.colaboradorId },
								className: "text-sm font-medium leading-tight line-clamp-2 hover:text-primary hover:underline transition-colors",
								onClick: (e) => e.stopPropagation(),
								children: card.nome
							})
						})]
					}),
					card.empresa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground truncate pl-5",
						children: card.empresa
					}),
					card.type === "exame" && (() => {
						const ec = card;
						const st = STATUS_LABEL[ec.status];
						if (!st) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pl-5 flex flex-wrap gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: st.variant,
								className: "text-[10px] h-4 px-1.5 font-normal",
								children: st.label
							}), ec.etapa_faltou && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-[10px] h-4 px-1.5 font-normal border-destructive text-destructive",
								children: [
									"Faltou ",
									ec.etapa_faltou,
									"ª etapa"
								]
							})]
						});
					})(),
					(() => {
						const dateLabel = getCardDate(columnId, card);
						return dateLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-xs text-muted-foreground pl-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(dateLabel) })]
						}) : null;
					})(),
					(() => {
						return columnId === "liberado" && card.type === "exame" && card.arquivo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 text-xs text-status-ok pl-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ASO anexado" })]
						}) : null;
					})(),
					(() => {
						const actions = [];
						switch (columnId) {
							case "a_vencer":
							case "vencidos":
							case "a_agendar":
								actions.push({
									label: "Agendar",
									action: "agendar",
									variant: "default"
								});
								break;
							case "agendados":
								actions.push({
									label: "1ª etapa concluída",
									action: "primeira_etapa",
									variant: "default"
								});
								actions.push({
									label: "Faltou",
									action: "faltou",
									variant: "destructive"
								});
								break;
							case "primeira_etapa":
								actions.push({
									label: "2ª etapa concluída",
									action: "segunda_etapa",
									variant: "default"
								});
								actions.push({
									label: "Faltou",
									action: "faltou",
									variant: "destructive"
								});
								break;
							case "segunda_etapa":
								actions.push({
									label: "Liberar",
									action: "liberar",
									variant: "default"
								});
								break;
							case "pendente":
								actions.push({
									label: "Resolver pendência",
									action: "liberar",
									variant: "default"
								});
								break;
						}
						const isLib = columnId === "liberado" && card.type === "exame";
						const podeLiberar = (columnId === "segunda_etapa" || columnId === "pendente") && card.type === "exame";
						const ec = card;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1.5 pt-1 pl-5",
							children: [
								actions.map((act) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: act.variant ?? "default",
									className: "h-7 text-[11px] px-2.5",
									onClick: () => {
										if (act.action === "faltou") onFaltou(card);
										else onAction(act.action, card);
									},
									children: act.label
								}, act.action)),
								isLib && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-[11px] px-2.5",
									disabled: uploading,
									onClick: () => onUploadAsO(ec.exameId, ec.colaboradorId),
									children: [uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3 mr-1" }), "Subir ASO"]
								}), ec.arquivo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-7 text-[11px] px-2.5",
									onClick: () => window.open(ec.arquivo_url, "_blank"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3 mr-1" }), "Ver"]
								})] }),
								podeLiberar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-[11px] px-2.5",
									disabled: uploading,
									onClick: () => onUploadAsO(ec.exameId, ec.colaboradorId),
									children: [uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3 mr-1" }), ec.arquivo_url ? "Trocar ASO" : "Subir ASO"]
								}), ec.arquivo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-7 text-[11px] px-2.5",
									onClick: () => window.open(ec.arquivo_url, "_blank"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3 mr-1" }), "Ver ASO"]
								})] })
							]
						});
					})()
				]
			})
		})
	});
}
function KanbanColumn({ column, cards, onAction, onFaltou, onUploadAsO, uploading, isLoading }) {
	const { setNodeRef: setDroppableRef } = useDroppable({ id: column.id });
	const sortableIds = (0, import_react.useMemo)(() => cards.map((c) => `${column.id}::${c.id}`), [cards, column.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setDroppableRef,
		className: `flex flex-col rounded-lg border ${column.borderColor} ${column.bgColor} min-w-[260px] w-[260px] shrink-0 max-h-full`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 px-3 py-2.5 border-b border-inherit shrink-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2.5 w-2.5 rounded-full shrink-0 ${column.dotColor}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `text-sm font-semibold ${column.color}`,
					children: column.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "ml-auto text-[11px] h-5 px-1.5",
					children: cards.length
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-2 space-y-2",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center py-8 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), "Carregando..."]
				}) : cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-8 text-center text-xs text-muted-foreground",
					children: "Nenhum colaborador"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
					items: sortableIds,
					strategy: verticalListSortingStrategy,
					children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraggableCard, {
						card,
						columnId: column.id,
						onAction,
						onFaltou,
						onUploadAsO,
						uploading
					}, card.id))
				})
			})
		})]
	});
}
function buildDropPayload(toCol, card) {
	const today = todayISO();
	switch (toCol) {
		case "a_agendar": return {
			status: "faltou",
			data_agendada: null
		};
		case "agendados": return {
			status: "agendado",
			data_1_etapa: null,
			data_2_etapa: null,
			justificativa_falta: null,
			etapa_faltou: null
		};
		case "primeira_etapa": return {
			status: "compareceu",
			data_1_etapa: card.data_1_etapa ?? today,
			data_2_etapa: null,
			justificativa_falta: null,
			etapa_faltou: null
		};
		case "segunda_etapa": return {
			status: "realizado",
			data_2_etapa: card.data_2_etapa ?? today,
			justificativa_falta: null,
			etapa_faltou: null
		};
		case "pendente": return { status: "pendente" };
		case "liberado": return { status: "liberado" };
		default: return null;
	}
}
function canLiberate(card) {
	return !!card.arquivo_url;
}
function KanbanExames() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const fileInputRef = (0, import_react.useRef)(null);
	const [faltouDialogOpen, setFaltouDialogOpen] = (0, import_react.useState)(false);
	const [faltouCard, setFaltouCard] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [uploadTarget, setUploadTarget] = (0, import_react.useState)(null);
	const [showLiberado, setShowLiberado] = (0, import_react.useState)(false);
	const [activeDragId, setActiveDragId] = (0, import_react.useState)(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	const { data: colaboradores = [], isLoading: loadingColabs } = useQuery({
		queryKey: ["colaboradores-kanban"],
		queryFn: async () => {
			const res = await authFetch("/api/colaboradores");
			if (!res.ok) throw new Error("Erro ao buscar colaboradores");
			return (await res.json()).data;
		}
	});
	const { data: exames = [], isLoading: loadingExames } = useQuery({
		queryKey: ["exames-kanban"],
		queryFn: async () => {
			const res = await authFetch("/api/exames");
			if (!res.ok) throw new Error("Erro ao buscar exames");
			return (await res.json()).data;
		}
	});
	const isLoading = loadingColabs || loadingExames;
	const updateExame = useMutation({
		mutationFn: async ({ exameId, payload }) => {
			const res = await authFetch(`/api/exames/${exameId}`, {
				method: "PUT",
				body: JSON.stringify(payload)
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao atualizar exame");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
			queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
			queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
		},
		onError: (err) => {
			toast.error(err.message);
		}
	});
	const columns = (0, import_react.useMemo)(() => {
		const ativos = colaboradores.filter((c) => c.ativo);
		const aVencer = ativos.filter((c) => c.status === "a_vencer" && isWithinDays(c.proximo_exame, 60)).map((c) => ({
			type: "colaborador",
			id: `col-${c.id}`,
			colaboradorId: c.id,
			nome: c.nome,
			empresa: c.empresa,
			proximo_exame: c.proximo_exame
		}));
		const vencidos = ativos.filter((c) => c.status === "vencido").map((c) => ({
			type: "colaborador",
			id: `col-${c.id}`,
			colaboradorId: c.id,
			nome: c.nome,
			empresa: c.empresa,
			proximo_exame: c.proximo_exame
		}));
		const aAgendarColabs = ativos.filter((c) => c.status === "sem_exame").map((c) => ({
			type: "colaborador",
			id: `col-${c.id}`,
			colaboradorId: c.id,
			nome: c.nome,
			empresa: c.empresa,
			proximo_exame: c.proximo_exame
		}));
		const aAgendarExames = exames.filter((e) => e.status === "faltou").map((e) => ({
			type: "exame",
			id: `ex-${e.id}`,
			exameId: e.id,
			colaboradorId: e.colaborador_id,
			nome: e.colaborador.nome,
			empresa: e.colaborador.empresa,
			data_agendada: e.data_agendada,
			data_1_etapa: e.data_1_etapa,
			data_2_etapa: e.data_2_etapa,
			status: e.status,
			arquivo_url: e.arquivo_url,
			etapa_faltou: e.etapa_faltou,
			justificativa_falta: e.justificativa_falta
		}));
		const liberado = exames.filter((e) => e.status === "liberado").map((e) => ({
			type: "exame",
			id: `ex-${e.id}`,
			exameId: e.id,
			colaboradorId: e.colaborador_id,
			nome: e.colaborador.nome,
			empresa: e.colaborador.empresa,
			data_agendada: null,
			data_1_etapa: e.data_1_etapa,
			data_2_etapa: e.data_2_etapa,
			status: e.status,
			arquivo_url: e.arquivo_url,
			etapa_faltou: e.etapa_faltou,
			justificativa_falta: e.justificativa_falta
		}));
		const agendados = exames.filter((e) => e.status === "agendado").map((e) => ({
			type: "exame",
			id: `ex-${e.id}`,
			exameId: e.id,
			colaboradorId: e.colaborador_id,
			nome: e.colaborador.nome,
			empresa: e.colaborador.empresa,
			data_agendada: e.data_agendada,
			data_1_etapa: null,
			data_2_etapa: null,
			status: e.status,
			arquivo_url: e.arquivo_url,
			etapa_faltou: e.etapa_faltou,
			justificativa_falta: e.justificativa_falta
		}));
		const primeiraEtapa = exames.filter((e) => e.data_1_etapa && !e.data_2_etapa && e.status !== "liberado" && e.status !== "faltou").map((e) => ({
			type: "exame",
			id: `ex-${e.id}`,
			exameId: e.id,
			colaboradorId: e.colaborador_id,
			nome: e.colaborador.nome,
			empresa: e.colaborador.empresa,
			data_agendada: null,
			data_1_etapa: e.data_1_etapa,
			data_2_etapa: null,
			status: e.status,
			arquivo_url: e.arquivo_url,
			etapa_faltou: e.etapa_faltou,
			justificativa_falta: e.justificativa_falta
		}));
		const segundaEtapa = exames.filter((e) => e.data_2_etapa && e.status !== "liberado" && e.status !== "faltou").map((e) => ({
			type: "exame",
			id: `ex-${e.id}`,
			exameId: e.id,
			colaboradorId: e.colaborador_id,
			nome: e.colaborador.nome,
			empresa: e.colaborador.empresa,
			data_agendada: null,
			data_1_etapa: e.data_1_etapa,
			data_2_etapa: e.data_2_etapa,
			status: e.status,
			arquivo_url: e.arquivo_url,
			etapa_faltou: e.etapa_faltou,
			justificativa_falta: e.justificativa_falta
		}));
		const pendente = exames.filter((e) => e.status === "pendente").map((e) => ({
			type: "exame",
			id: `ex-${e.id}`,
			exameId: e.id,
			colaboradorId: e.colaborador_id,
			nome: e.colaborador.nome,
			empresa: e.colaborador.empresa,
			data_agendada: null,
			data_1_etapa: e.data_1_etapa,
			data_2_etapa: e.data_2_etapa,
			status: e.status,
			arquivo_url: e.arquivo_url,
			etapa_faltou: e.etapa_faltou,
			justificativa_falta: e.justificativa_falta
		}));
		return {
			a_vencer: aVencer,
			vencidos,
			a_agendar: [...aAgendarColabs, ...aAgendarExames],
			agendados,
			primeira_etapa: primeiraEtapa,
			segunda_etapa: segundaEtapa,
			pendente,
			liberado
		};
	}, [colaboradores, exames]);
	const activeCard = (0, import_react.useMemo)(() => {
		if (!activeDragId) return null;
		const [colId, ...rest] = activeDragId.split("::");
		const cardId = rest.join("::");
		return columns[colId]?.find((c) => c.id === cardId) ?? null;
	}, [activeDragId, columns]);
	const handleUploadAsO = (exameId, colaboradorId) => {
		setUploadTarget({
			exameId,
			colaboradorId
		});
		fileInputRef.current?.click();
	};
	const handleFileSelected = async (e) => {
		const file = e.target.files?.[0];
		if (!file || !uploadTarget) return;
		const ext = file.name.split(".").pop()?.toLowerCase();
		if (!ext || ![
			"pdf",
			"png",
			"jpg",
			"jpeg"
		].includes(ext)) {
			toast.error("Formato inválido. Use PDF, PNG ou JPG.");
			return;
		}
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("colaborador_id", uploadTarget.colaboradorId);
			formData.append("exame_id", uploadTarget.exameId);
			const res = await authFetch("/api/asos/upload", {
				method: "POST",
				body: formData
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Erro ao fazer upload");
			}
			toast.success("ASO enviado com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
			registrarHistorico({
				colaboradorId: uploadTarget.colaboradorId,
				exameId: uploadTarget.exameId,
				evento: "aso_anexado",
				descricao: "ASO anexado ao exame",
				detalhes: { nome_arquivo: file.name }
			});
		} catch (err) {
			toast.error("Erro ao subir ASO", { description: err instanceof Error ? err.message : "Erro desconhecido" });
		} finally {
			setUploading(false);
			setUploadTarget(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const handleAction = (action, card) => {
		switch (action) {
			case "agendar":
				navigate({ to: "/agendar-exames" });
				break;
			case "primeira_etapa": {
				if (card.type !== "exame") return;
				const ec1 = card;
				updateExame.mutate({
					exameId: card.exameId,
					payload: {
						status: "compareceu",
						data_1_etapa: todayISO()
					}
				}, { onSuccess: () => {
					toast.success("1ª etapa concluída com sucesso!");
					registrarHistorico({
						colaboradorId: ec1.colaboradorId,
						exameId: ec1.exameId,
						evento: "compareceu_1",
						descricao: "Compareceu à 1ª etapa do exame",
						detalhes: { data: todayISO() }
					});
				} });
				break;
			}
			case "segunda_etapa": {
				if (card.type !== "exame") return;
				const ec2 = card;
				updateExame.mutate({
					exameId: card.exameId,
					payload: {
						status: "realizado",
						data_2_etapa: todayISO()
					}
				}, { onSuccess: () => {
					toast.success("2ª etapa concluída com sucesso!");
					registrarHistorico({
						colaboradorId: ec2.colaboradorId,
						exameId: ec2.exameId,
						evento: "compareceu_2",
						descricao: "Compareceu à 2ª etapa do exame",
						detalhes: { data: todayISO() }
					});
				} });
				break;
			}
			case "liberar": {
				if (card.type !== "exame") return;
				const exameCard = card;
				if (!canLiberate(exameCard)) {
					toast.error("Faça upload do ASO antes de liberar o exame");
					return;
				}
				updateExame.mutate({
					exameId: card.exameId,
					payload: { status: "liberado" }
				}, { onSuccess: () => {
					toast.success("Exame liberado com sucesso!");
					registrarHistorico({
						colaboradorId: exameCard.colaboradorId,
						exameId: exameCard.exameId,
						evento: "liberado",
						descricao: "Exame liberado"
					});
				} });
				break;
			}
		}
	};
	const handleFaltou = (card) => {
		setFaltouCard(card);
		setFaltouDialogOpen(true);
	};
	const handleConfirmFaltou = async (payload) => {
		if (!faltouCard) return;
		const etapaNum = parseInt(payload.etapa, 10);
		const card = faltouCard;
		const faltouPayload = {
			status: "faltou",
			data_agendada: null,
			justificativa_falta: payload.justificativa,
			etapa_faltou: etapaNum
		};
		if (etapaNum === 1) {
			faltouPayload.data_1_etapa = null;
			faltouPayload.data_2_etapa = null;
		} else faltouPayload.data_2_etapa = null;
		await updateExame.mutateAsync({
			exameId: card.exameId,
			payload: faltouPayload
		}, { onSuccess: () => {
			toast.success("Falta registrada! Exame disponível para reagendamento.");
			setFaltouCard(null);
			registrarHistorico({
				colaboradorId: card.colaboradorId,
				exameId: card.exameId,
				evento: "faltou",
				descricao: `Faltou à ${etapaNum}ª etapa do exame`,
				detalhes: {
					etapa: etapaNum,
					justificativa: payload.justificativa
				}
			});
		} });
	};
	const handleDragStart = (event) => {
		setActiveDragId(event.active.id);
	};
	const handleDragEnd = (event) => {
		setActiveDragId(null);
		const { active, over } = event;
		if (!over) return;
		const fromId = active.id;
		const toId = over.id;
		const [fromCol, ...restFrom] = fromId.split("::");
		const cardId = restFrom.join("::");
		const toParts = toId.split("::");
		const toCol = toParts.length === 1 ? toParts[0] : toParts[0];
		if (fromCol === toCol) return;
		const card = columns[fromCol]?.find((c) => c.id === cardId);
		if (!card || card.type !== "exame") return;
		const exameCard = card;
		const payload = buildDropPayload(toCol, exameCard);
		if (!payload) {
			toast.error(`Não é possível mover para "${toCol}"`);
			return;
		}
		if (toCol === "liberado" && !canLiberate(exameCard)) {
			toast.error("Faça upload do ASO antes de mover para Liberado");
			return;
		}
		updateExame.mutate({
			exameId: exameCard.exameId,
			payload
		}, { onSuccess: () => {
			const colLabel = COLUMNS.find((c) => c.id === toCol)?.label ?? toCol;
			toast.success(`${exameCard.nome} movido para "${colLabel}"`);
			const evento = {
				agendados: "agendado",
				primeira_etapa: "compareceu_1",
				segunda_etapa: "compareceu_2",
				pendente: "pendente",
				liberado: "liberado"
			}[toCol] || "movido";
			registrarHistorico({
				colaboradorId: exameCard.colaboradorId,
				exameId: exameCard.exameId,
				evento,
				descricao: {
					agendados: "Exame reagendado",
					primeira_etapa: "Compareceu à 1ª etapa",
					segunda_etapa: "Compareceu à 2ª etapa",
					pendente: "Exame pendente",
					liberado: "Exame liberado"
				}[toCol] || `Movido para ${colLabel}`
			});
		} });
	};
	const totalCards = Object.values(columns).reduce((acc, arr) => acc + arr.length, 0);
	const visibleColumns = (0, import_react.useMemo)(() => COLUMNS.filter((col) => col.id !== "liberado" || showLiberado), [showLiberado]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Kanban de Exames",
			description: `${totalCards} cards no board`,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => setShowLiberado((v) => !v),
				children: [
					showLiberado ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4 mr-1.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 mr-1.5" }),
					showLiberado ? "Ocultar liberados" : "Mostrar liberados",
					!showLiberado && (columns.liberado?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "ml-1.5 text-[10px] h-4 px-1",
						children: columns.liberado.length
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-[calc(100vh-220px)] overflow-x-auto pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
				sensors,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
				modifiers: [restrictToFirstScrollableAncestor],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-4 h-full",
					style: { minWidth: "max-content" },
					children: visibleColumns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
						column: col,
						cards: columns[col.id] ?? [],
						onAction: handleAction,
						onFaltou: handleFaltou,
						onUploadAsO: handleUploadAsO,
						uploading,
						isLoading
					}, col.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, { children: activeCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "shadow-xl ring-2 ring-primary/50 rotate-2 w-[256px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: activeCard.nome
						}), activeCard.empresa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground truncate mt-1",
							children: activeCard.empresa
						})]
					})
				}) : null })]
			})
		}),
		faltouCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaltouDialog, {
			open: faltouDialogOpen,
			onClose: () => {
				setFaltouDialogOpen(false);
				setFaltouCard(null);
			},
			exameId: faltouCard.exameId,
			colaboradorNome: faltouCard.nome,
			onConfirm: handleConfirmFaltou
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileInputRef,
			type: "file",
			accept: ".pdf,.png,.jpg,.jpeg",
			className: "hidden",
			onChange: handleFileSelected
		})
	] });
}
//#endregion
export { KanbanExames as component };
