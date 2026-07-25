import { o as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as PageHeader, t as PageContainer } from "./page-header-s_STzGKq.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as CircleCheck, N as CircleAlert, O as Download, T as FileSpreadsheet, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as readSync, r as utils, t as SSF } from "../_libs/xlsx.mjs";
import { t as require_FileSaver_min } from "../_libs/file-saver.mjs";
import { t as require_lib } from "../_libs/jszip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gerar-formularios-BxlvD-bh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
var import_FileSaver_min = require_FileSaver_min();
/**
* fill-forms-client.ts
* Lógica de preenchimento de formulários .docx no navegador.
* Usa JSZip para manipular o ZIP+XML dos templates.
*/
function excelDateToBR(v) {
	if (v == null || v === "") return "";
	if (typeof v === "number") {
		const d = SSF.parse_date_code(v);
		if (!d) return "";
		return `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
	}
	if (v instanceof Date) return `${String(v.getDate()).padStart(2, "0")}/${String(v.getMonth() + 1).padStart(2, "0")}/${v.getFullYear()}`;
	const s = String(v).trim();
	const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
	if (s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)) return s;
	return s || "";
}
function formatCPF(cpf) {
	if (!cpf) return "";
	return String(cpf).replace(/\D/g, "").padStart(11, "0").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function escXml(str) {
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function norm$1(s) {
	return String(s || "").trim().toLowerCase();
}
var HEADER_MAP$1 = {
	nome: "nome",
	formulario: "formulario",
	funcao: "funcao",
	função: "funcao",
	"matricula sap": "matricula_sap",
	"matrícula sap": "matricula_sap",
	cpf: "cpf",
	rg: "rg",
	pis: "pis",
	nascimento: "nascimento",
	"data de nascimento": "nascimento",
	ghe: "ghe"
};
function parseRow(raw) {
	const row = {};
	for (const [k, v] of Object.entries(raw)) {
		const key = HEADER_MAP$1[norm$1(k)];
		if (!key || v == null || v === "") continue;
		row[key] = v;
	}
	return row;
}
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
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function fillDocx(templateUrl, row) {
	const resp = await fetch(templateUrl);
	if (!resp.ok) throw new Error(`Erro ao carregar template: ${resp.status}`);
	const templateBuf = await resp.arrayBuffer();
	const zip = await import_lib.default.loadAsync(templateBuf);
	let xml = await zip.file("word/document.xml").async("string");
	for (const field of FIELD_MAP) {
		const rawValue = row[field.key];
		if (!rawValue) continue;
		let value;
		if (field.key === "cpf") value = formatCPF(rawValue);
		else if (field.key === "nascimento") value = excelDateToBR(rawValue);
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
/**
* Processa a planilha e gera um ZIP com todos os formulários preenchidos.
* @param excelFile - Arquivo .xlsx enviado pelo usuário
* @param onProgress - Callback de progresso (nomes processados)
* @returns Buffer do ZIP gerado
*/
async function generateFilledForms(excelFile, onProgress) {
	const result = {
		success: 0,
		errors: 0,
		details: []
	};
	const wb = readSync(await excelFile.arrayBuffer(), { cellDates: true });
	const ws = wb.Sheets[wb.SheetNames[0]];
	const rows = utils.sheet_to_json(ws, { defval: null });
	const outZip = new import_lib.default();
	let total = 0;
	let atual = 0;
	for (const raw of rows) {
		if (!parseRow(raw).nome) continue;
		total++;
	}
	if (total === 0) throw new Error("Nenhum colaborador encontrado na planilha.");
	for (const raw of rows) {
		const row = parseRow(raw);
		if (!row.nome) continue;
		atual++;
		const nome = String(row.nome).replace(/[\\/:*?"<>|]/g, "_").trim();
		const cpf = String(row.cpf || "").replace(/\D/g, "");
		try {
			const formulario = Number(row.formulario) || 2;
			const docxBuf = await fillDocx(formulario === 1 ? "/formulario%201.docx" : "/formulario%202.docx", row);
			const filename = `${nome}_form${formulario}_${cpf || "scpf"}.docx`;
			outZip.file(filename, docxBuf);
			result.success++;
			result.details.push({
				nome,
				status: "ok"
			});
			onProgress?.(nome, total, atual);
		} catch (err) {
			result.errors++;
			result.details.push({
				nome,
				status: "erro",
				erro: err instanceof Error ? err.message : String(err)
			});
		}
	}
	return {
		zip: await outZip.generateAsync({ type: "uint8array" }),
		result
	};
}
function norm(s) {
	return String(s || "").trim().toLowerCase();
}
var HEADER_MAP = {
	nome: "nome",
	formulario: "formulario",
	funcao: "funcao",
	função: "funcao",
	"matricula sap": "matricula_sap",
	"matrícula sap": "matricula_sap",
	cpf: "cpf",
	rg: "rg",
	pis: "pis",
	nascimento: "nascimento",
	"data de nascimento": "nascimento",
	ghe: "ghe"
};
function parsePreview(rows) {
	return rows.map((raw) => {
		const row = {};
		for (const [k, v] of Object.entries(raw)) {
			const key = HEADER_MAP[norm(k)];
			if (!key || v == null || v === "") continue;
			row[key] = v;
		}
		return {
			nome: String(row.nome || "").trim(),
			formulario: Number(row.formulario) || 2
		};
	}).filter((r) => r.nome.length > 0);
}
function GerarFormulariosPage() {
	const [file, setFile] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(null);
	const form1Count = (0, import_react.useMemo)(() => preview.filter((r) => r.formulario === 1).length, [preview]);
	const form2Count = (0, import_react.useMemo)(() => preview.filter((r) => r.formulario === 2).length, [preview]);
	const onFile = async (f) => {
		setFile(f);
		setDone(null);
		const wb = readSync(await f.arrayBuffer(), { cellDates: true });
		const ws = wb.Sheets[wb.SheetNames[0]];
		const parsed = parsePreview(utils.sheet_to_json(ws, { defval: null }));
		setPreview(parsed);
	};
	const gerar = async () => {
		if (!file || preview.length === 0) return;
		setBusy(true);
		setProgress(0);
		try {
			const { zip, result } = await generateFilledForms(file, (nome, total, atual) => {
				setProgress(Math.round(atual / total * 100));
			});
			(0, import_FileSaver_min.saveAs)(new Blob([zip], { type: "application/zip" }), `${file.name.replace(/\.\w+$/, "")}_formularios_preenchidos.zip`);
			setDone({
				success: result.success,
				errors: result.errors
			});
			if (result.errors === 0) toast.success(`${result.success} formulários gerados com sucesso!`);
			else toast.success(`${result.success} gerados, ${result.errors} com erro`, { description: "Verifique o relatório para mais detalhes." });
		} catch (err) {
			toast.error("Erro ao gerar formulários", { description: err instanceof Error ? err.message : String(err) });
		} finally {
			setBusy(false);
		}
	};
	const detectedHeaders = (0, import_react.useMemo)(() => {
		if (!preview[0]) return [];
		return [
			"Nome",
			"Formulário",
			"CPF",
			"RG",
			"PIS",
			"GHE",
			"Ocupação",
			"Nascimento"
		];
	}, [preview]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageContainer, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Gerar formulários",
			description: "Suba a planilha com os colaboradores e gere os formulários preenchidos automaticamente."
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
					children: "Clique para selecionar o arquivo Excel"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground mt-1",
					children: "Colunas esperadas: NOME, FORMULARIO, CPF, RG, PIS, GHE, FUNÇÃO, Nascimento"
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
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: preview.length
							}),
							" colaboradores detectados",
							form1Count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2",
								children: [
									"· ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: form1Count
									}),
									" form. 1",
									form2Count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-1",
										children: [
											"· ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: form2Count
											}),
											" form. 2"
										]
									})
								]
							})
						]
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: gerar,
							disabled: busy || preview.length === 0,
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
								progress,
								"%"
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-2" }), "Gerar e baixar formulários"] })
						})]
					})]
				}),
				done && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-md bg-status-ok/15 border border-status-ok/40 p-3 flex items-start gap-2 text-sm",
					children: [done.errors === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-status-ok mt-0.5 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-status-warn mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: done.success
						}),
						" formulários gerados",
						done.errors > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							" ",
							"· ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-status-danger",
								children: done.errors
							}),
							" com erro"
						] }),
						".",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground mt-1",
							children: "O download do ZIP foi iniciado."
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground mb-2",
					children: ["Campos detectados: ", detectedHeaders.join(", ")]
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
										children: "Formulário"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "CPF"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Ocupação"
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
										className: "px-3 py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium",
											children: ["Form. ", r.formulario]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground",
										children: "—"
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
export { GerarFormulariosPage as component };
