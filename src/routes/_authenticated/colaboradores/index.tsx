import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Plus, Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCPF, formatDate, statusBadge, type Colaborador } from "@/lib/colaboradores";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/colaboradores/")({
  component: ColabList,
});

function ColabList() {
  const { isAdmin } = useAuth();
  const [q, setQ] = useState("");
  const [empresa, setEmpresa] = useState("__all__");
  const [unidade, setUnidade] = useState("__all__");
  const [status, setStatus] = useState("__all__");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["colaboradores-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colaboradores")
        .select("*")
        .order("nome", { ascending: true })
        .limit(5000);
      if (error) throw error;
      return data as Colaborador[];
    },
  });

  const empresas = useMemo(() => Array.from(new Set(rows.map((r) => r.empresa).filter(Boolean) as string[])).sort(), [rows]);
  const unidades = useMemo(() => Array.from(new Set(rows.map((r) => r.unidade).filter(Boolean) as string[])).sort(), [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (empresa !== "__all__" && r.empresa !== empresa) return false;
      if (unidade !== "__all__" && r.unidade !== unidade) return false;
      if (status !== "__all__" && r.status !== status) return false;
      if (!qq) return true;
      return (
        r.nome?.toLowerCase().includes(qq) ||
        r.cpf?.replace(/\D/g, "").includes(qq.replace(/\D/g, "")) ||
        r.matricula_sap?.toLowerCase().includes(qq) ||
        r.funcao?.toLowerCase().includes(qq)
      );
    });
  }, [rows, q, empresa, unidade, status]);

  const exportar = () => {
    const data = filtered.map((r) => ({
      Nome: r.nome,
      Empresa: r.empresa,
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
      "Periodicidade (meses)": r.periodicidade_meses,
      Unidade: r.unidade,
      "Último exame": r.ultimo_exame,
      "Próximo exame": r.proximo_exame,
      "Dias p/ vencer": r.dias_para_vencer,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Colaboradores");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `colaboradores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Colaboradores"
        description={isLoading ? "Carregando..." : `${filtered.length} de ${rows.length} colaboradores`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportar}><Download className="h-4 w-4 mr-2" />Exportar</Button>
            {isAdmin && (
              <Button asChild size="sm">
                <Link to="/colaboradores/$id" params={{ id: "novo" }}><Plus className="h-4 w-4 mr-2" />Novo colaborador</Link>
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF, matrícula ou função..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={empresa} onValueChange={setEmpresa}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as empresas</SelectItem>
            {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={unidade} onValueChange={setUnidade}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as unidades</SelectItem>
            {unidades.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os status</SelectItem>
            <SelectItem value="em_dia">Em dia</SelectItem>
            <SelectItem value="a_vencer">A vencer</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="sem_exame">Sem exame</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">Empresa</th>
                <th className="text-left px-4 py-3 font-medium">Unidade</th>
                <th className="text-left px-4 py-3 font-medium">Função</th>
                <th className="text-left px-4 py-3 font-medium">CPF</th>
                <th className="text-left px-4 py-3 font-medium">Próx. exame</th>
                <th className="text-left px-4 py-3 font-medium">Dias</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((r) => {
                const b = statusBadge(r.status);
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <Link to="/colaboradores/$id" params={{ id: r.id }} className="font-medium hover:underline">
                        {r.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.empresa ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.unidade ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.funcao ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{formatCPF(r.cpf)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{formatDate(r.proximo_exame)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{r.dias_para_vencer ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", b.className)}>
                        {b.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 500 && (
          <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
            Mostrando primeiros 500 resultados. Refine os filtros para ver mais.
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Nenhum colaborador encontrado. {isAdmin && (
              <Link to="/importar" className="text-primary hover:underline">Importe sua planilha</Link>
            )}.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
