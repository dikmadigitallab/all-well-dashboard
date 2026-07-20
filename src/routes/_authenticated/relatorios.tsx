import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FileText, FileSpreadsheet, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Colaborador } from "@/lib/colaboradores";
import type { Exame } from "@/lib/exames";
import {
  exportColabsPDF, exportColabsXLSX,
  exportExamesPDF, exportExamesXLSX,
  exportIndicadoresPDF,
} from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: RelatoriosPage,
});

type ExameRow = Exame & { colaborador?: { nome?: string | null; empresa?: string | null; unidade?: string | null } | null };

function RelatoriosPage() {
  const [empresa, setEmpresa] = useState("__all__");
  const [unidade, setUnidade] = useState("__all__");
  const [statusColab, setStatusColab] = useState("__all__");
  const [dtIni, setDtIni] = useState("");
  const [dtFim, setDtFim] = useState("");

  const { data: colabs = [] } = useQuery({
    queryKey: ["rel-colabs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("colaboradores").select("*").order("nome").limit(5000);
      if (error) throw error;
      return (data ?? []) as Colaborador[];
    },
  });

  const { data: exames = [] } = useQuery({
    queryKey: ["rel-exames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames")
        .select("*, colaborador:colaboradores!inner(id,nome,empresa,unidade)")
        .order("data_agendada", { ascending: false, nullsFirst: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as ExameRow[];
    },
  });

  const empresas = useMemo(() => Array.from(new Set(colabs.map((c) => c.empresa).filter(Boolean) as string[])).sort(), [colabs]);
  const unidades = useMemo(() => Array.from(new Set(colabs.map((c) => c.unidade).filter(Boolean) as string[])).sort(), [colabs]);

  const colabsFiltered = useMemo(() => colabs.filter((c) => {
    if (empresa !== "__all__" && c.empresa !== empresa) return false;
    if (unidade !== "__all__" && c.unidade !== unidade) return false;
    if (statusColab !== "__all__" && c.status !== statusColab) return false;
    return true;
  }), [colabs, empresa, unidade, statusColab]);

  const examesFiltered = useMemo(() => exames.filter((r) => {
    if (empresa !== "__all__" && r.colaborador?.empresa !== empresa) return false;
    if (unidade !== "__all__" && r.colaborador?.unidade !== unidade) return false;
    if (dtIni && (!r.data_agendada || r.data_agendada < dtIni)) return false;
    if (dtFim && (!r.data_agendada || r.data_agendada > dtFim)) return false;
    return true;
  }), [exames, empresa, unidade, dtIni, dtFim]);

  const stats = useMemo(() => {
    const total = examesFiltered.length;
    const compareceu = examesFiltered.filter((e) => e.status === "compareceu" || e.status === "realizado").length;
    const faltou = examesFiltered.filter((e) => e.status === "faltou").length;
    const pend = examesFiltered.filter((e) => e.status === "pendente").length;
    return { total, compareceu, faltou, pend, taxa: total ? Math.round((compareceu / total) * 100) : 0 };
  }, [examesFiltered]);

  const filtroLabel = [
    empresa !== "__all__" ? `Empresa: ${empresa}` : null,
    unidade !== "__all__" ? `Unidade: ${unidade}` : null,
    statusColab !== "__all__" ? `Status: ${statusColab}` : null,
  ].filter(Boolean).join(" · ") || "Todos os registros";

  return (
    <PageContainer>
      <PageHeader title="Relatórios" description="Exporte dados e indicadores em PDF ou Excel" />

      <div className="rounded-lg border border-border bg-card p-4 shadow-panel mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Empresa</Label>
            <Select value={empresa} onValueChange={setEmpresa}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Unidade</Label>
            <Select value={unidade} onValueChange={setUnidade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {unidades.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Status do ASO</Label>
            <Select value={statusColab} onValueChange={setStatusColab}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="em_dia">Em dia</SelectItem>
                <SelectItem value="a_vencer">A vencer</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="sem_exame">Sem exame</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Período (de)</Label>
            <Input type="date" value={dtIni} onChange={(e) => setDtIni(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Período (até)</Label>
            <Input type="date" value={dtFim} onChange={(e) => setDtFim(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Situação dos ASOs"
          desc={`${colabsFiltered.length} colaboradores no filtro atual`}
          icon={<FileText className="h-5 w-5 text-primary" />}
        >
          <Button size="sm" variant="outline" onClick={() => exportColabsPDF(colabsFiltered, filtroLabel)}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportColabsXLSX(colabsFiltered)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
          </Button>
        </Card>

        <Card
          title="Histórico de exames"
          desc={`${examesFiltered.length} exames — comparecimento: ${stats.taxa}%`}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
        >
          <Button size="sm" variant="outline" onClick={() => exportExamesPDF(examesFiltered)}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportExamesXLSX(examesFiltered)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
          </Button>
        </Card>

        <Card
          title="Indicadores por unidade/setor"
          desc="Consolidado de ASOs por status"
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
        >
          <Button size="sm" variant="outline" onClick={() => exportIndicadoresPDF(colabsFiltered)}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
        </Card>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-panel mt-4">
        <div className="text-sm font-medium mb-3">Estatísticas de comparecimento (filtro atual)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Kpi label="Total exames" value={stats.total} />
          <Kpi label="Compareceram" value={stats.compareceu} tone="ok" />
          <Kpi label="Faltas" value={stats.faltou} tone="danger" />
          <Kpi label="Pendências" value={stats.pend} tone="warn" />
        </div>
      </div>
    </PageContainer>
  );
}

function Card({ title, desc, icon, children }: { title: string; desc: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-panel flex flex-col gap-3">
      <div className="flex items-center gap-2">{icon}<div className="text-sm font-semibold">{title}</div></div>
      <div className="text-xs text-muted-foreground min-h-[32px]">{desc}</div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" | "danger" }) {
  const cls = tone === "ok" ? "text-status-ok-foreground"
    : tone === "warn" ? "text-status-warn-foreground"
    : tone === "danger" ? "text-status-danger" : "";
  return (
    <div className="rounded-md border border-border p-3">
      <div className={`text-2xl font-semibold ${cls}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
