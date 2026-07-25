import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./use-auth-LCVRQC72.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { _ as Navigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { H as Bell, T as FileSpreadsheet, c as ShieldCheck, z as ChartColumn } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CA4QZDvu.js
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-6xl mx-auto px-6 py-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold",
						children: "A"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold",
						children: "Controle de ASOs"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Entrar"
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-w-6xl mx-auto px-6 py-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), " Saúde ocupacional em um só lugar"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-5xl font-semibold tracking-tight leading-tight",
						children: "Gestão completa dos Atestados de Saúde Ocupacional"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-lg text-muted-foreground max-w-2xl",
						children: "Centralize colaboradores, acompanhe vencimentos, controle exames e visualize indicadores em tempo real. Reduza retrabalho e mantenha sua operação em conformidade."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: "Acessar plataforma"
							})
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-20 grid gap-6 md:grid-cols-3",
				children: [
					{
						icon: ChartColumn,
						title: "Dashboard gerencial",
						desc: "KPIs em tempo real: em dia, a vencer, vencido, por empresa, unidade e setor."
					},
					{
						icon: FileSpreadsheet,
						title: "Importação da base",
						desc: "Suba sua planilha e mantenha todos os colaboradores atualizados em segundos."
					},
					{
						icon: Bell,
						title: "Alertas automáticos",
						desc: "Notificações no painel e por e-mail de ASOs próximos do vencimento."
					}
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 rounded-lg border border-border bg-card shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-6 w-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 font-semibold",
							children: f.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: f.desc
						})
					]
				}, f.title))
			})]
		})]
	});
}
//#endregion
export { Landing as component };
