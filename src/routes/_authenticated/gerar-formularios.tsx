import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { generateFilledForms } from "@/lib/fill-forms-client";
import { saveAs } from "file-saver";

export const Route = createFileRoute("/_authenticated/gerar-formularios")({
  component: GerarFormulariosPage,
});

// ─── Helpers ─────────────────────────────────────────────────
function norm(s: string) {
  return String(s || "").trim().toLowerCase();
}

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

interface PreviewRow {
  nome: string;
  formulario: number;
}

function parsePreview(rows: Record<string, unknown>[]): PreviewRow[] {
  return rows
    .map((raw) => {
      const row: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(raw)) {
        const key = HEADER_MAP[norm(k)];
        if (!key || v == null || v === "") continue;
        row[key] = v;
      }
      return {
        nome: String(row.nome || "").trim(),
        formulario: Number(row.formulario) || 2,
      };
    })
    .filter((r) => r.nome.length > 0);
}

// ─── Component ───────────────────────────────────────────────
function GerarFormulariosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<{ success: number; errors: number } | null>(null);

  const form1Count = useMemo(
    () => preview.filter((r) => r.formulario === 1).length,
    [preview]
  );
  const form2Count = useMemo(
    () => preview.filter((r) => r.formulario === 2).length,
    [preview]
  );

  const onFile = async (f: File) => {
    setFile(f);
    setDone(null);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: null,
    });
    const parsed = parsePreview(rows);
    setPreview(parsed);
  };

  const gerar = async () => {
    if (!file || preview.length === 0) return;
    setBusy(true);
    setProgress(0);

    try {
      const { zip, result } = await generateFilledForms(file, (nome, total, atual) => {
        setProgress(Math.round((atual / total) * 100));
      });

      // Download ZIP
      const blob = new Blob([zip], { type: "application/zip" });
      const nomePlanilha = file.name.replace(/\.\w+$/, "");
      saveAs(blob, `${nomePlanilha}_formularios_preenchidos.zip`);

      setDone({ success: result.success, errors: result.errors });

      if (result.errors === 0) {
        toast.success(`${result.success} formulários gerados com sucesso!`);
      } else {
        toast.success(
          `${result.success} gerados, ${result.errors} com erro`,
          { description: "Verifique o relatório para mais detalhes." }
        );
      }
    } catch (err) {
      toast.error("Erro ao gerar formulários", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const detectedHeaders = useMemo(() => {
    if (!preview[0]) return [];
    return ["Nome", "Formulário", "CPF", "RG", "PIS", "GHE", "Ocupação", "Nascimento"];
  }, [preview]);

  return (
    <PageContainer>
      <PageHeader
        title="Gerar formulários"
        description="Suba a planilha com os colaboradores e gere os formulários preenchidos automaticamente."
      />

      {!file && (
        <label className="block rounded-lg border-2 border-dashed border-border bg-card p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
          <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground" />
          <div className="mt-3 font-medium">Clique para selecionar o arquivo Excel</div>
          <div className="text-xs text-muted-foreground mt-1">
            Colunas esperadas: NOME, FORMULARIO, CPF, RG, PIS, GHE, FUNÇÃO, Nascimento
          </div>
        </label>
      )}

      {file && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium">{preview.length}</span> colaboradores detectados
                {form1Count > 0 && (
                  <span className="ml-2">
                    · <span className="font-medium">{form1Count}</span> form. 1
                    {form2Count > 0 && (
                      <span className="ml-1">
                        · <span className="font-medium">{form2Count}</span> form. 2
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreview([]);
                  setDone(null);
                }}
              >
                Trocar arquivo
              </Button>
              <Button
                size="sm"
                onClick={gerar}
                disabled={busy || preview.length === 0}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {progress}%
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar e baixar formulários
                  </>
                )}
              </Button>
            </div>
          </div>

          {done && (
            <div className="mb-4 rounded-md bg-status-ok/15 border border-status-ok/40 p-3 flex items-start gap-2 text-sm">
              {done.errors === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-status-ok mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-status-warn mt-0.5 shrink-0" />
              )}
              <div>
                <span className="font-medium">{done.success}</span> formulários gerados
                {done.errors > 0 && (
                  <>
                    {" "}
                    · <span className="text-status-danger">{done.errors}</span> com erro
                  </>
                )}
                .
                <div className="text-muted-foreground mt-1">
                  O download do ZIP foi iniciado.
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mb-2">
            Campos detectados: {detectedHeaders.join(", ")}
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Nome</th>
                    <th className="text-left px-3 py-2 font-medium">Formulário</th>
                    <th className="text-left px-3 py-2 font-medium">CPF</th>
                    <th className="text-left px-3 py-2 font-medium">Ocupação</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 100).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5">{r.nome}</td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[11px] font-medium">
                          Form. {r.formulario}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">—</td>
                      <td className="px-3 py-1.5 text-muted-foreground">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 100 && (
              <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border bg-muted/30">
                Mostrando primeiros 100 · total: {preview.length}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
