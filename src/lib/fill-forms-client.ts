/**
 * fill-forms-client.ts
 * Lógica de preenchimento de formulários .docx no navegador.
 * Usa JSZip para manipular o ZIP+XML dos templates.
 */
import JSZip from "jszip";
import * as XLSX from "xlsx";

// ─── Helpers ─────────────────────────────────────────────────
function excelDateToBR(v: unknown): string {
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

function formatCPF(cpf: unknown): string {
  if (!cpf) return "";
  const d = String(cpf).replace(/\D/g, "").padStart(11, "0");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function escXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function norm(s: string): string {
  return String(s || "").trim().toLowerCase();
}

// ─── Excel parsing ───────────────────────────────────────────
const HEADER_MAP: Record<string, string> = {
  nome: "nome",
  formulario: "formulario",
  funcao: "funcao",
  "função": "funcao",
  "matricula sap": "matricula_sap",
  "matrícula sap": "matricula_sap",
  cpf: "cpf",
  rg: "rg",
  pis: "pis",
  nascimento: "nascimento",
  "data de nascimento": "nascimento",
  ghe: "ghe",
};

function parseRow(raw: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = HEADER_MAP[norm(k)];
    if (!key || v == null || v === "") continue;
    row[key] = v;
  }
  return row;
}

// ─── Field mapping ───────────────────────────────────────────
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Fill single document ────────────────────────────────────
async function fillDocx(
  templateUrl: string,
  row: Record<string, unknown>
): Promise<Uint8Array> {
  // Fetch template
  const resp = await fetch(templateUrl);
  if (!resp.ok) throw new Error(`Erro ao carregar template: ${resp.status}`);
  const templateBuf = await resp.arrayBuffer();

  // Load as ZIP
  const zip = await JSZip.loadAsync(templateBuf);

  // Read document.xml
  let xml = await zip.file("word/document.xml")!.async("string");

  // Fill each field
  for (const field of FIELD_MAP) {
    const rawValue = row[field.key];
    if (!rawValue) continue;

    let value: string;
    if (field.key === "cpf") {
      value = formatCPF(rawValue);
    } else if (field.key === "nascimento") {
      value = excelDateToBR(rawValue);
    } else {
      value = String(rawValue).trim();
    }
    if (!value) continue;

    const escaped = escXml(value);
    const label = field.label;
    const re = new RegExp(
      `(<w:t[^>]*>)${escapeRegex(label)}\\s*<\\/w:t>`,
      "g"
    );
    xml = xml.replace(re, `$1${label} ${escaped}</w:t>`);
  }

  // Update XML
  zip.file("word/document.xml", xml);

  // Generate buffer
  const outBuf = await zip.generateAsync({ type: "uint8array" });
  return outBuf;
}

// ─── Public API ──────────────────────────────────────────────
export interface FillResult {
  success: number;
  errors: number;
  details: Array<{ nome: string; status: "ok" | "erro"; erro?: string }>;
}

/**
 * Processa a planilha e gera um ZIP com todos os formulários preenchidos.
 * @param excelFile - Arquivo .xlsx enviado pelo usuário
 * @param onProgress - Callback de progresso (nomes processados)
 * @returns Buffer do ZIP gerado
 */
export async function generateFilledForms(
  excelFile: File,
  onProgress?: (nome: string, total: number, atual: number) => void
): Promise<{ zip: Uint8Array; result: FillResult }> {
  const result: FillResult = { success: 0, errors: 0, details: [] };

  // Ler planilha
  const buf = await excelFile.arrayBuffer();
  const wb = XLSX.read(buf, { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: null,
  });

  // Processar cada linha
  const outZip = new JSZip();
  let total = 0;
  let atual = 0;

  for (const raw of rows) {
    const row = parseRow(raw);
    if (!row.nome) continue;
    total++;
  }

  if (total === 0) {
    throw new Error("Nenhum colaborador encontrado na planilha.");
  }

  for (const raw of rows) {
    const row = parseRow(raw);
    if (!row.nome) continue;

    atual++;
    const nome = String(row.nome).replace(/[\/\\:*?"<>|]/g, "_").trim();
    const cpf = String(row.cpf || "").replace(/\D/g, "");

    try {
      const formulario = Number(row.formulario) || 2;
      const templateUrl =
        formulario === 1
          ? "/formulario%201.docx"
          : "/formulario%202.docx";

      const docxBuf = await fillDocx(templateUrl, row);

      const filename = `${nome}_form${formulario}_${cpf || "scpf"}.docx`;
      outZip.file(filename, docxBuf);

      result.success++;
      result.details.push({ nome, status: "ok" });
      onProgress?.(nome, total, atual);
    } catch (err) {
      result.errors++;
      result.details.push({
        nome,
        status: "erro",
        erro: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const zipBuf = await outZip.generateAsync({ type: "uint8array" });
  return { zip: zipBuf, result };
}
