// POST /api/gerar-formularios-colaboradores
// Gera formulários DOCX preenchidos para colaboradores selecionados
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";
import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";

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

function formatCPF(v: unknown): string {
  if (!v) return "";
  const d = String(v).replace(/\D/g, "").padStart(11, "0");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatDateBR(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  return String(v);
}

function escXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fillDocx(templatePath: string, row: Record<string, unknown>): Promise<Uint8Array> {
  const templateBuf = await fs.readFile(templatePath);
  const zip = await JSZip.loadAsync(templateBuf);

  let xml = await zip.file("word/document.xml")!.async("string");

  for (const field of FIELD_MAP) {
    const rawValue = row[field.key];
    if (!rawValue) continue;

    let value: string;
    if (field.key === "cpf") {
      value = formatCPF(rawValue);
    } else if (field.key === "nascimento") {
      value = formatDateBR(rawValue);
    } else {
      value = String(rawValue).trim();
    }
    if (!value) continue;

    const escaped = escXml(value);
    const label = field.label;
    const re = new RegExp(`(<w:t[^>]*>)${escapeRegex(label)}\\s*<\\/w:t>`, "g");
    xml = xml.replace(re, `$1${label} ${escaped}</w:t>`);
  }

  zip.file("word/document.xml", xml);
  return await zip.generateAsync({ type: "uint8array" });
}

export const Route = createFileRoute("/api/gerar-formularios-colaboradores")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAuth(request);
          const body = await request.json();
          const ids = body.colaborador_ids as string[];

          if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return Response.json(
              { ok: false, error: "Nenhum colaborador selecionado" },
              { status: 400 },
            );
          }

          const colaboradores = await prisma.colaborador.findMany({
            where: { id: { in: ids }, ativo: true },
          });

          if (colaboradores.length === 0) {
            return Response.json(
              { ok: false, error: "Nenhum colaborador encontrado" },
              { status: 404 },
            );
          }

          // Local do template
          const templatePath = path.join(process.cwd(), "public", "formulario 2.docx");

          const outZip = new JSZip();
          let success = 0;
          let errors = 0;

          for (const colab of colaboradores) {
            try {
              const nomeArquivo = `${colab.nome.replace(/[\\/:*?"<>|]/g, "_")}_form2_${(colab.cpf || "scpf").replace(/\D/g, "")}.docx`;

              const docxBuf = await fillDocx(templatePath, {
                nome: colab.nome,
                cpf: colab.cpf,
                rg: colab.rg,
                matricula_sap: colab.matricula_sap,
                pis: colab.pis,
                ghe: colab.ghe,
                funcao: colab.funcao,
                nascimento: colab.nascimento ? colab.nascimento.toISOString().slice(0, 10) : null,
              });

              outZip.file(nomeArquivo, docxBuf);
              success++;
            } catch (err) {
              errors++;
              console.error(`[gerar-formularios] Erro ao processar ${colab.nome}:`, err);
            }
          }

          const zipBuf = await outZip.generateAsync({ type: "uint8array" });

          return new Response(zipBuf as BlobPart as any, {
            status: 200,
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="formularios_${new Date().toISOString().slice(0, 10)}.zip"`,
            },
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/gerar-formularios-colaboradores] POST:", err);
          return Response.json(
            { ok: false, error: "Erro ao gerar formulários" },
            { status: 500 },
          );
        }
      },
    },
  },
});