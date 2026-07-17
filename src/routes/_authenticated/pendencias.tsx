import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/colaboradores";
import type { Colaborador } from "@/lib/colaboradores";
import type { Exame, PendenciaMotivo } from "@/lib/exames";
import { MOTIVO_LABEL, MOTIVO_COLORS, TIPO_LABEL } from "@/lib/exames";

export const Route = createFileRoute("/_authenticated/pendencias")({
  component: PendenciasPage,
});

type Row = Exame & { colaborador: Pick<Colaborador, "id" | "nome" | "empresa" | "unidade"> | null };

function PendenciasPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [motivo, setMotivo] = useState<"all" | PendenciaMotivo>("all");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["pendencias-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames")
        .select("*, colaborador:colaboradores!inner(id,nome,empresa,unidade)")
        .eq("status", "pendente")
        .order("updated_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const byMotivo = useMemo(() => {
    const m = new Map<PendenciaMotivo, number>();
    for (const r of rows) {
      const k = (r.motivo_pendencia ?? "outro") as PendenciaMotivo;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).map(([k, v]) => ({ motivo: k, label: MOTIVO_LABEL[k], value: v, color: MOTIVO_COLORS[k] }));
  }, [rows]);

  const filtered = motivo === "all" ? rows : rows.filter((r) => r.motivo_pendencia === motivo);

  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exames").update({
        status: "agendado", motivo_pendencia: null, justificativa: null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendencias-list"] });
      qc.invalidateQueries({ queryKey: ["exames-lista"] });
      toast.success("Pendência resolvida");
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Pendências"
        description="Exames pendentes por motivo, com histórico e ações"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-status-warn-foreground" />
            <span className="text-sm font-medium">Total pendências</span>
          </div>
          <div className="text-3xl font-semibold">{rows.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Exames com status pendente</div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-panel lg:col-span-2">
          <div className="text-sm font-medium mb-2">Distribuição por motivo</div>
          {byMotivo.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">Sem pendências.</div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byMotivo} dataKey="value" nameKey="label" innerRadius={40} outerRadius={72}>
                    {byMotivo.map((d) => <Cell key={d.motivo} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-panel mt-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="min-w-[220px]">
            <Label className="text-xs text-muted-foreground">Motivo</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as "all" | PendenciaMotivo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(MOTIVO_LABEL) as PendenciaMotivo[]).map((m) => (
                  <SelectItem key={m} value={m}>{MOTIVO_LABEL[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left p-2">Colaborador</th>
                <th className="text-left p-2">Empresa/Unidade</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Motivo</th>
                <th className="text-left p-2">Justificativa</th>
                <th className="text-left p-2">Desde</th>
                {isAdmin && <th className="text-right p-2">Ação</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhuma pendência.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/60 hover:bg-muted/30">
                  <td className="p-2 font-medium">{r.colaborador?.nome ?? "—"}</td>
                  <td className="p-2 text-muted-foreground">{r.colaborador?.empresa ?? "—"} · {r.colaborador?.unidade ?? "—"}</td>
                  <td className="p-2">{TIPO_LABEL[r.tipo]}</td>
                  <td className="p-2">{r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : "—"}</td>
                  <td className="p-2 text-muted-foreground max-w-[300px] truncate" title={r.justificativa ?? ""}>{r.justificativa ?? "—"}</td>
                  <td className="p-2">{formatDate(r.updated_at)}</td>
                  {isAdmin && (
                    <td className="p-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => resolve.mutate(r.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Resolver
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
