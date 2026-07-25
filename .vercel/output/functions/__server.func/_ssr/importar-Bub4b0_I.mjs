import { o as __toESM } from "../_runtime.mjs";
import { t as authFetch } from "./custom-auth-zbVm8Nr6.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useAuth } from "./use-auth-LCVRQC72.mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { _ as Navigate, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as CircleCheck, T as FileSpreadsheet, i as Upload } from "../_libs/lucide-react.mjs";
import { n as readSync, r as utils, t as SSF } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/importar-Bub4b0_I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HEADER_MAP = {
	nome: "nome",
	empresa: "empresa",
	area: "area",
	área: "area",
	setor: "setor",
	funcao: "funcao",
	função: "funcao",
	"matricula sap": "matricula_sap",
	"matrícula sap": "matricula_sap",
	matricula: "matricula_sap",
	matrícula: "matricula_sap",
	cpf: "cpf",
	rg: "rg",
	pis: "pis",
	nascimento: "nascimento",
	"data de nascimento": "nascimento",
	escala: "escala_turno",
	turno: "escala_turno",
	"escala/turno": "escala_turno",
	"escala /turno": "escala_turno",
	ghe: "ghe",
	periodicidade: "periodicidade_meses",
	unidade: "unidade",
	"último exame": "ultimo_exame",
	"ultimo exame": "ultimo_exame",
	"próximo exame": "proximo_exame",
	"proximo exame": "proximo_exame"
};
var norm = (s) => s.toString().trim().toLowerCase();
function excelDateToISO(v) {
	if (v == null || v === "") return null;
	if (typeof v === "number") {
		const d = SSF.parse_date_code(v);
		if (!d) return null;
		return new Date(Date.UTC(d.y, d.m - 1, d.d)).toISOString().slice(0, 10);
	}
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	const s = String(v).trim();
	if (s.match(/^(\d{4})-(\d{2})-(\d{2})$/)) return s;
	const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
	if (br) {
		const [, dd, mm, yy] = br;
		return `${yy.length === 2 ? 2e3 + parseInt(yy) : parseInt(yy)}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
	}
	const dt = new Date(s);
	if (!Number.isNaN(dt.getTime()) && dt.getFullYear() > 1950) return dt.toISOString().slice(0, 10);
	return null;
}
function parseSheet(rows) {
	return rows.map((raw) => {
		const rec = { nome: "" };
		for (const [k, v] of Object.entries(raw)) {
			const key = HEADER_MAP[norm(k)];
			if (!key || v == null || v === "") continue;
			if (key === "nascimento" || key === "ultimo_exame" || key === "proximo_exame") rec[key] = excelDateToISO(v);
			else if (key === "periodicidade_meses") {
				const n = parseInt(String(v).replace(/\D/g, ""));
				if (!Number.isNaN(n)) rec[key] = n;
			} else rec[key] = String(v).trim();
		}
		return rec;
	}).filter((r) => String(r.nome ?? "").trim().length > 0);
}
function ImportarPage() {
	const { isAdmin } = useAuth();
	const navigate = useNavigate();
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(null);
	const onFile = async (f) => {
		setFile(f);
		setDone(null);
		const wb = readSync(await f.arrayBuffer(), { cellDates: true });
		const ws = wb.Sheets[wb.SheetNames[0]];
		const parsed = parseSheet(utils.sheet_to_json(ws, { defval: null }));
		setPreview(parsed);
	};
	const importar = async () => {
		if (!preview.length) return;
		setBusy(true);
		setProgress(0);
		const BATCH = 200;
		let inserted = 0;
		let skipped = 0;
		for (let i = 0; i < preview.length; i += BATCH) {
			const chunk = preview.slice(i, i + BATCH);
			try {
				const res = await authFetch("/api/colaboradores", {
					method: "POST",
					body: JSON.stringify(chunk)
				});
				if (!res.ok) throw new Error(await res.text());
				inserted += chunk.length;
			} catch (err) {
				console.error("[import] batch error:", err);
				for (const row of chunk) try {
					await authFetch("/api/colaboradores", {
						method: "POST",
						body: JSON.stringify(row)
					});
					inserted++;
				} catch {
					skipped++;
				}
			}
			setProgress(Math.round((i + chunk.length) / preview.length * 100));
		}
		setBusy(false);
		setDone({
			inserted,
			skipped
		});
		toast.success(`${inserted} colaboradores importados`);
	};
	const detectedHeaders = (0, import_react.useMemo)(() => {
		if (!preview[0]) return [];
		return Object.keys(preview[0]);
	}, [preview]);
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Importar planilha",
			description: "Suba o arquivo .xlsx com os colaboradores. As colunas são reconhecidas automaticamente."
		}),
		!file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block rounded-lg border-2 border-dashed border-border bg-card p-12 text-center cursor-pointer hover:border-primary/50 transition-colors",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: ".xlsx,.xls",
					className: "hidden",
					onChange: (e) => e.target.files?.[0] && onFile(e.target.files[0])
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-10 w-10 mx-auto text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 font-medium",
					children: "Clique para selecionar um arquivo Excel"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground mt-1",
					children: "Colunas esperadas: NOME, EMPRESA, ÁREA, SETOR, FUNÇÃO, CPF, RG, PIS, Nascimento, ESCALA/TURNO, GHE, PERIODICIDADE, UNIDADE, ÚLTIMO EXAME, PRÓXIMO EXAME"
				})
			]
		}),
		file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card p-6 shadow-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: file.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: [preview.length, " colaboradores prontos para importar"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => {
								setFile(null);
								setPreview([]);
								setDone(null);
							},
							children: "Trocar arquivo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: importar,
							disabled: busy || preview.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 mr-2" }), busy ? `${progress}%` : "Confirmar importação"]
						})]
					})]
				}),
				done && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-md bg-status-ok/15 border border-status-ok/40 p-3 flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-status-ok" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: done.inserted
						}),
						" registros importados",
						done.skipped > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							" ",
							"· ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-status-danger",
								children: [done.skipped, " falharam"]
							})
						] }),
						".",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							size: "sm",
							className: "px-2",
							onClick: () => navigate({ to: "/colaboradores" }),
							children: "Ver colaboradores →"
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground mb-2",
					children: ["Campos detectados: ", detectedHeaders.join(", ") || "—"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto max-h-[400px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/50 text-muted-foreground sticky top-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Nome"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Empresa"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Unidade"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Função"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "CPF"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Próx. exame"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: preview.slice(0, 100).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5",
										children: r.nome
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: r.empresa ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: r.unidade ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: r.funcao ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: r.cpf ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: r.proximo_exame ?? "—"
									})
								]
							}, i)) })]
						})
					}), preview.length > 100 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 py-2 text-[11px] text-muted-foreground border-t border-border bg-muted/30",
						children: ["Mostrando primeiros 100 · total: ", preview.length]
					})]
				})
			]
		})
	] });
}
//#endregion
export { ImportarPage as component };
