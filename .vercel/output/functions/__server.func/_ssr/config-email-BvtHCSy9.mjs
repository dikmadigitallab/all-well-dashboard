import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { t as Input } from "./input-uzm9g8Y7.mjs";
import { t as Label } from "./label-BeT0bXvu.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as FolderOpen, M as CircleCheck, _ as Mail, d as Send, f as Search, j as CircleX, l as Settings, r as User, u as Server, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-C5Nmk_bj.mjs";
import { t as Separator } from "./separator-UwBgvWUO.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/config-email-BvtHCSy9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function ConfigEmailPage() {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [config, setConfig] = (0, import_react.useState)({
		email_address: "",
		imap_host: "imap.gmail.com",
		imap_port: 993,
		smtp_host: "",
		smtp_port: 587,
		search_term: "",
		sender_filter: "",
		folder: "INBOX",
		ativo: true,
		has_password: false
	});
	const [password, setPassword] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [showResults, setShowResults] = (0, import_react.useState)(false);
	const [confirmationStatus, setConfirmationStatus] = (0, import_react.useState)(null);
	const saveLocalCache = (data) => {
		try {
			localStorage.setItem("email_config_cache", JSON.stringify(data));
		} catch {}
	};
	const loadLocalCache = () => {
		try {
			const raw = localStorage.getItem("email_config_cache");
			if (!raw) return null;
			return JSON.parse(raw);
		} catch {
			return null;
		}
	};
	(0, import_react.useEffect)(() => {
		const loadConfig = async () => {
			try {
				const res = await authFetch("/api/email-config");
				if (!res.ok) throw new Error("Erro ao carregar");
				const json = await res.json();
				if (json.data) {
					setConfig({
						...json.data,
						smtp_host: json.data.smtp_host || "",
						smtp_port: json.data.smtp_port || 587
					});
					saveLocalCache(json.data);
				} else {
					const cached = loadLocalCache();
					if (cached) setConfig(cached);
				}
			} catch (err) {
				console.error("[config-email] load error:", err);
				const cached = loadLocalCache();
				if (cached) setConfig(cached);
			} finally {
				setLoading(false);
			}
		};
		loadConfig();
	}, []);
	const handleSave = async () => {
		setSaving(true);
		setConfirmationStatus(null);
		try {
			const payload = {
				...config,
				...password ? { email_password: password } : {}
			};
			const json = await (await authFetch("/api/email-config", {
				method: "PUT",
				body: JSON.stringify(payload)
			})).json();
			if (!json.ok) throw new Error(json.error || "Erro ao salvar");
			setConfig({
				...json.data,
				smtp_host: json.data.smtp_host || "",
				smtp_port: json.data.smtp_port || 587
			});
			saveLocalCache(json.data);
			if (json.confirmation) {
				setConfirmationStatus(json.confirmation);
				if (json.confirmation.sent) toast.success("Configuração salva! Email de confirmação enviado.");
				else if (json.confirmation.error) toast.warning("Configuração salva, mas não foi possível enviar o email de confirmação.");
				else toast.success("Configuração salva com sucesso");
			} else toast.success("Configuração salva com sucesso");
			setPassword("");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erro ao salvar";
			toast.error(msg);
		} finally {
			setSaving(false);
		}
	};
	const handleTest = async () => {
		if (!config.email_address || !password) {
			toast.error("Informe o email e a senha para testar");
			return;
		}
		setTesting(true);
		setShowResults(false);
		try {
			const json = await (await authFetch("/api/email-config/test", {
				method: "POST",
				body: JSON.stringify({
					email: config.email_address,
					password,
					host: config.imap_host,
					port: config.imap_port,
					folder: config.folder,
					search_term: config.search_term || null,
					sender_filter: config.sender_filter || null
				})
			})).json();
			if (!json.ok) throw new Error(json.error || "Falha na conexão");
			setResults(json.emails || []);
			setShowResults(true);
			if (json.emails_count > 0) toast.success(`${json.emails_count} email(ns) encontrado(s) — exibindo ${json.emails.length}`);
			else if (json.debug) {
				const debug = json.debug;
				console.debug("[email-debug]", debug);
				if (debug.unseenUidsCount === 0 && debug.allUidsCount === 0) toast.info("Conexão OK, mas a caixa de entrada parece vazia");
				else if (debug.unseenUidsCount === 0) toast.info(`Conexão OK, mas não há emails não lidos (total na caixa: ${debug.allUidsCount})`);
				else toast.info(`Conexão OK, ${debug.unseenUidsCount} não lidos encontrados, mas nenhum passou nos filtros`);
			} else toast.info("Conexão OK, nenhum email encontrado com os filtros atuais");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erro ao testar";
			toast.error(msg);
			setShowResults(true);
			setResults([]);
		} finally {
			setTesting(false);
		}
	};
	const handleSearch = async () => {
		setSearching(true);
		setShowResults(false);
		try {
			const savePayload = {
				...config,
				...password ? { email_password: password } : {}
			};
			const saveJson = await (await authFetch("/api/email-config", {
				method: "PUT",
				body: JSON.stringify(savePayload)
			})).json();
			if (!saveJson.ok) throw new Error(saveJson.error || "Erro ao salvar antes da busca");
			const json = await (await authFetch("/api/email-config/test", {
				method: "POST",
				body: JSON.stringify({
					email: config.email_address,
					password: password || "usar_salva",
					host: config.imap_host,
					port: config.imap_port,
					folder: config.folder,
					search_term: config.search_term || null,
					sender_filter: config.sender_filter || null
				})
			})).json();
			if (!json.ok) throw new Error(json.error || "Falha na busca");
			setResults(json.emails || []);
			setShowResults(true);
			if (json.emails_count > 0) toast.success(`${json.emails_count} email(ns) encontrado(s)`);
			else toast.info("Nenhum email encontrado com os filtros atuais");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Erro na busca";
			toast.error(msg);
			setShowResults(true);
			setResults([]);
		} finally {
			setSearching(false);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center py-20 text-muted-foreground text-sm",
		children: "Carregando configurações..."
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Configuração de Email",
			description: "Configure a conta de email para busca e envio de mensagens"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2 space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }), " Recebimento (IMAP)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configurações de leitura de emails" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									placeholder: "seu@email.com",
									value: config.email_address,
									onChange: (e) => setConfig({
										...config,
										email_address: e.target.value
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password",
										children: "Senha"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password",
										type: "password",
										placeholder: config.has_password ? "•••••• (deixe vazio para manter)" : "Senha do email",
										value: password,
										onChange: (e) => setPassword(e.target.value)
									}),
									config.has_password && !password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Deixe vazio para manter a senha atual"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "host",
										children: "Servidor IMAP"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "host",
										placeholder: "imap.gmail.com",
										value: config.imap_host,
										onChange: (e) => setConfig({
											...config,
											imap_host: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "port",
										children: "Porta"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "port",
										type: "number",
										placeholder: "993",
										value: config.imap_port,
										onChange: (e) => setConfig({
											...config,
											imap_port: Number(e.target.value) || 993
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "folder",
										children: "Pasta"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "folder",
										placeholder: "INBOX",
										value: config.folder,
										onChange: (e) => setConfig({
											...config,
											folder: e.target.value || "INBOX"
										})
									})]
								})
							]
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), " Envio (SMTP)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configurações para envio de emails. Usa a mesma conta acima." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "smtp_host",
										children: "Servidor SMTP"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "smtp_host",
										placeholder: "smtp.gmail.com",
										value: config.smtp_host,
										onChange: (e) => setConfig({
											...config,
											smtp_host: e.target.value
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Deixe vazio para usar o padrão do provedor"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "smtp_port",
									children: "Porta SMTP"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "smtp_port",
									type: "number",
									placeholder: "587",
									value: config.smtp_port,
									onChange: (e) => setConfig({
										...config,
										smtp_port: Number(e.target.value) || 587
									})
								})]
							})]
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Filtros de Busca"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Defina o que procurar nos emails não lidos" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "search_term",
										children: "Termo de busca"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "search_term",
										placeholder: "Ex: \"ASO\", \"exame médico\", \"agendamento\"...",
										value: config.search_term,
										onChange: (e) => setConfig({
											...config,
											search_term: e.target.value
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "O sistema buscará este termo no assunto e no corpo dos emails"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "sender",
										children: "Remetente (opcional)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "sender",
										placeholder: "Filtrar por remetente: clinica@exemplo.com",
										value: config.sender_filter,
										onChange: (e) => setConfig({
											...config,
											sender_filter: e.target.value
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Se preenchido, apenas emails deste remetente serão considerados"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "ativo",
										children: "Rotina ativa"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Quando ativo, o sistema buscará emails durante o uso"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									id: "ativo",
									checked: config.ativo,
									onCheckedChange: (v) => setConfig({
										...config,
										ativo: v
									})
								})]
							})
						]
					})] })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" }), " Ações"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Salve, teste ou execute a busca" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: handleSave,
								disabled: saving,
								children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), " Salvando..."] }) : "Salvar configuração"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "w-full",
								onClick: handleTest,
								disabled: testing || !config.email_address,
								children: testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), " Testando..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, { className: "h-4 w-4 mr-2" }), " Testar conexão"] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "w-full",
								onClick: handleSearch,
								disabled: searching || !config.email_address,
								children: searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), " Buscando..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 mr-2" }), " Buscar emails agora"] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground text-center pt-2",
								children: "Ao salvar com uma senha válida, o sistema envia um email de confirmação para a conta configurada"
							})
						]
					})] }),
					confirmationStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [confirmationStatus.sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-status-ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-status-danger" }), "Email de Confirmação"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: confirmationStatus.sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-status-ok mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-status-ok",
							children: "Enviado com sucesso!"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-xs mt-1",
							children: "Verifique sua caixa de entrada"
						})] })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-status-danger mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-status-danger",
								children: "Falha ao enviar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground text-xs mt-1",
								children: confirmationStatus.error || "Erro desconhecido"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground text-xs mt-1",
								children: "Verifique as configurações SMTP e tente novamente."
							})
						] })]
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), " Sessão"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "As configurações são salvas no servidor e também armazenadas localmente neste navegador para acesso offline." })] }) })
				]
			})]
		}),
		showResults && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "h-4 w-4" }), " Resultados"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: results.length > 0 ? `${results.length} email(ns) encontrado(s)` : "Nenhum email encontrado" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-8 text-muted-foreground text-sm",
				children: [
					"Nenhum email não lido corresponde aos filtros definidos.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"Verifique se a conexão está funcionando e se existem emails com o termo buscado."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: results.map((email) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-muted/30 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-sm",
							children: email.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground mt-1",
							children: email.from
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground shrink-0",
							children: new Date(email.date).toLocaleDateString("pt-BR", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric"
							})
						})]
					}), email.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-xs text-muted-foreground line-clamp-3",
						children: email.text.slice(0, 300)
					})]
				}, email.id))
			}) })] })
		})
	] });
}
//#endregion
export { ConfigEmailPage as component };
