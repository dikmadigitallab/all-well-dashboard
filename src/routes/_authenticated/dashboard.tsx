import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
<<<<<<< HEAD
=======
import { supabase } from "@/integrations/supabase/client";
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
import { PageContainer, PageHeader } from "@/components/page-header";
import type { Colaborador } from "@/lib/colaboradores";
import { STATUS_LABEL } from "@/lib/colaboradores";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, XCircle, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const STATUS_COLORS: Record<string, string> = {
  em_dia: "var(--status-ok)",
  a_vencer: "var(--status-warn)",
  vencido: "var(--status-danger)",
  sem_exame: "var(--status-neutral)",
};

function Dashboard() {
  const [empresa, setEmpresa] = useState<string>("__all__");
  const [unidade, setUnidade] = useState<string>("__all__");
  const [setor, setSetor] = useState<string>("__all__");
  const [periodo, setPeriodo] = useState<"semanal" | "mensal" | "trimestral" | "anual">("mensal");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["colab-dash"],
    queryFn: async () => {
<<<<<<< HEAD
      const res = await fetch("/api/colaboradores");
      if (!res.ok) throw new Error("Erro ao buscar dados");
      const json = await res.json();
      return (json.data as Colaborador[]).map(({ id, empresa, unidade, setor, funcao, status, proximo_exame, ativo }) => ({
        id, empresa, unidade, setor, funcao, status, proximo_exame, ativo,
      })) as Pick<Colaborador, "id" | "empresa" | "unidade" | "setor" | "funcao" | "status" | "proximo_exame" | "ativo">[];
=======
      const { data, error } = await supabase
        .from("colaboradores")
        .select("id,empresa,unidade,setor,funcao,status,proximo_exame,ativo")
        .eq("ativo", true);
      if (error) throw error;
      return data as Pick<Colaborador, "id" | "empresa" | "unidade" | "setor" | "funcao" | "status" | "proximo_exame" | "ativo">[];
>>>>>>> abdb50bf565f8f328015be289fdd15bd5a3223ba
    },
  });

  const empresas = useMemo(() => Array.from(new Set(rows.map((r) => r.empresa).filter(Boolean) as string[])).sort(), [rows]);
  const unidades = useMemo(() => Array.from(new Set(rows.map((r) => r.unidade).filter(Boolean) as string[])).sort(), [rows]);
  const setores = useMemo(() => Array.from(new Set(rows.map((r) => r.setor).filter(Boolean) as string[])).sort(), [rows]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (empresa === "__all__" || r.empresa === empresa) &&
          (unidade === "__all__" || r.unidade === unidade) &&
          (setor === "__all__" || r.setor === setor),
      ),
    [rows, empresa, unidade, setor],
  );

  const total = filtered.length;
  const counts = useMemo(() => {
    const c = { em_dia: 0, a_vencer: 0, vencido: 0, sem_exame: 0 } as Record<string, number>;
    for (const r of filtered) c[r.status ?? "sem_exame"]++;
    return c;
  }, [filtered]);

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const statusData = [
    { name: "Em dia", value: counts.em_dia, key: "em_dia" },
    { name: "A vencer", value: counts.a_vencer, key: "a_vencer" },
    { name: "Vencido", value: counts.vencido, key: "vencido" },
    { name: "Sem exame", value: counts.sem_exame, key: "sem_exame" },
  ];

  const porUnidade = useMemo(() => {
    const map = new Map<string, { em_dia: number; a_vencer: number; vencido: number; sem_exame: number }>();
    for (const r of filtered) {
      const k = r.unidade || "—";
      const cur = map.get(k) ?? { em_dia: 0, a_vencer: 0, vencido: 0, sem_exame: 0 };
      cur[(r.status ?? "sem_exame") as keyof typeof cur]++;
      map.set(k, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.em_dia + b.a_vencer + b.vencido + b.sem_exame - (a.em_dia + a.a_vencer + a.vencido + a.sem_exame))
      .slice(0, 10);
  }, [filtered]);

  // Evolução: agrupa próximos vencimentos ao longo do período
  const evolucao = useMemo(() => {
    const buckets = new Map<string, { periodo: string; vencidos: number; a_vencer: number }>();
    const now = new Date();
    const bucketKey = (d: Date) => {
      if (periodo === "semanal") {
        const week = Math.floor((d.getTime() - now.getTime()) / (7 * 86400000));
        return `S${week >= 0 ? "+" : ""}${week}`;
      }
      if (periodo === "trimestral") return `${d.getFullYear()}·T${Math.floor(d.getMonth() / 3) + 1}`;
      if (periodo === "anual") return `${d.getFullYear()}`;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };
    for (const r of filtered) {
      if (!r.proximo_exame) continue;
      const d = new Date(r.proximo_exame);
      const k = bucketKey(d);
      const b = buckets.get(k) ?? { periodo: k, vencidos: 0, a_vencer: 0 };
      if (d < now) b.vencidos++;
      else b.a_vencer++;
      buckets.set(k, b);
    }
    return Array.from(buckets.values()).sort((a, b) => a.periodo.localeCompare(b.periodo)).slice(-12);
  }, [filtered, periodo]);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard gerencial"
        description={isLoading ? "Carregando dados..." : `${total} colaboradores no filtro atual`}
        actions={
          <div className="flex flex-wrap gap-2">
            <FilterSelect value={empresa} onChange={setEmpresa} placeholder="Empresa" options={empresas} />
            <FilterSelect value={unidade} onChange={setUnidade} placeholder="Unidade" options={unidades} />
            <FilterSelect value={setor} onChange={setSetor} placeholder="Setor" options={setores} />
            <Select value={periodo} onValueChange={(v) => setPeriodo(v as typeof periodo)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} label="Total" value={total} tone="neutral" />
        <KpiCard icon={CheckCircle2} label={STATUS_LABEL.em_dia} value={counts.em_dia} pct={pct(counts.em_dia)} tone="ok" />
        <KpiCard icon={AlertTriangle} label={STATUS_LABEL.a_vencer} value={counts.a_vencer} pct={pct(counts.a_vencer)} tone="warn" />
        <KpiCard icon={XCircle} label={STATUS_LABEL.vencido} value={counts.vencido} pct={pct(counts.vencido)} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-medium mb-4">Distribuição de status</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {statusData.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-medium mb-4">Colaboradores por unidade (top 10)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porUnidade}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} />
                <Bar dataKey="em_dia" stackId="a" fill="var(--status-ok)" name="Em dia" />
                <Bar dataKey="a_vencer" stackId="a" fill="var(--status-warn)" name="A vencer" />
                <Bar dataKey="vencido" stackId="a" fill="var(--status-danger)" name="Vencido" />
                <Bar dataKey="sem_exame" stackId="a" fill="var(--status-neutral)" name="Sem exame" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-sm font-medium mb-4">Evolução dos próximos vencimentos</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="a_vencer" stroke="var(--status-warn)" strokeWidth={2} name="A vencer" />
              <Line type="monotone" dataKey="vencidos" stroke="var(--status-danger)" strokeWidth={2} name="Vencidos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageContainer>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">Todas as {placeholder.toLowerCase()}s</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function KpiCard({
  icon: Icon, label, value, pct, tone,
}: {
  icon: typeof Users; label: string; value: number; pct?: number;
  tone: "ok" | "warn" | "danger" | "neutral";
}) {
  const toneClass = {
    ok: "text-status-ok bg-status-ok/15",
    warn: "text-status-warn bg-status-warn/20",
    danger: "text-status-danger bg-status-danger/15",
    neutral: "text-primary bg-primary/10",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight">{value.toLocaleString("pt-BR")}</div>
        {pct !== undefined && <div className="text-sm text-muted-foreground">{pct}%</div>}
      </div>
    </div>
  );
}
