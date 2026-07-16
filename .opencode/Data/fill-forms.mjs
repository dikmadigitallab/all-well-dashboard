/**
 * fill-forms.mjs
 * Lê base.xlsx e preenche formulários .docx originais copiando o template
 * e inserindo os dados diretamente no XML (word/document.xml).
 *
 * Uso: node .opencode/Data/fill-forms.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXCEL_PATH = path.join(__dirname, "base.xlsx");
const OUTPUT_DIR = path.join(__dirname, "formularios_preenchidos");
const FORM1_PATH = path.join(__dirname, "formulario 1.docx");
const FORM2_PATH = path.join(__dirname, "formulario 2.docx");

// ─── Helpers ─────────────────────────────────────────────────
function excelDateToBR(v) {
  if (v == null || v === "") return "";
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return "";
    return `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
  }
  if (v instanceof Date) {
    return `${String(v.getDate()).padStart(2, "0")}/${String(v.getMonth() + 1).padStart(2, "0")}/${v.getFullYear()}`;
  }
  const s = String(v).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (br) return s;
  return s || "";
}

function formatCPF(cpf) {
  if (!cpf) return "";
  const d = String(cpf).replace(/\D/g, "").padStart(11, "0");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function escXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

// ─── Excel parsing ───────────────────────────────────────────
const HEADER_MAP = {
  nome: "nome", formulario: "formulario",
  funcao: "funcao", "função": "funcao",
  "matricula sap": "matricula_sap", "matrícula sap": "matricula_sap",
  cpf: "cpf", rg: "rg", pis: "pis",
  nascimento: "nascimento", "data de nascimento": "nascimento",
  ghe: "ghe",
};

function parseRow(raw) {
  const row = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = HEADER_MAP[norm(k)];
    if (!key || v == null || v === "") continue;
    row[key] = v;
  }
  return row;
}

// ─── .docx field fill ────────────────────────────────────────
/**
 * Mapeamento: label no XML → valor da planilha
 * Só preenche o que está na planilha, sem inventar nada.
 */
const FIELD_MAP = [
  { label: "Nome do empregado:", key: "nome" },
  { label: "Nome:", key: "nome" },
  { label: "CPF:", key: "cpf" },
  { label: "RG:", key: "rg" },
  { label: "Matrícula SAP:", key: "matricula_sap" },
  { label: "PIS:", key: "pis" },
  { label: "GHE:", key: "ghe" },
  { label: "Ocupação:", key: "funcao" },
  { label: "Data de Nascimento:", key: "nascimento" },
];

function fillDocx(templatePath, row) {
  const buf = fs.readFileSync(templatePath);
  return JSZip.loadAsync(buf).then(async (zip) => {
    // Ler o document.xml
    let xml = await zip.file("word/document.xml").async("string");

    // Preencher cada campo
    for (const field of FIELD_MAP) {
      const rawValue = row[field.key];
      if (!rawValue) continue; // não preenche se não tem dado na planilha

      // Formatar valor
      let value;
      if (field.key === "cpf") {
        value = formatCPF(rawValue);
      } else if (field.key === "nascimento") {
        value = excelDateToBR(rawValue);
      } else {
        value = String(rawValue).trim();
      }

      if (!value) continue;

      // Escapar para XML
      const escaped = escXml(value);

      // Regex: procura <w:t ...>LABEL: espaços</w:t>
      // e substitui por <w:t ...>LABEL: VALOR</w:t>
      // Preserva atributos do <w:t>
      const label = field.label;
      const re = new RegExp(
        `(<w:t[^>]*>)${escapeRegex(label)}\\s*<\\/w:t>`,
        "g"
      );
      xml = xml.replace(re, `$1${label} ${escaped}</w:t>`);
    }

    // Atualizar o XML no zip
    zip.file("word/document.xml", xml);

    // Gerar o buffer .docx
    return zip.generateAsync({ type: "nodebuffer" });
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log("📂 Lendo planilha:", EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
  console.log(`📋 ${rows.length} linhas encontradas`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let count = 0;
  let errors = 0;

  for (const raw of rows) {
    const row = parseRow(raw);
    if (!row.nome) continue;

    const formulario = Number(row.formulario) || 2;
    const templatePath = formulario === 1 ? FORM1_PATH : FORM2_PATH;
    const nome = String(row.nome).replace(/[\/\\:*?"<>|]/g, "_").trim();
    const cpf = String(row.cpf || "").replace(/\D/g, "");
    const filename = `${nome}_form${formulario}_${cpf || "scpf"}.docx`;
    const outPath = path.join(OUTPUT_DIR, filename);

    try {
      const docxBuf = await fillDocx(templatePath, row);
      fs.writeFileSync(outPath, docxBuf);
      count++;
      if (count % 100 === 0 || count <= 3) {
        console.log(`  ✅ [${count}/${rows.length}] ${nome}`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ ${nome}: ${err.message}`);
    }
  }

  console.log(`\n🏁 Processo finalizado!`);
  console.log(`   ✅ ${count} formulários .docx gerados`);
  console.log(`   ❌ ${errors} erros`);
  console.log(`   📁 ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
