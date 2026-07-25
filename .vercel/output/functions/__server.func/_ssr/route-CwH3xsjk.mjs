import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./use-auth-LCVRQC72.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { _ as Navigate, f as Outlet, g as Link, l as useLocation, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as Eye, H as Bell, L as ChevronDown, V as CalendarPlus, _ as Mail, b as LayoutDashboard, c as ShieldCheck, i as Upload, k as Columns3, n as Users, v as LogOut, w as FileText } from "../_libs/lucide-react.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-CtDpYC8D.mjs";
import { t as Badge } from "./badge-B3f60TId.mjs";
import { t as Separator } from "./separator-UwBgvWUO.mjs";
import { r as formatDate } from "./colaboradores-D6aiYvsj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-CwH3xsjk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BATCH_SIZE = 30;
function ItemLink({ item, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/colaboradores/$id",
		params: { id: item.id },
		className: "flex items-start gap-3 px-4 py-2 hover:bg-muted/50 transition-colors no-underline",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium text-foreground truncate",
				children: item.nome
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground truncate",
				children: [
					item.empresa ?? "—",
					" · ",
					formatDate(item.proximo_exame)
				]
			})]
		}), children]
	});
}
function NotificationBell() {
	const { data, isLoading } = useQuery({
		queryKey: ["notificacoes"],
		queryFn: async () => {
			const res = await authFetch("/api/notificacoes");
			if (!res.ok) throw new Error("Erro ao buscar notificações");
			return (await res.json()).data;
		},
		refetchInterval: 6e4
	});
	const total = data?.total ?? 0;
	const aVencer = data?.a_vencer ?? [];
	const vencidos = data?.vencidos ?? [];
	const temAlerta = total > 0;
	const [limAVencer, setLimAVencer] = (0, import_react.useState)(BATCH_SIZE);
	const [limVencidos, setLimVencidos] = (0, import_react.useState)(BATCH_SIZE);
	const aVencerVisiveis = aVencer.slice(0, limAVencer);
	const vencidosVisiveis = vencidos.slice(0, limVencidos);
	const restanteAVencer = aVencer.length - limAVencer;
	const restanteVencidos = vencidos.length - limVencidos;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "icon",
			className: "relative text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			"aria-label": "Notificações",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" }), temAlerta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "destructive",
				className: "absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold leading-none",
				children: total > 99 ? "99+" : total
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		side: "bottom",
		sideOffset: 8,
		className: "w-80 p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 py-3 text-sm font-medium border-b border-border",
			children: ["Notificações", !isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground font-normal ml-1",
				children: [
					"(",
					total,
					" pendente",
					total !== 1 ? "s" : "",
					")"
				]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 py-8 text-center text-xs text-muted-foreground",
			children: "Carregando..."
		}) : total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 py-8 text-center text-xs text-muted-foreground",
			children: "Nenhuma pendência no momento"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-y-auto max-h-[60vh]",
			children: [
				vencidos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pt-3 pb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-semibold text-status-danger uppercase tracking-wide",
						children: [
							"Vencidos (",
							vencidos.length,
							")"
						]
					})
				}),
				vencidosVisiveis.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemLink, {
					item,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-xs font-medium text-status-danger",
						children: "Vencido"
					})
				}, item.id)),
				restanteVencidos > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setLimVencidos((prev) => Math.min(prev + BATCH_SIZE, vencidos.length)),
						className: "text-xs text-muted-foreground hover:text-foreground gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3 w-3" }),
							"Ver mais ",
							Math.min(restanteVencidos, BATCH_SIZE),
							" de ",
							restanteVencidos
						]
					})
				}),
				aVencer.length > 0 && vencidos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-1" }),
				aVencer.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pt-3 pb-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-semibold text-status-warn uppercase tracking-wide",
						children: [
							"Vencendo em 60 dias (",
							aVencer.length,
							")"
						]
					})
				}),
				aVencerVisiveis.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemLink, {
					item,
					children: item.dias_para_vencer != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-xs font-medium text-status-warn",
						children: [item.dias_para_vencer, "d"]
					})
				}, item.id)),
				restanteAVencer > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setLimAVencer((prev) => Math.min(prev + BATCH_SIZE, aVencer.length)),
						className: "text-xs text-muted-foreground hover:text-foreground gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3 w-3" }),
							"Ver mais ",
							Math.min(restanteAVencer, BATCH_SIZE),
							" de ",
							restanteAVencer
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2" })
			]
		})]
	})] });
}
var nav = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/colaboradores",
		label: "Colaboradores",
		icon: Users
	},
	{
		to: "/kanban-exames",
		label: "Kanban Exames",
		icon: Columns3,
		adminOnly: true
	},
	{
		to: "/agendar-exames",
		label: "Agendar exames",
		icon: CalendarPlus,
		adminOnly: true
	},
	{
		to: "/importar",
		label: "Importar planilha",
		icon: Upload,
		adminOnly: true
	},
	{
		to: "/gerar-formularios",
		label: "Gerar formulários",
		icon: FileText,
		adminOnly: true
	},
	{
		to: "/config-email",
		label: "Config. Email",
		icon: Mail
	}
];
function AppShell({ children }) {
	const { user, isAdmin, signOut } = useAuth();
	const navigate = useNavigate();
	const loc = useLocation();
	const handleSignOut = async () => {
		await signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 py-5 border-b border-sidebar-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-semibold",
								children: "A"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold leading-tight",
									children: "Controle de ASOs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-sidebar-foreground/70",
									children: "Gestão de Saúde Ocupacional"
								})]
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex-1 px-3 py-4 space-y-1",
					children: nav.map((item) => {
						if (item.adminOnly && !isAdmin) return null;
						const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + "/");
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
						}, item.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 border-t border-sidebar-border space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 py-2 rounded-md bg-sidebar-accent/40 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium truncate",
							children: user?.fullName ?? user?.username ?? "Usuário"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex items-center gap-1 text-sidebar-foreground/80",
							children: isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Admin / SESMT"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " Gestor (leitura)"] })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: handleSignOut,
						className: "w-full justify-start text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 mr-2" }), " Sair"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex-1 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-end gap-2 px-8 pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {})
			}), children]
		})]
	});
}
function Layout() {
	const { user, loading } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center text-sm text-muted-foreground",
		children: "Carregando..."
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/auth" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { Layout as component };
