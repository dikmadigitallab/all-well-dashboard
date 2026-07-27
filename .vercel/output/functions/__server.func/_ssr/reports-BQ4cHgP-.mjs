import { o as __toESM } from "../_runtime.mjs";
import { n as formatCPF, r as formatDate, t as STATUS_LABEL } from "./colaboradores-D6aiYvsj.mjs";
import { a as TIPO_LABEL, i as STATUS_EXAME_LABEL, n as MOTIVO_LABEL } from "./exames-Y-GpGzpK.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { t as autoTable } from "../_libs/jspdf-autotable.mjs";
import { i as writeSync, r as utils } from "../_libs/xlsx.mjs";
import { t as require_FileSaver_min } from "../_libs/file-saver.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-BQ4cHgP-.js
var import_jspdf_node_min = /* @__PURE__ */ __toESM(require_jspdf_node_min());
var import_FileSaver_min = require_FileSaver_min();
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function pdfHeader(doc, title, subtitle) {
	doc.setFontSize(16);
	doc.setFont("helvetica", "bold");
	doc.text("Controle de ASOs", 14, 16);
	doc.setFontSize(11);
	doc.setFont("helvetica", "normal");
	doc.text(title, 14, 23);
	if (subtitle) {
		doc.setFontSize(9);
		doc.setTextColor(120);
		doc.text(subtitle, 14, 29);
		doc.setTextColor(0);
	}
	doc.setDrawColor(220);
	doc.line(14, 32, 196, 32);
}
function exportColabsPDF(rows, filtroLabel) {
	const doc = new import_jspdf_node_min.default({ orientation: "landscape" });
	pdfHeader(doc, `Situação dos ASOs — ${rows.length} colaboradores`, filtroLabel);
	autoTable(doc, {
		startY: 36,
		styles: {
			fontSize: 8,
			cellPadding: 2
		},
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		head: [[
			"Nome",
			"Empresa",
			"Unidade",
			"Função",
			"CPF",
			"Próx. exame",
			"Dias",
			"Status"
		]],
		body: rows.map((r) => [
			r.nome ?? "—",
			r.empresa ?? "—",
			r.unidade ?? "—",
			r.funcao ?? "—",
			formatCPF(r.cpf),
			formatDate(r.proximo_exame),
			r.dias_para_vencer ?? "—",
			STATUS_LABEL[r.status ?? "sem_exame"]
		])
	});
	doc.save(`asos_${today()}.pdf`);
}
function exportColabsXLSX(rows) {
	const data = rows.map((r) => ({
		Nome: r.nome,
		Empresa: r.empresa,
		Unidade: r.unidade,
		Área: r.area,
		Setor: r.setor,
		Função: r.funcao,
		"Matrícula SAP": r.matricula_sap,
		CPF: r.cpf,
		RG: r.rg,
		PIS: r.pis,
		Nascimento: r.nascimento,
		Escala: r.escala_turno,
		GHE: r.ghe,
		"Periodicidade (m)": r.periodicidade_meses,
		"Último exame": r.ultimo_exame,
		"Próximo exame": r.proximo_exame,
		"Dias p/ vencer": r.dias_para_vencer,
		Status: STATUS_LABEL[r.status ?? "sem_exame"]
	}));
	const ws = utils.json_to_sheet(data);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "ASOs");
	const buf = writeSync(wb, {
		bookType: "xlsx",
		type: "array"
	});
	(0, import_FileSaver_min.saveAs)(new Blob([buf]), `asos_${today()}.xlsx`);
}
function exportExamesPDF(rows, titulo = "Histórico de exames") {
	const doc = new import_jspdf_node_min.default({ orientation: "landscape" });
	pdfHeader(doc, `${titulo} — ${rows.length} registros`);
	autoTable(doc, {
		startY: 36,
		styles: {
			fontSize: 8,
			cellPadding: 2
		},
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		head: [[
			"Colaborador",
			"Empresa/Unidade",
			"Tipo",
			"Agendado",
			"Realizado",
			"Vencimento",
			"Status",
			"Motivo"
		]],
		body: rows.map((r) => [
			r.colaborador?.nome ?? "—",
			`${r.colaborador?.empresa ?? "—"} / ${r.colaborador?.unidade ?? "—"}`,
			TIPO_LABEL[r.tipo],
			formatDate(r.data_agendada),
			formatDate(r.data_realizado),
			formatDate(r.data_vencimento),
			STATUS_EXAME_LABEL[r.status],
			r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : "—"
		])
	});
	doc.save(`exames_${today()}.pdf`);
}
function exportExamesXLSX(rows) {
	const data = rows.map((r) => ({
		Colaborador: r.colaborador?.nome ?? "",
		Empresa: r.colaborador?.empresa ?? "",
		Unidade: r.colaborador?.unidade ?? "",
		Tipo: TIPO_LABEL[r.tipo],
		Agendado: r.data_agendada,
		Realizado: r.data_realizado,
		Vencimento: r.data_vencimento,
		Status: STATUS_EXAME_LABEL[r.status],
		Motivo: r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : "",
		Justificativa: r.justificativa ?? ""
	}));
	const ws = utils.json_to_sheet(data);
	const wb = utils.book_new();
	utils.book_append_sheet(wb, ws, "Exames");
	const buf = writeSync(wb, {
		bookType: "xlsx",
		type: "array"
	});
	(0, import_FileSaver_min.saveAs)(new Blob([buf]), `exames_${today()}.xlsx`);
}
function exportIndicadoresPDF(colabs) {
	const doc = new import_jspdf_node_min.default();
	pdfHeader(doc, "Indicadores por unidade e setor");
	const total = colabs.length;
	const porStatus = {};
	for (const c of colabs) porStatus[c.status ?? "sem_exame"] = (porStatus[c.status ?? "sem_exame"] ?? 0) + 1;
	autoTable(doc, {
		startY: 38,
		head: [["Indicador", "Valor"]],
		body: [
			["Total de colaboradores", String(total)],
			["Em dia", String(porStatus["em_dia"] ?? 0)],
			["A vencer (≤30 dias)", String(porStatus["a_vencer"] ?? 0)],
			["Vencidos", String(porStatus["vencido"] ?? 0)],
			["Sem exame", String(porStatus["sem_exame"] ?? 0)]
		],
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		styles: { fontSize: 10 }
	});
	const agrupa = (key) => {
		const m = /* @__PURE__ */ new Map();
		for (const c of colabs) {
			const k = c[key] ?? "—";
			const cur = m.get(k) ?? {
				total: 0,
				vencido: 0,
				a_vencer: 0,
				em_dia: 0,
				sem_exame: 0
			};
			cur.total++;
			cur[c.status ?? "sem_exame"]++;
			m.set(k, cur);
		}
		return Array.from(m.entries()).sort((a, b) => b[1].total - a[1].total);
	};
	autoTable(doc, {
		head: [[
			"Unidade",
			"Total",
			"Em dia",
			"A vencer",
			"Vencido",
			"Sem exame"
		]],
		body: agrupa("unidade").map(([k, v]) => [
			k,
			v.total,
			v.em_dia,
			v.a_vencer,
			v.vencido,
			v.sem_exame
		]),
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		styles: { fontSize: 9 }
	});
	autoTable(doc, {
		head: [[
			"Setor",
			"Total",
			"Em dia",
			"A vencer",
			"Vencido",
			"Sem exame"
		]],
		body: agrupa("setor").map(([k, v]) => [
			k,
			v.total,
			v.em_dia,
			v.a_vencer,
			v.vencido,
			v.sem_exame
		]),
		headStyles: { fillColor: [
			37,
			99,
			235
		] },
		styles: { fontSize: 9 }
	});
	doc.save(`indicadores_${today()}.pdf`);
}
function gerarASO(c, exame) {
	const doc = new import_jspdf_node_min.default();
	const w = doc.internal.pageSize.getWidth();
	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.text("ATESTADO DE SAÚDE OCUPACIONAL (ASO)", w / 2, 18, { align: "center" });
	doc.setFontSize(9);
	doc.setFont("helvetica", "normal");
	doc.text("NR-7 — Programa de Controle Médico de Saúde Ocupacional", w / 2, 24, { align: "center" });
	doc.setDrawColor(180);
	doc.line(14, 28, w - 14, 28);
	autoTable(doc, {
		startY: 32,
		body: [
			["Empresa", c.empresa ?? "—"],
			["Unidade", c.unidade ?? "—"],
			["Colaborador", c.nome ?? "—"],
			["CPF", formatCPF(c.cpf)],
			["RG", c.rg ?? "—"],
			["PIS", c.pis ?? "—"],
			["Data de nascimento", formatDate(c.nascimento)],
			["Matrícula SAP", c.matricula_sap ?? "—"],
			["Função", c.funcao ?? "—"],
			["Setor", c.setor ?? "—"],
			["Área", c.area ?? "—"],
			["Escala / Turno", c.escala_turno ?? "—"],
			["GHE (grupo de exposição)", c.ghe ?? "—"]
		],
		theme: "plain",
		styles: {
			fontSize: 10,
			cellPadding: 1.5
		},
		columnStyles: { 0: {
			fontStyle: "bold",
			cellWidth: 55
		} }
	});
	const y1 = doc.lastAutoTable.finalY + 4;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(11);
	doc.text("Dados do exame", 14, y1);
	autoTable(doc, {
		startY: y1 + 2,
		body: [
			["Tipo de exame", exame ? TIPO_LABEL[exame.tipo] : "________________________"],
			["Data agendada", exame ? formatDate(exame.data_agendada) : "____ / ____ / ______"],
			["Data de realização", exame ? formatDate(exame.data_realizado) : "____ / ____ / ______"],
			["Vencimento", exame ? formatDate(exame.data_vencimento) : formatDate(c.proximo_exame)],
			["Periodicidade", `${c.periodicidade_meses ?? 12} meses`]
		],
		theme: "plain",
		styles: {
			fontSize: 10,
			cellPadding: 1.5
		},
		columnStyles: { 0: {
			fontStyle: "bold",
			cellWidth: 55
		} }
	});
	const y2 = doc.lastAutoTable.finalY + 6;
	doc.setFont("helvetica", "bold");
	doc.text("Riscos ocupacionais", 14, y2);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.rect(14, y2 + 2, w - 28, 22);
	const y3 = y2 + 30;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(11);
	doc.text("Procedimentos médicos e complementares realizados", 14, y3);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.rect(14, y3 + 2, w - 28, 30);
	const y4 = y3 + 38;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(11);
	doc.text("Conclusão", 14, y4);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.text("(   ) APTO para a função", 14, y4 + 8);
	doc.text("(   ) INAPTO para a função", 90, y4 + 8);
	doc.text("(   ) APTO com restrições", 14, y4 + 15);
	doc.text("Restrições / observações:", 14, y4 + 22);
	doc.rect(14, y4 + 24, w - 28, 18);
	const y5 = y4 + 50;
	doc.line(20, y5, 90, y5);
	doc.line(w - 90, y5, w - 20, y5);
	doc.setFontSize(9);
	doc.text("Assinatura do colaborador", 55, y5 + 5, { align: "center" });
	doc.text("Médico do trabalho (nome / CRM)", w - 55, y5 + 5, { align: "center" });
	doc.setFontSize(8);
	doc.setTextColor(130);
	doc.text(`Emitido em ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`, w - 14, 290, { align: "right" });
	doc.save(`ASO_${(c.nome ?? "colaborador").replace(/\s+/g, "_")}_${today()}.pdf`);
}
//#endregion
export { exportIndicadoresPDF as a, exportExamesXLSX as i, exportColabsXLSX as n, gerarASO as o, exportExamesPDF as r, exportColabsPDF as t };
