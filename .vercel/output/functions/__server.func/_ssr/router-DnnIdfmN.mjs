import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as AuthProvider } from "./use-auth-LCVRQC72.mjs";
import { b as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as require_imap_flow } from "../_libs/imapflow+[...].mjs";
import { t as require_nodemailer } from "../_libs/nodemailer.mjs";
import { n as jwtVerify, t as SignJWT } from "../_libs/jose.mjs";
import { t as bcryptjs_default } from "../_libs/bcryptjs.mjs";
import { t as require_lib } from "../_libs/jszip+[...].mjs";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "fs";
import path, { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DnnIdfmN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_nodemailer = /* @__PURE__ */ __toESM(require_nodemailer());
var import_lib = /* @__PURE__ */ __toESM(require_lib());
var import_imap_flow = require_imap_flow();
/**
* Criptografia AES-256-GCM para senhas de email.
* Usa uma chave derivada do AUTH_JWT_SECRET via HKDF (SHA-256).
* Server-side apenas.
*/
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 16;
var SALT = "email-crypto-v1";
function deriveKey() {
	const secret = process.env.AUTH_JWT_SECRET;
	if (!secret) throw new Error("AUTH_JWT_SECRET não definido (necessário para criptografia)");
	return createHash("sha256").update(SALT).update(secret).digest();
}
/**
* Criptografa um texto plano (senha) e retorna uma string base64
* no formato: iv:authTag:ciphertext (tudo em base64)
*/
function encryptPassword(plaintext) {
	const key = deriveKey();
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	let encrypted = cipher.update(plaintext, "utf8", "base64");
	encrypted += cipher.final("base64");
	const authTag = cipher.getAuthTag().toString("base64");
	return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}
/**
* Descriptografa uma string no formato iv:authTag:ciphertext
* e retorna o texto plano original.
*/
function decryptPassword(encryptedData) {
	const key = deriveKey();
	const parts = encryptedData.split(":");
	if (parts.length !== 3) throw new Error("Formato de dados criptografados inválido");
	const iv = Buffer.from(parts[0], "base64");
	const authTag = Buffer.from(parts[1], "base64");
	const encrypted = parts[2];
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);
	let decrypted = decipher.update(encrypted, "base64", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}
/**
* Serviço de envio de emails via SMTP.
* Server-side apenas.
*/
/**
* Cria um transporter nodemailer a partir da config SMTP.
*/
function createTransporter(config) {
	return import_nodemailer.default.createTransport({
		host: config.host,
		port: config.port,
		secure: config.port === 465,
		auth: {
			user: config.user,
			pass: config.password
		},
		connectionTimeout: 1e4
	});
}
/**
* Envia um email de confirmação de que a plataforma foi configurada.
* Retorna { success: true } ou { success: false, error: "..." }.
*/
async function sendConfirmationEmail(config) {
	try {
		const password = decryptPassword(config.email_password_enc);
		const transporter = createTransporter({
			host: config.smtp_host || config.imap_host.replace("imap", "smtp"),
			port: config.smtp_port || 587,
			user: config.email_address,
			password
		});
		await transporter.verify();
		await transporter.sendMail({
			from: `"All-Well ASO" <${config.email_address}>`,
			to: config.email_address,
			subject: "✅ Plataforma ASO configurada com sucesso",
			text: `Olá!

Sua conta de email foi configurada com sucesso na plataforma All-Well ASO.

A partir de agora, o sistema poderá buscar emails não lidos na sua caixa de entrada
e executar as rotinas configuradas.

Qualquer dúvida, consulte o administrador do sistema.

Atenciosamente,
Equipe All-Well`,
			html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
    .check { color: #059669; font-size: 24px; }
    .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Configuração realizada com sucesso!</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Sua conta de email foi configurada com sucesso na <strong>plataforma All-Well ASO</strong>.</p>
      <p>A partir de agora, o sistema poderá buscar emails não lidos na sua caixa de entrada
      e executar as rotinas configuradas.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 14px; color: #64748b;">
        Qualquer dúvida, consulte o administrador do sistema.
      </p>
    </div>
    <div class="footer">
      Equipe All-Well &bull; Gestão de Saúde Ocupacional
    </div>
  </div>
</body>
</html>`
		});
		return { success: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar email";
		console.error("[email-smtp] sendConfirmationEmail error:", message);
		return {
			success: false,
			error: message
		};
	}
}
/**
* Envia um email genérico.
*/
async function sendEmail(smtpConfig, to, subject, text, html) {
	try {
		const info = await createTransporter(smtpConfig).sendMail({
			from: `"All-Well ASO" <${smtpConfig.user}>`,
			to,
			subject,
			text,
			html
		});
		console.log("[email-smtp] sendMail info:", {
			messageId: info.messageId,
			accepted: info.accepted,
			rejected: info.rejected,
			response: info.response?.substring(0, 200)
		});
		return { success: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar email";
		console.error("[email-smtp] sendEmail error:", message);
		return {
			success: false,
			error: message
		};
	}
}
var styles_default = "/assets/styles-KerS34eu.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$30 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Controle de ASOs — Gestão de Saúde Ocupacional" },
			{
				name: "description",
				content: "Plataforma para gestão de Atestados de Saúde Ocupacional, controle de exames, comparecimento, pendências e indicadores em tempo real."
			},
			{
				property: "og:title",
				content: "Controle de ASOs — Gestão de Saúde Ocupacional"
			},
			{
				property: "og:description",
				content: "Plataforma para gestão de Atestados de Saúde Ocupacional, controle de exames, comparecimento, pendências e indicadores em tempo real."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "Controle de ASOs — Gestão de Saúde Ocupacional"
			},
			{
				name: "twitter:description",
				content: "Plataforma para gestão de Atestados de Saúde Ocupacional, controle de exames, comparecimento, pendências e indicadores em tempo real."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ab4454fb-b6d4-40bd-a972-13543e3dd353/id-preview-51f05d0d--f59ac927-1f05-4247-a6e1-b06e6d4c0379.lovable.app-1784951229587.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ab4454fb-b6d4-40bd-a972-13543e3dd353/id-preview-51f05d0d--f59ac927-1f05-4247-a6e1-b06e6d4c0379.lovable.app-1784951229587.png"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$30.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			richColors: true,
			position: "top-right"
		})] })
	});
}
var $$splitComponentImporter$13 = () => import("./auth-CO4gYV7N.mjs");
var Route$29 = createFileRoute("/auth")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./route-CwH3xsjk.mjs");
var Route$28 = createFileRoute("/_authenticated")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./routes-CA4QZDvu.mjs");
var Route$27 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
/**
* Prisma Client para uso server-side.
* Sem singleton global para evitar cache obsoleto em hot-reload.
*/
var _prisma = null;
function createPrisma() {
	try {
		return new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
	} catch (err) {
		console.error("[prisma.server] Erro ao criar PrismaClient:", err);
		throw err;
	}
}
/**
* Retorna a instância do Prisma Client, criando sob demanda.
* Em ambiente serverless/Nitro, cada request ou worker terá sua própria instância.
*/
function getPrisma() {
	if (!_prisma) _prisma = createPrisma();
	return _prisma;
}
var prisma = new Proxy({}, { get(_target, prop, receiver) {
	return Reflect.get(getPrisma(), prop, receiver);
} });
var BCRYPT_ROUNDS = 10;
function getJwtSecret() {
	const secret = process.env.AUTH_JWT_SECRET;
	if (!secret) throw new Error("AUTH_JWT_SECRET não definido");
	return new TextEncoder().encode(secret);
}
async function hashPassword(password) {
	return bcryptjs_default.hash(password, BCRYPT_ROUNDS);
}
async function verifyPassword(password, hash) {
	return bcryptjs_default.compare(password, hash);
}
async function createToken(user) {
	return new SignJWT({
		sub: user.id,
		username: user.username,
		fullName: user.fullName ?? "",
		role: user.role
	}).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(getJwtSecret());
}
async function verifyToken(token) {
	const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
	return {
		sub: payload.sub,
		username: payload.username,
		fullName: payload.fullName,
		role: payload.role
	};
}
/**
* Extrai o token Bearer do header Authorization e retorna o payload decodificado.
* Lança Response com status 401 se ausente ou inválido.
*/
async function requireAuth(request) {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader) throw new Response(JSON.stringify({
		ok: false,
		error: "Token não fornecido"
	}), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	if (!authHeader.startsWith("Bearer ")) throw new Response(JSON.stringify({
		ok: false,
		error: "Formato inválido. Use Bearer token"
	}), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	const token = authHeader.slice(7).trim();
	if (!token) throw new Response(JSON.stringify({
		ok: false,
		error: "Token vazio"
	}), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		return await verifyToken(token);
	} catch {
		throw new Response(JSON.stringify({
			ok: false,
			error: "Token inválido ou expirado"
		}), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
	}
}
/**
* Middleware que exige role específica (ex.: "admin").
*/
async function requireRole(request, role) {
	const payload = await requireAuth(request);
	if (payload.role !== role) throw new Response(JSON.stringify({
		ok: false,
		error: `Acesso negado. Role "${role}" necessária.`
	}), {
		status: 403,
		headers: { "Content-Type": "application/json" }
	});
	return payload;
}
var Route$26 = createFileRoute("/api/setup")({ server: { handlers: { POST: async ({ request }) => {
	try {
		if (await prisma.user.count() > 0) return Response.json({
			ok: false,
			error: "Setup já foi realizado. Delete os usuários existentes para refazer."
		}, { status: 400 });
		const body = await request.json();
		const username = body.username || "admin";
		const password = body.password || "admin123";
		const fullName = body.fullName || "Administrador";
		if (!username || username.length < 3) return Response.json({
			ok: false,
			error: "Username deve ter no mínimo 3 caracteres"
		}, { status: 400 });
		if (!password || password.length < 4) return Response.json({
			ok: false,
			error: "Senha deve ter no mínimo 4 caracteres"
		}, { status: 400 });
		if (await prisma.user.findUnique({ where: { username } })) return Response.json({
			ok: false,
			error: `Usuário "${username}" já existe`
		}, { status: 400 });
		const password_hash = await hashPassword(password);
		const user = await prisma.user.create({ data: {
			username,
			password_hash,
			full_name: fullName,
			role: "admin",
			ativo: true
		} });
		console.log(`[setup] Admin criado: ${user.username}`);
		return Response.json({
			ok: true,
			message: "Admin criado com sucesso",
			user: {
				id: user.id,
				username: user.username,
				fullName: user.full_name,
				role: user.role
			}
		}, { status: 201 });
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[setup]", err);
		return Response.json({
			ok: false,
			error: "Erro interno do servidor"
		}, { status: 500 });
	}
} } } });
var Route$25 = createFileRoute("/api/notificacoes")({ server: { handlers: { GET: async ({ request }) => {
	try {
		await requireAuth(request);
		const now = /* @__PURE__ */ new Date();
		now.setHours(0, 0, 0, 0);
		const daqui60 = new Date(now);
		daqui60.setDate(daqui60.getDate() + 60);
		const colaboradores = await prisma.colaborador.findMany({
			where: {
				proximo_exame: { not: null },
				ativo: true
			},
			select: {
				id: true,
				nome: true,
				empresa: true,
				proximo_exame: true,
				status: true,
				dias_para_vencer: true
			}
		});
		const a_vencer = [];
		const vencidos = [];
		for (const c of colaboradores) {
			if (!c.proximo_exame) continue;
			const exame = new Date(c.proximo_exame);
			exame.setHours(0, 0, 0, 0);
			const item = {
				id: c.id,
				nome: c.nome,
				empresa: c.empresa,
				proximo_exame: c.proximo_exame.toISOString(),
				status: c.status,
				dias_para_vencer: c.dias_para_vencer
			};
			if (exame < now) vencidos.push(item);
			else if (exame >= now && exame <= daqui60) a_vencer.push(item);
		}
		a_vencer.sort((a, b) => (a.dias_para_vencer ?? 999) - (b.dias_para_vencer ?? 999));
		vencidos.sort((a, b) => {
			if (!a.proximo_exame || !b.proximo_exame) return 0;
			return new Date(a.proximo_exame).getTime() - new Date(b.proximo_exame).getTime();
		});
		return Response.json({
			ok: true,
			data: {
				total: a_vencer.length + vencidos.length,
				a_vencer,
				vencidos,
				totais: {
					a_vencer: a_vencer.length,
					vencidos: vencidos.length
				}
			}
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[api/notificacoes] GET:", err);
		return Response.json({
			ok: false,
			error: "Erro ao buscar notificações"
		}, { status: 500 });
	}
} } } });
var Route$24 = createFileRoute("/api/login")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const { username, password } = await request.json().catch(() => ({})) || {};
		if (!username || !password) return Response.json({
			ok: false,
			error: "username e password obrigatórios"
		}, { status: 400 });
		const user = await prisma.user.findUnique({
			where: { username: String(username) },
			select: {
				id: true,
				username: true,
				password_hash: true,
				full_name: true,
				role: true,
				ativo: true
			}
		});
		if (!user || !user.ativo) return Response.json({
			ok: false,
			error: "Usuário ou senha inválidos"
		}, { status: 401 });
		if (!await verifyPassword(String(password), user.password_hash)) return Response.json({
			ok: false,
			error: "Usuário ou senha inválidos"
		}, { status: 401 });
		const token = await createToken({
			id: user.id,
			username: user.username,
			fullName: user.full_name,
			role: user.role
		});
		return Response.json({
			ok: true,
			token,
			user: {
				id: user.id,
				username: user.username,
				fullName: user.full_name,
				role: user.role
			}
		});
	} catch (err) {
		console.error("[login]", err);
		const msg = err instanceof Error ? err.message : String(err);
		return Response.json({
			ok: false,
			error: `Erro interno: ${msg}`
		}, { status: 500 });
	}
} } } });
var FIELD_MAP = [
	{
		label: "Nome do empregado:",
		key: "nome"
	},
	{
		label: "Nome:",
		key: "nome"
	},
	{
		label: "CPF:",
		key: "cpf"
	},
	{
		label: "RG:",
		key: "rg"
	},
	{
		label: "Matrícula SAP:",
		key: "matricula_sap"
	},
	{
		label: "PIS:",
		key: "pis"
	},
	{
		label: "GHE:",
		key: "ghe"
	},
	{
		label: "Ocupação:",
		key: "funcao"
	},
	{
		label: "Data de Nascimento:",
		key: "nascimento"
	}
];
function formatCPF(v) {
	if (!v) return "";
	return String(v).replace(/\D/g, "").padStart(11, "0").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function formatDateBR(v) {
	if (!v) return "";
	if (typeof v === "string") {
		const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (m) return `${m[3]}/${m[2]}/${m[1]}`;
	}
	return String(v);
}
function escXml(str) {
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function fillDocx(templatePath, row) {
	const templateBuf = await fs.readFile(templatePath);
	const zip = await import_lib.default.loadAsync(templateBuf);
	let xml = await zip.file("word/document.xml").async("string");
	for (const field of FIELD_MAP) {
		const rawValue = row[field.key];
		if (!rawValue) continue;
		let value;
		if (field.key === "cpf") value = formatCPF(rawValue);
		else if (field.key === "nascimento") value = formatDateBR(rawValue);
		else value = String(rawValue).trim();
		if (!value) continue;
		const escaped = escXml(value);
		const label = field.label;
		const re = new RegExp(`(<w:t[^>]*>)${escapeRegex(label)}\\s*<\\/w:t>`, "g");
		xml = xml.replace(re, `$1${label} ${escaped}</w:t>`);
	}
	zip.file("word/document.xml", xml);
	return await zip.generateAsync({ type: "uint8array" });
}
var Route$23 = createFileRoute("/api/gerar-formularios-colaboradores")({ server: { handlers: { POST: async ({ request }) => {
	try {
		await requireAuth(request);
		const ids = (await request.json()).colaborador_ids;
		if (!ids || !Array.isArray(ids) || ids.length === 0) return Response.json({
			ok: false,
			error: "Nenhum colaborador selecionado"
		}, { status: 400 });
		const colaboradores = await prisma.colaborador.findMany({ where: {
			id: { in: ids },
			ativo: true
		} });
		if (colaboradores.length === 0) return Response.json({
			ok: false,
			error: "Nenhum colaborador encontrado"
		}, { status: 404 });
		const templatePath = path.join(process.cwd(), "public", "formulario 2.docx");
		const outZip = new import_lib.default();
		let success = 0;
		let errors = 0;
		for (const colab of colaboradores) try {
			const nomeArquivo = `${colab.nome.replace(/[\\/:*?"<>|]/g, "_")}_form2_${(colab.cpf || "scpf").replace(/\D/g, "")}.docx`;
			const docxBuf = await fillDocx(templatePath, {
				nome: colab.nome,
				cpf: colab.cpf,
				rg: colab.rg,
				matricula_sap: colab.matricula_sap,
				pis: colab.pis,
				ghe: colab.ghe,
				funcao: colab.funcao,
				nascimento: colab.nascimento ? colab.nascimento.toISOString().slice(0, 10) : null
			});
			outZip.file(nomeArquivo, docxBuf);
			success++;
		} catch (err) {
			errors++;
			console.error(`[gerar-formularios] Erro ao processar ${colab.nome}:`, err);
		}
		const zipBuf = await outZip.generateAsync({ type: "uint8array" });
		return new Response(zipBuf, {
			status: 200,
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="formularios_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.zip"`
			}
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[api/gerar-formularios-colaboradores] POST:", err);
		return Response.json({
			ok: false,
			error: "Erro ao gerar formulários"
		}, { status: 500 });
	}
} } } });
var Route$22 = createFileRoute("/api/emails-contato")({ server: { handlers: {
	GET: async ({ request }) => {
		try {
			const user = await requireAuth(request);
			const prisma = getPrisma();
			const modelKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(prisma)).filter((k) => k !== "constructor" && !k.startsWith("_") && k !== "then");
			console.log("[api/emails-contato] models:", modelKeys);
			console.log("[api/emails-contato] emailContato?", "emailContato" in prisma, typeof prisma.emailContato);
			const emails = await prisma.emailContato.findMany({
				where: { created_by: user.sub },
				orderBy: { created_at: "desc" },
				select: {
					id: true,
					email: true,
					nome: true,
					created_at: true
				}
			});
			return Response.json({
				ok: true,
				data: emails
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/emails-contato] GET:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar emails"
			}, { status: 500 });
		}
	},
	POST: async ({ request }) => {
		try {
			const user = await requireAuth(request);
			const prisma = getPrisma();
			const body = await request.json();
			if (!body.email) return Response.json({
				ok: false,
				error: "email é obrigatório"
			}, { status: 400 });
			const emailLimpo = body.email.toLowerCase().trim();
			const existente = await prisma.emailContato.findFirst({ where: {
				email: emailLimpo,
				created_by: user.sub
			} });
			if (existente) return Response.json({
				ok: true,
				data: existente
			});
			const contato = await prisma.emailContato.create({ data: {
				email: emailLimpo,
				nome: body.nome ?? null,
				created_by: user.sub
			} });
			return Response.json({
				ok: true,
				data: contato
			}, { status: 201 });
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/emails-contato] POST:", err);
			return Response.json({
				ok: false,
				error: "Erro ao salvar email"
			}, { status: 500 });
		}
	}
} } });
var Route$21 = createFileRoute("/api/email-config")({ server: { handlers: {
	GET: async ({ request }) => {
		try {
			const user = await requireAuth(request);
			const config = await prisma.emailConfig.findFirst({ where: { user_id: user.sub } });
			if (!config) return Response.json({
				ok: true,
				data: null
			});
			return Response.json({
				ok: true,
				data: {
					id: config.id,
					email_address: config.email_address,
					imap_host: config.imap_host,
					imap_port: config.imap_port,
					smtp_host: config.smtp_host,
					smtp_port: config.smtp_port,
					search_term: config.search_term,
					sender_filter: config.sender_filter,
					folder: config.folder,
					ativo: config.ativo,
					created_at: config.created_at,
					updated_at: config.updated_at,
					has_password: !!config.email_password_enc
				}
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/email-config] GET:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar configuração"
			}, { status: 500 });
		}
	},
	PUT: async ({ request }) => {
		try {
			const user = await requireAuth(request);
			const body = await request.json();
			if (!body.email_address || !body.imap_host) return Response.json({
				ok: false,
				error: "email_address e imap_host são obrigatórios"
			}, { status: 400 });
			const data = {
				email_address: body.email_address,
				imap_host: body.imap_host,
				imap_port: body.imap_port ?? 993,
				smtp_host: body.smtp_host || null,
				smtp_port: body.smtp_port ?? 587,
				search_term: body.search_term ?? null,
				sender_filter: body.sender_filter ?? null,
				folder: body.folder ?? "INBOX",
				ativo: body.ativo !== void 0 ? body.ativo : true
			};
			let passwordProvided = false;
			if (body.email_password) {
				data.email_password_enc = encryptPassword(body.email_password);
				passwordProvided = true;
			}
			const existing = await prisma.emailConfig.findFirst({ where: { user_id: user.sub } });
			let config;
			if (existing) config = await prisma.emailConfig.update({
				where: { id: existing.id },
				data
			});
			else {
				config = await prisma.emailConfig.create({ data: {
					user_id: user.sub,
					...data
				} });
				passwordProvided = true;
			}
			let confirmationSent = false;
			let confirmationError = null;
			if (passwordProvided && config.email_password_enc) {
				const result = await sendConfirmationEmail({
					email_address: config.email_address,
					email_password_enc: config.email_password_enc,
					smtp_host: config.smtp_host,
					smtp_port: config.smtp_port,
					imap_host: config.imap_host
				});
				confirmationSent = result.success;
				if (!result.success) confirmationError = result.error || null;
			}
			return Response.json({
				ok: true,
				data: {
					id: config.id,
					email_address: config.email_address,
					imap_host: config.imap_host,
					imap_port: config.imap_port,
					smtp_host: config.smtp_host,
					smtp_port: config.smtp_port,
					search_term: config.search_term,
					sender_filter: config.sender_filter,
					folder: config.folder,
					ativo: config.ativo,
					has_password: !!config.email_password_enc
				},
				confirmation: {
					sent: confirmationSent,
					error: confirmationError
				}
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/email-config] PUT:", err);
			return Response.json({
				ok: false,
				error: "Erro ao salvar configuração"
			}, { status: 500 });
		}
	}
} } });
function parseDate$1(v) {
	if (!v || v === "") return null;
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
}
var Route$20 = createFileRoute("/api/colaboradores")({ server: { handlers: {
	GET: async ({ request }) => {
		try {
			await requireAuth(request);
			const colaboradores = await prisma.colaborador.findMany({
				orderBy: { nome: "asc" },
				take: 5e3
			});
			return Response.json({
				ok: true,
				data: colaboradores
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/colaboradores] GET:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar colaboradores"
			}, { status: 500 });
		}
	},
	POST: async ({ request }) => {
		try {
			const user = await requireAuth(request);
			const body = await request.json();
			const data = (item) => ({
				nome: item.nome,
				empresa: item.empresa ?? null,
				area: item.area ?? null,
				setor: item.setor ?? null,
				funcao: item.funcao ?? null,
				matricula_sap: item.matricula_sap ?? null,
				cpf: item.cpf ?? null,
				rg: item.rg ?? null,
				pis: item.pis ?? null,
				nascimento: parseDate$1(item.nascimento),
				escala_turno: item.escala_turno ?? null,
				ghe: item.ghe ?? null,
				periodicidade_meses: item.periodicidade_meses ?? 12,
				ultimo_exame: parseDate$1(item.ultimo_exame),
				proximo_exame: parseDate$1(item.proximo_exame),
				status: item.status ?? "sem_exame",
				observacoes: item.observacoes ?? null,
				ativo: item.ativo !== void 0 ? item.ativo : true,
				created_by: user.sub
			});
			if (Array.isArray(body)) {
				const created = await prisma.$transaction(body.map((item) => prisma.colaborador.create({ data: data(item) })));
				return Response.json({
					ok: true,
					data: created
				}, { status: 201 });
			}
			const created = await prisma.colaborador.create({ data: data(body) });
			return Response.json({
				ok: true,
				data: created
			}, { status: 201 });
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/colaboradores] POST:", err);
			return Response.json({
				ok: false,
				error: "Erro ao criar colaborador"
			}, { status: 500 });
		}
	}
} } });
var Route$19 = createFileRoute("/api/apply-migrations")({ server: { handlers: { POST: async ({ request }) => {
	try {
		await requireRole(request, "admin");
		const { Pool } = await import("../_libs/pg.mjs").then((n) => n.t);
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: { rejectUnauthorized: false },
			max: 1,
			connectionTimeoutMillis: 15e3
		});
		try {
			const c = await pool.connect();
			const v = await c.query("SELECT version()");
			c.release();
			console.log(`[migrate] Conectado: ${v.rows[0].version.split(",")[0]}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`[migrate] Falha conexão: ${msg}`);
			return Response.json({
				ok: false,
				error: msg
			}, { status: 500 });
		}
		const dir = resolve(".", "supabase/migrations");
		if (!existsSync(dir)) {
			console.error(`[migrate] Diretório não encontrado: ${dir}`);
			return Response.json({
				ok: false,
				error: "Migrations dir not found"
			}, { status: 500 });
		}
		const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
		const results = [];
		for (const file of files) {
			const sql = readFileSync(resolve(dir, file), "utf-8").trim();
			if (!sql) {
				results.push({
					file,
					status: "empty"
				});
				continue;
			}
			try {
				await pool.query(sql);
				results.push({
					file,
					status: "ok"
				});
				console.log(`[migrate] ✅ ${file}`);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				if (msg.includes("already exists")) {
					results.push({
						file,
						status: "exists"
					});
					console.log(`[migrate] ⚠️  ${file} — já existe`);
				} else {
					results.push({
						file,
						status: "error",
						error: msg
					});
					console.error(`[migrate] ❌ ${file}: ${msg}`);
				}
			}
		}
		await pool.end();
		return Response.json({
			ok: true,
			results
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[apply-migrations]", err);
		return Response.json({
			ok: false,
			error: "Erro interno"
		}, { status: 500 });
	}
} } } });
var $$splitComponentImporter$10 = () => import("./relatorios-DXNlfqvA.mjs");
var Route$18 = createFileRoute("/_authenticated/relatorios")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./pendencias-CDMdn94X.mjs");
var Route$17 = createFileRoute("/_authenticated/pendencias")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./kanban-exames-EhWGokIQ.mjs");
var Route$16 = createFileRoute("/_authenticated/kanban-exames")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./importar-Bub4b0_I.mjs");
var Route$15 = createFileRoute("/_authenticated/importar")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./gerar-formularios-BxlvD-bh.mjs");
var Route$14 = createFileRoute("/_authenticated/gerar-formularios")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./exames-D12X7J3U.mjs");
var Route$13 = createFileRoute("/_authenticated/exames")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./dashboard-DmceRK7d.mjs");
var Route$12 = createFileRoute("/_authenticated/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./config-email-BvtHCSy9.mjs");
var Route$11 = createFileRoute("/_authenticated/config-email")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./agendar-exames-CzZr62jI.mjs");
var Route$10 = createFileRoute("/_authenticated/agendar-exames")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var Route$9 = createFileRoute("/api/exames/")({ server: { handlers: {
	GET: async ({ request }) => {
		try {
			await requireAuth(request);
			const statusFilter = new URL(request.url).searchParams.get("status");
			const where = statusFilter ? { status: statusFilter } : {};
			const exames = await prisma.exame.findMany({
				where,
				orderBy: { data_agendada: "asc" },
				include: { colaborador: { select: {
					id: true,
					nome: true,
					empresa: true,
					cpf: true
				} } }
			});
			return Response.json({
				ok: true,
				data: exames
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/exames] GET:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar exames"
			}, { status: 500 });
		}
	},
	POST: async ({ request }) => {
		try {
			const user = await requireAuth(request);
			const body = await request.json();
			if (!body.colaborador_id || !body.data_agendada) return Response.json({
				ok: false,
				error: "colaborador_id e data_agendada são obrigatórios"
			}, { status: 400 });
			const exame = await prisma.exame.create({
				data: {
					colaborador_id: body.colaborador_id,
					tipo: body.tipo ?? "periodico",
					data_agendada: new Date(body.data_agendada),
					data_1_etapa: body.data_1_etapa ? new Date(body.data_1_etapa) : null,
					data_2_etapa: body.data_2_etapa ? new Date(body.data_2_etapa) : null,
					status: "agendado",
					clinica: body.clinica ?? null,
					created_by: user.sub
				},
				include: { colaborador: { select: {
					id: true,
					nome: true,
					empresa: true
				} } }
			});
			return Response.json({
				ok: true,
				data: exame
			}, { status: 201 });
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/exames] POST:", err);
			return Response.json({
				ok: false,
				error: "Erro ao criar exame"
			}, { status: 500 });
		}
	}
} } });
var $$splitComponentImporter$1 = () => import("./colaboradores-CvVHHVqx.mjs");
var Route$8 = createFileRoute("/_authenticated/colaboradores/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var Route$7 = createFileRoute("/api/exames/historico")({ server: { handlers: {
	GET: async ({ request }) => {
		try {
			await requireAuth(request);
			const colaboradorId = new URL(request.url).searchParams.get("colaborador_id");
			const where = {};
			if (colaboradorId) where.colaborador_id = colaboradorId;
			const historico = await prisma.exameHistorico.findMany({
				where,
				orderBy: { created_at: "desc" },
				take: 200,
				include: { exame: { select: {
					id: true,
					tipo: true,
					status: true,
					data_agendada: true
				} } }
			});
			return Response.json({
				ok: true,
				data: historico
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/exames/historico] GET:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar histórico"
			}, { status: 500 });
		}
	},
	POST: async ({ request }) => {
		try {
			await requireAuth(request);
			const body = await request.json();
			if (!body.colaborador_id || !body.evento || !body.descricao) return Response.json({
				ok: false,
				error: "colaborador_id, evento e descricao são obrigatórios"
			}, { status: 400 });
			const registro = await prisma.exameHistorico.create({ data: {
				colaborador_id: body.colaborador_id,
				exame_id: body.exame_id || null,
				evento: body.evento,
				descricao: body.descricao,
				detalhes: body.detalhes || void 0
			} });
			return Response.json({
				ok: true,
				data: registro
			}, { status: 201 });
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/exames/historico] POST:", err);
			return Response.json({
				ok: false,
				error: "Erro ao registrar histórico"
			}, { status: 500 });
		}
	}
} } });
var Route$6 = createFileRoute("/api/exames/enviar-confirmacao")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const user = await requireAuth(request);
		const body = await request.json();
		if (!body.exame_id || !body.email) return Response.json({
			ok: false,
			error: "exame_id e email são obrigatórios"
		}, { status: 400 });
		const exame = await prisma.exame.findUnique({
			where: { id: body.exame_id },
			include: { colaborador: { select: {
				nome: true,
				empresa: true
			} } }
		});
		if (!exame) return Response.json({
			ok: false,
			error: "Exame não encontrado"
		}, { status: 404 });
		const emailConfig = await prisma.emailConfig.findFirst({ where: { user_id: user.sub } });
		if (!emailConfig?.email_password_enc) return Response.json({
			ok: false,
			error: "Configure o email nas Configurações de Email primeiro"
		}, { status: 400 });
		console.log("[enviar-confirmacao] emailConfig:", {
			email_address: emailConfig.email_address,
			smtp_host: emailConfig.smtp_host,
			imap_host: emailConfig.imap_host,
			smtp_port: emailConfig.smtp_port,
			has_password: !!emailConfig.email_password_enc
		});
		const password = decryptPassword(emailConfig.email_password_enc);
		const smtpHost = emailConfig.smtp_host || emailConfig.imap_host.replace("imap", "smtp");
		console.log("[enviar-confirmacao] SMTP config para envio:", {
			host: smtpHost,
			port: emailConfig.smtp_port ?? 587,
			user: emailConfig.email_address,
			pass_len: password?.length ?? 0
		});
		const { createTransporter } = await import("./email-smtp-BwWETvwS.mjs");
		const testTransporter = createTransporter({
			host: smtpHost,
			port: emailConfig.smtp_port ?? 587,
			user: emailConfig.email_address,
			password
		});
		try {
			await testTransporter.verify();
			console.log("[enviar-confirmacao] SMTP verify OK");
		} catch (verifyErr) {
			const msg = verifyErr instanceof Error ? verifyErr.message : "Erro na verificação SMTP";
			console.error("[enviar-confirmacao] SMTP verify FAILED:", msg);
			return Response.json({
				ok: false,
				sent: false,
				error: `Falha na conexão SMTP: ${msg}`
			}, { status: 502 });
		}
		const dataFormatada = exame.data_agendada ? new Date(exame.data_agendada).toLocaleDateString("pt-BR") : "a definir";
		const result = await sendEmail({
			host: smtpHost,
			port: emailConfig.smtp_port ?? 587,
			user: emailConfig.email_address,
			password
		}, body.email, `Confirmação de Exame ASO - ${exame.colaborador.nome}`, `Olá!

Exame ASO agendado com sucesso!

Colaborador: ${exame.colaborador.nome}
Empresa: ${exame.colaborador.empresa ?? "—"}
Data agendada: ${dataFormatada}
Tipo: ${exame.tipo}

Atenciosamente,
Equipe All-Well`, `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
    .info { background: #f8fafc; border-radius: 6px; padding: 16px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .label { color: #64748b; font-size: 13px; }
    .value { font-weight: 600; font-size: 13px; }
    .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Exame ASO Agendado</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Um exame ASO foi agendado com sucesso. Confira os detalhes:</p>
      <div class="info">
        <div class="info-row">
          <span class="label">Colaborador</span>
          <span class="value">${exame.colaborador.nome}</span>
        </div>
        <div class="info-row">
          <span class="label">Empresa</span>
          <span class="value">${exame.colaborador.empresa ?? "—"}</span>
        </div>
        <div class="info-row">
          <span class="label">Data</span>
          <span class="value">${dataFormatada}</span>
        </div>
        <div class="info-row">
          <span class="label">Tipo</span>
          <span class="value">${exame.tipo}</span>
        </div>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 14px; color: #64748b;">
        Qualquer dúvida, consulte o administrador do sistema.
      </p>
    </div>
    <div class="footer">
      Equipe All-Well &bull; Gestão de Saúde Ocupacional
    </div>
  </div>
</body>
</html>`);
		return Response.json({
			ok: result.success,
			sent: result.success,
			error: result.error || null
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[api/exames/enviar-confirmacao] POST:", err);
		return Response.json({
			ok: false,
			error: "Erro ao enviar confirmação"
		}, { status: 500 });
	}
} } } });
var Route$5 = createFileRoute("/api/exames/$id")({ server: { handlers: {
	GET: async ({ request, params }) => {
		try {
			await requireAuth(request);
			const exame = await prisma.exame.findUnique({
				where: { id: params.id },
				include: { colaborador: { select: {
					id: true,
					nome: true,
					empresa: true
				} } }
			});
			if (!exame) return Response.json({
				ok: false,
				error: "Exame não encontrado"
			}, { status: 404 });
			return Response.json({
				ok: true,
				data: exame
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/exames] GET /:id:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar exame"
			}, { status: 500 });
		}
	},
	PUT: async ({ request, params }) => {
		try {
			await requireAuth(request);
			const body = await request.json();
			const updateData = {};
			if (body.status !== void 0) updateData.status = body.status;
			if (body.data_agendada !== void 0) updateData.data_agendada = body.data_agendada ? new Date(body.data_agendada) : null;
			if (body.data_1_etapa !== void 0) updateData.data_1_etapa = body.data_1_etapa ? new Date(body.data_1_etapa) : null;
			if (body.data_2_etapa !== void 0) updateData.data_2_etapa = body.data_2_etapa ? new Date(body.data_2_etapa) : null;
			if (body.data_realizado !== void 0) updateData.data_realizado = body.data_realizado ? new Date(body.data_realizado) : null;
			if (body.justificativa_falta !== void 0) updateData.justificativa_falta = body.justificativa_falta;
			if (body.etapa_faltou !== void 0) updateData.etapa_faltou = body.etapa_faltou;
			if (body.clinica !== void 0) updateData.clinica = body.clinica;
			if (body.motivo_pendencia !== void 0) updateData.motivo_pendencia = body.motivo_pendencia;
			if (body.justificativa !== void 0) updateData.justificativa = body.justificativa;
			if (body.arquivo_url !== void 0) updateData.arquivo_url = body.arquivo_url;
			const updated = await prisma.exame.update({
				where: { id: params.id },
				data: updateData,
				include: { colaborador: { select: {
					id: true,
					nome: true,
					empresa: true
				} } }
			});
			return Response.json({
				ok: true,
				data: updated
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/exames] PUT /:id:", err);
			return Response.json({
				ok: false,
				error: "Erro ao atualizar exame"
			}, { status: 500 });
		}
	}
} } });
/**
* Serviço de busca de emails via IMAP.
* Server-side apenas.
*/
/**
* Conecta ao servidor IMAP, busca emails não lidos que correspondem
* aos filtros (termo e/ou remetente) e retorna os resultados.
*/
async function searchEmails(params) {
	const client = new import_imap_flow.ImapFlow({
		host: params.host,
		port: params.port,
		secure: params.port === 993,
		auth: {
			user: params.email,
			pass: params.password
		},
		logger: false,
		connectionTimeout: 2e4
	});
	const debug = {};
	try {
		await client.connect();
		debug.connected = true;
		const mailboxName = params.folder || "INBOX";
		const lock = await client.getMailboxLock(mailboxName);
		debug.mailbox = mailboxName;
		try {
			const unseenQuery = { seen: false };
			debug.unseenQuery = unseenQuery;
			const unseenUids = await client.search(unseenQuery) || [];
			debug.unseenUidsCount = unseenUids.length;
			debug.unseenUids = unseenUids.slice(0, 20);
			if (unseenUids.length === 0) {
				debug.allUidsCount = (await client.search({ all: true }) || []).length;
				return {
					success: true,
					emails: [],
					debug
				};
			}
			let targetUids = unseenUids;
			if (params.searchTerm || params.senderFilter) {
				const filterQuery = ["UNSEEN"];
				if (params.searchTerm) {
					const term = params.searchTerm.replace(/"/g, "\\\"");
					filterQuery.push(`(OR SUBJECT "${term}" BODY "${term}")`);
				}
				if (params.senderFilter) {
					const sender = params.senderFilter.replace(/"/g, "\\\"");
					filterQuery.push(`FROM "${sender}"`);
				}
				const filterStr = filterQuery.join(" ");
				debug.filterString = filterStr;
				try {
					const filteredUids = await client.search(filterStr) || [];
					debug.filteredUidsCount = filteredUids.length;
					debug.filteredUids = filteredUids.slice(0, 20);
					targetUids = filteredUids;
				} catch (searchErr) {
					debug.filterSearchError = String(searchErr);
					targetUids = unseenUids;
				}
			}
			if (targetUids.length === 0) return {
				success: true,
				emails: [],
				debug
			};
			const results = [];
			for await (const msg of client.fetch({ uid: targetUids }, {
				uid: true,
				envelope: true,
				source: true,
				bodyStructure: true,
				labels: true
			})) {
				let textContent = "";
				let htmlContent = null;
				if (msg.source) {
					const raw = msg.source.toString();
					const headerEnd = raw.indexOf("\n\n");
					const body = headerEnd >= 0 ? raw.slice(headerEnd + 2) : raw;
					textContent = body.replace(/<[^>]+>/g, "").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
					if (/<html|<HTML|<div|<p|<br/i.test(body)) htmlContent = body.trim();
				}
				const fromAddr = msg.envelope?.from?.[0];
				const from = fromAddr ? `${fromAddr.name || ""} <${fromAddr.address || ""}>`.trim() : "desconhecido";
				const subject = msg.envelope?.subject || "(sem assunto)";
				if (params.searchTerm) {
					const term = params.searchTerm.toLowerCase();
					if (!(subject.toLowerCase().includes(term) || textContent.toLowerCase().includes(term))) continue;
				}
				if (params.senderFilter) {
					const filter = params.senderFilter.toLowerCase();
					if (!from.toLowerCase().includes(filter)) continue;
				}
				results.push({
					id: msg.uid,
					subject,
					from,
					date: msg.envelope?.date?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
					text: textContent.slice(0, 5e3),
					html: htmlContent?.slice(0, 1e4) ?? null
				});
			}
			debug.resultsCount = results.length;
			return {
				success: true,
				emails: results,
				debug
			};
		} finally {
			lock.release();
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : "Erro desconhecido ao conectar IMAP";
		console.error("[email-service] search error:", message);
		return {
			success: false,
			emails: [],
			error: message,
			debug
		};
	} finally {
		try {
			await client.logout();
		} catch {}
	}
}
var Route$4 = createFileRoute("/api/email-config/test")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const user = await requireAuth(request);
		const body = await request.json();
		if (!body.email || !body.host) return Response.json({
			ok: false,
			error: "email e host são obrigatórios"
		}, { status: 400 });
		let password = body.password;
		if (password === "usar_salva") {
			const config = await prisma.emailConfig.findFirst({ where: { user_id: user.sub } });
			if (!config?.email_password_enc) return Response.json({
				ok: false,
				error: "Nenhuma senha salva. Digite a senha para buscar."
			}, { status: 400 });
			password = decryptPassword(config.email_password_enc);
		}
		if (!password) return Response.json({
			ok: false,
			error: "Senha é obrigatória"
		}, { status: 400 });
		const result = await searchEmails({
			host: body.host,
			port: body.port ?? 993,
			email: body.email,
			password,
			folder: body.folder ?? "INBOX",
			searchTerm: body.search_term || null,
			senderFilter: body.sender_filter || null
		});
		return Response.json({
			ok: result.success,
			emails_count: result.emails.length,
			emails: result.emails.slice(0, 5),
			error: result.error || null,
			debug: result.debug || null
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[api/email-config/test] POST:", err);
		return Response.json({
			ok: false,
			error: "Erro ao testar conexão"
		}, { status: 500 });
	}
} } } });
function parseDate(v) {
	if (!v || v === "") return null;
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
}
var Route$3 = createFileRoute("/api/colaboradores/$id")({ server: { handlers: {
	GET: async ({ request, params }) => {
		try {
			await requireAuth(request);
			const colaborador = await prisma.colaborador.findUnique({
				where: { id: params.id },
				include: { exames: { orderBy: { created_at: "desc" } } }
			});
			if (!colaborador) return Response.json({
				ok: false,
				error: "Colaborador não encontrado"
			}, { status: 404 });
			return Response.json({
				ok: true,
				data: colaborador
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/colaboradores] GET /:id:", err);
			return Response.json({
				ok: false,
				error: "Erro ao buscar colaborador"
			}, { status: 500 });
		}
	},
	PUT: async ({ request, params }) => {
		try {
			await requireAuth(request);
			const body = await request.json();
			const updated = await prisma.colaborador.update({
				where: { id: params.id },
				data: {
					nome: body.nome,
					empresa: body.empresa ?? null,
					area: body.area ?? null,
					setor: body.setor ?? null,
					funcao: body.funcao ?? null,
					matricula_sap: body.matricula_sap ?? null,
					cpf: body.cpf ?? null,
					rg: body.rg ?? null,
					pis: body.pis ?? null,
					nascimento: parseDate(body.nascimento),
					escala_turno: body.escala_turno ?? null,
					ghe: body.ghe ?? null,
					periodicidade_meses: body.periodicidade_meses ?? 12,
					ultimo_exame: parseDate(body.ultimo_exame),
					proximo_exame: parseDate(body.proximo_exame),
					status: body.status ?? "sem_exame",
					observacoes: body.observacoes ?? null,
					ativo: body.ativo ?? true
				}
			});
			return Response.json({
				ok: true,
				data: updated
			});
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/colaboradores] PUT /:id:", err);
			return Response.json({
				ok: false,
				error: "Erro ao atualizar colaborador"
			}, { status: 500 });
		}
	},
	DELETE: async ({ request, params }) => {
		try {
			await requireAuth(request);
			await prisma.colaborador.delete({ where: { id: params.id } });
			return Response.json({ ok: true });
		} catch (err) {
			if (err instanceof Response) return err;
			console.error("[api/colaboradores] DELETE /:id:", err);
			return Response.json({
				ok: false,
				error: "Erro ao excluir colaborador"
			}, { status: 500 });
		}
	}
} } });
var SUPABASE_URL$1 = process.env.SUPABASE_URL;
var SERVICE_KEY$1 = process.env.SUPABASE_SERVICE_ROLE_KEY;
var BUCKET$1 = "asos";
var Route$2 = createFileRoute("/api/asos/upload")({ server: { handlers: { POST: async ({ request }) => {
	try {
		await requireAuth(request);
		const form = await request.formData();
		const file = form.get("file");
		const colaboradorId = form.get("colaborador_id");
		const exameId = form.get("exame_id");
		if (!file || !colaboradorId || !exameId) return Response.json({
			ok: false,
			error: "file, colaborador_id e exame_id são obrigatórios"
		}, { status: 400 });
		const ext = file.name.split(".").pop()?.toLowerCase();
		if (!ext || ![
			"pdf",
			"png",
			"jpg",
			"jpeg"
		].includes(ext)) return Response.json({
			ok: false,
			error: "Formato inválido. Use PDF, PNG ou JPG."
		}, { status: 400 });
		const fileName = `aso_${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`;
		const filePath = `${colaboradorId}/${fileName}`;
		const buffer = await file.arrayBuffer();
		const uploadRes = await fetch(`${SUPABASE_URL$1}/storage/v1/object/${BUCKET$1}/${filePath}`, {
			method: "POST",
			headers: {
				apikey: SERVICE_KEY$1,
				Authorization: `Bearer ${SERVICE_KEY$1}`,
				"Content-Type": file.type || "application/octet-stream",
				"x-upsert": "true"
			},
			body: buffer
		});
		if (!uploadRes.ok) {
			const errBody = await uploadRes.text();
			console.error("[aso-upload] Storage error:", uploadRes.status, errBody);
			return Response.json({
				ok: false,
				error: `Erro ao salvar arquivo: ${uploadRes.statusText}`
			}, { status: 500 });
		}
		const publicUrl = `${SUPABASE_URL$1}/storage/v1/object/public/${BUCKET$1}/${filePath}`;
		await prisma.exame.update({
			where: { id: exameId },
			data: { arquivo_url: publicUrl }
		});
		return Response.json({
			ok: true,
			data: {
				url: publicUrl,
				path: filePath,
				fileName
			}
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[api/asos/upload] POST:", err);
		return Response.json({
			ok: false,
			error: "Erro interno ao fazer upload do ASO"
		}, { status: 500 });
	}
} } } });
var SUPABASE_URL = process.env.SUPABASE_URL;
var SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var BUCKET = "asos";
var Route$1 = createFileRoute("/api/asos/listar")({ server: { handlers: { GET: async ({ request }) => {
	try {
		await requireAuth(request);
		const colaboradorId = new URL(request.url).searchParams.get("colaborador_id");
		if (!colaboradorId) return Response.json({
			ok: false,
			error: "colaborador_id é obrigatório"
		}, { status: 400 });
		const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
			method: "POST",
			headers: {
				apikey: SERVICE_KEY,
				Authorization: `Bearer ${SERVICE_KEY}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				prefix: `${colaboradorId}/`,
				limit: 100,
				sortBy: {
					column: "created_at",
					order: "desc"
				}
			})
		});
		if (!listRes.ok) {
			const errBody = await listRes.text();
			console.error("[aso-list] Storage error:", listRes.status, errBody);
			return Response.json({
				ok: false,
				data: []
			});
		}
		const data = (await listRes.json()).map((f) => ({
			name: f.name.replace(`${colaboradorId}/`, ""),
			fullPath: f.name,
			url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${f.name}`,
			createdAt: f.created_at
		}));
		return Response.json({
			ok: true,
			data
		});
	} catch (err) {
		if (err instanceof Response) return err;
		console.error("[api/asos/listar] GET:", err);
		return Response.json({
			ok: false,
			error: "Erro ao listar ASOs"
		}, { status: 500 });
	}
} } } });
var $$splitComponentImporter = () => import("../_id-s8tNLwK4.mjs");
var Route = createFileRoute("/_authenticated/colaboradores/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var AuthRoute = Route$29.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$30
});
var AuthenticatedRouteRoute = Route$28.update({
	id: "/_authenticated",
	getParentRoute: () => Route$30
});
var IndexRoute = Route$27.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$30
});
var ApiSetupRoute = Route$26.update({
	id: "/api/setup",
	path: "/api/setup",
	getParentRoute: () => Route$30
});
var ApiNotificacoesRoute = Route$25.update({
	id: "/api/notificacoes",
	path: "/api/notificacoes",
	getParentRoute: () => Route$30
});
var ApiLoginRoute = Route$24.update({
	id: "/api/login",
	path: "/api/login",
	getParentRoute: () => Route$30
});
var ApiGerarFormulariosColaboradoresRoute = Route$23.update({
	id: "/api/gerar-formularios-colaboradores",
	path: "/api/gerar-formularios-colaboradores",
	getParentRoute: () => Route$30
});
var ApiEmailsContatoRoute = Route$22.update({
	id: "/api/emails-contato",
	path: "/api/emails-contato",
	getParentRoute: () => Route$30
});
var ApiEmailConfigRoute = Route$21.update({
	id: "/api/email-config",
	path: "/api/email-config",
	getParentRoute: () => Route$30
});
var ApiColaboradoresRoute = Route$20.update({
	id: "/api/colaboradores",
	path: "/api/colaboradores",
	getParentRoute: () => Route$30
});
var ApiApplyMigrationsRoute = Route$19.update({
	id: "/api/apply-migrations",
	path: "/api/apply-migrations",
	getParentRoute: () => Route$30
});
var AuthenticatedRelatoriosRoute = Route$18.update({
	id: "/relatorios",
	path: "/relatorios",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPendenciasRoute = Route$17.update({
	id: "/pendencias",
	path: "/pendencias",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedKanbanExamesRoute = Route$16.update({
	id: "/kanban-exames",
	path: "/kanban-exames",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedImportarRoute = Route$15.update({
	id: "/importar",
	path: "/importar",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGerarFormulariosRoute = Route$14.update({
	id: "/gerar-formularios",
	path: "/gerar-formularios",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedExamesRoute = Route$13.update({
	id: "/exames",
	path: "/exames",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$12.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedConfigEmailRoute = Route$11.update({
	id: "/config-email",
	path: "/config-email",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgendarExamesRoute = Route$10.update({
	id: "/agendar-exames",
	path: "/agendar-exames",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiExamesIndexRoute = Route$9.update({
	id: "/api/exames/",
	path: "/api/exames/",
	getParentRoute: () => Route$30
});
var AuthenticatedColaboradoresIndexRoute = Route$8.update({
	id: "/colaboradores/",
	path: "/colaboradores/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiExamesHistoricoRoute = Route$7.update({
	id: "/api/exames/historico",
	path: "/api/exames/historico",
	getParentRoute: () => Route$30
});
var ApiExamesEnviarConfirmacaoRoute = Route$6.update({
	id: "/api/exames/enviar-confirmacao",
	path: "/api/exames/enviar-confirmacao",
	getParentRoute: () => Route$30
});
var ApiExamesIdRoute = Route$5.update({
	id: "/api/exames/$id",
	path: "/api/exames/$id",
	getParentRoute: () => Route$30
});
var ApiEmailConfigTestRoute = Route$4.update({
	id: "/test",
	path: "/test",
	getParentRoute: () => ApiEmailConfigRoute
});
var ApiColaboradoresIdRoute = Route$3.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApiColaboradoresRoute
});
var ApiAsosUploadRoute = Route$2.update({
	id: "/api/asos/upload",
	path: "/api/asos/upload",
	getParentRoute: () => Route$30
});
var ApiAsosListarRoute = Route$1.update({
	id: "/api/asos/listar",
	path: "/api/asos/listar",
	getParentRoute: () => Route$30
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAgendarExamesRoute,
	AuthenticatedConfigEmailRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedExamesRoute,
	AuthenticatedGerarFormulariosRoute,
	AuthenticatedImportarRoute,
	AuthenticatedKanbanExamesRoute,
	AuthenticatedPendenciasRoute,
	AuthenticatedRelatoriosRoute,
	AuthenticatedColaboradoresIdRoute: Route.update({
		id: "/colaboradores/$id",
		path: "/colaboradores/$id",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedColaboradoresIndexRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var ApiColaboradoresRouteChildren = { ApiColaboradoresIdRoute };
var ApiColaboradoresRouteWithChildren = ApiColaboradoresRoute._addFileChildren(ApiColaboradoresRouteChildren);
var ApiEmailConfigRouteChildren = { ApiEmailConfigTestRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	AuthRoute,
	ApiApplyMigrationsRoute,
	ApiColaboradoresRoute: ApiColaboradoresRouteWithChildren,
	ApiEmailConfigRoute: ApiEmailConfigRoute._addFileChildren(ApiEmailConfigRouteChildren),
	ApiEmailsContatoRoute,
	ApiGerarFormulariosColaboradoresRoute,
	ApiLoginRoute,
	ApiNotificacoesRoute,
	ApiSetupRoute,
	ApiAsosListarRoute,
	ApiAsosUploadRoute,
	ApiExamesIdRoute,
	ApiExamesEnviarConfirmacaoRoute,
	ApiExamesHistoricoRoute,
	ApiExamesIndexRoute
};
var routeTree = Route$30._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter, sendConfirmationEmail as n, sendEmail as r, createTransporter as t };
