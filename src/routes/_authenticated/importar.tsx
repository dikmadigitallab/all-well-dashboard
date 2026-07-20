import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
<<<<<<< HEAD
import { useAuth } from "@/hooks/use-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
=======
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import type { ColaboradorInsert } from "@/lib/colaboradores";
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba

export const Route = createFileRoute("/_authenticated/importar")({
  component: ImportarPage,
});

// Map planilha column headers -> database fields (case/space insensitive)
<<<<<<< HEAD
const HEADER_MAP: Record<string, string> = {
=======
const HEADER_MAP: Record<string, keyof ColaboradorInsert> = {
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
  nome: "nome",
  empresa: "empresa",
  area: "area",
  "área": "area",
  setor: "setor",
  funcao: "funcao",
  "função": "funcao",
  "matricula sap": "matricula_sap",
  "matrícula sap": "matricula_sap",
  matricula: "matricula_sap",
  "matrícula": "matricula_sap",
  cpf: "cpf",
  rg: "rg",
  pis: "pis",
  nascimento: "nascimento",
  "data de nascimento": "nascimento",
  "escala": "escala_turno",
  "turno": "escala_turno",
  "escala/turno": "escala_turno",
  "escala /turno": "escala_turno",
  ghe: "ghe",
  periodicidade: "periodicidade_meses",
  unidade: "unidade",
  "último exame": "ultimo_exame",
  "ultimo exame": "ultimo_exame",
  "próximo exame": "proximo_exame",
  "proximo exame": "proximo_exame",
};

const norm = (s: string) => s.toString().trim().toLowerCase();

// Excel date serial -> ISO
function excelDateToISO(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    const dt = new Date(Date.UTC(d.y, d.m - 1, d.d));
    return dt.toISOString().slice(0, 10);
  }
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return s;
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (br) {
    const [, dd, mm, yy] = br;
    const y = yy.length === 2 ? 2000 + parseInt(yy) : parseInt(yy);
    return `${y}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime()) && dt.getFullYear() > 1950) return dt.toISOString().slice(0, 10);
  return null;
}

<<<<<<< HEAD
function parseSheet(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows
    .map((raw) => {
      const rec: Record<string, unknown> = { nome: "" };
=======
function parseSheet(rows: Record<string, unknown>[]): ColaboradorInsert[] {
  return rows
    .map((raw) => {
      const rec: ColaboradorInsert = { nome: "" };
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
      for (const [k, v] of Object.entries(raw)) {
        const key = HEADER_MAP[norm(k)];
        if (!key || v == null || v === "") continue;
        if (key === "nascimento" || key === "ultimo_exame" || key === "proximo_exame") {
<<<<<<< HEAD
          rec[key] = excelDateToISO(v);
        } else if (key === "periodicidade_meses") {
          const n = parseInt(String(v).replace(/\D/g, ""));
          if (!Number.isNaN(n)) rec[key] = n;
        } else {
          rec[key] = String(v).trim();
=======
          (rec as Record<string, unknown>)[key] = excelDateToISO(v);
        } else if (key === "periodicidade_meses") {
          const n = parseInt(String(v).replace(/\D/g, ""));
          if (!Number.isNaN(n)) rec.periodicidade_meses = n;
        } else if (key === "cpf" || key === "rg" || key === "pis" || key === "matricula_sap") {
          (rec as Record<string, unknown>)[key] = String(v).trim();
        } else {
          (rec as Record<string, unknown>)[key] = String(v).trim();
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
        }
      }
      return rec;
    })
    .filter((r) => r.nome && r.nome.trim().length > 0);
}

function ImportarPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
<<<<<<< HEAD
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
=======
  const [preview, setPreview] = useState<ColaboradorInsert[]>([]);
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<{ inserted: number; skipped: number } | null>(null);

  if (!isAdmin) return <Navigate to="/dashboard" />;

  const onFile = async (f: File) => {
    setFile(f);
    setDone(null);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
    const parsed = parseSheet(rows);
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
<<<<<<< HEAD
      try {
        const res = await fetch("/api/colaboradores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chunk),
        });
        if (!res.ok) throw new Error(await res.text());
        inserted += chunk.length;
      } catch (err) {
        console.error("[import] batch error:", err);
        // Tenta inserir um por um
        for (const row of chunk) {
          try {
            await fetch("/api/colaboradores", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(row),
            });
            inserted++;
          } catch {
            skipped++;
          }
        }
=======
      const { data, error } = await supabase.from("colaboradores").insert(chunk).select("id");
      if (error) {
        toast.error("Erro no lote", { description: error.message });
        skipped += chunk.length;
      } else {
        inserted += data?.length ?? 0;
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
      }
      setProgress(Math.round(((i + chunk.length) / preview.length) * 100));
    }
    setBusy(false);
    setDone({ inserted, skipped });
    toast.success(`${inserted} colaboradores importados`);
  };

  const detectedHeaders = useMemo(() => {
    if (!preview[0]) return [];
    return Object.keys(preview[0]);
  }, [preview]);

  return (
    <PageContainer>
      <PageHeader
        title="Importar planilha"
        description="Suba o arquivo .xlsx com os colaboradores. As colunas são reconhecidas automaticamente."
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
          <div className="mt-3 font-medium">Clique para selecionar um arquivo Excel</div>
          <div className="text-xs text-muted-foreground mt-1">Colunas esperadas: NOME, EMPRESA, ÁREA, SETOR, FUNÇÃO, CPF, RG, PIS, Nascimento, ESCALA/TURNO, GHE, PERIODICIDADE, UNIDADE, ÚLTIMO EXAME, PRÓXIMO EXAME</div>
        </label>
      )}

      {file && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {preview.length} colaboradores prontos para importar
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setFile(null); setPreview([]); setDone(null); }}>Trocar arquivo</Button>
              <Button size="sm" onClick={importar} disabled={busy || preview.length === 0}>
                <Upload className="h-4 w-4 mr-2" />{busy ? `${progress}%` : "Confirmar importação"}
              </Button>
            </div>
          </div>

          {done && (
            <div className="mb-4 rounded-md bg-status-ok/15 border border-status-ok/40 p-3 flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-status-ok" />
              <div>
                <span className="font-medium">{done.inserted}</span> registros importados
                {done.skipped > 0 && <> · <span className="text-status-danger">{done.skipped} falharam</span></>}.
                <Button variant="link" size="sm" className="px-2" onClick={() => navigate({ to: "/colaboradores" })}>Ver colaboradores →</Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mb-2">Campos detectados: {detectedHeaders.join(", ") || "—"}</div>

          <div className="rounded-md border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Nome</th>
                    <th className="text-left px-3 py-2 font-medium">Empresa</th>
                    <th className="text-left px-3 py-2 font-medium">Unidade</th>
                    <th className="text-left px-3 py-2 font-medium">Função</th>
                    <th className="text-left px-3 py-2 font-medium">CPF</th>
                    <th className="text-left px-3 py-2 font-medium">Próx. exame</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 100).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5">{r.nome}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.empresa ?? "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.unidade ?? "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.funcao ?? "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.cpf ?? "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.proximo_exame ?? "—"}</td>
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
