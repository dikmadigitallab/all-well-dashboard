/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Plus, Download, Search, ArrowUpDown, ArrowUp, ArrowDown, FileText, Loader2, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { authFetch } from "@/lib/custom-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCPF, formatDate, statusBadge, type Colaborador } from "@/lib/colaboradores";
import { cn } from "@/lib/utils";

type SortKey =
  | "nome"
  | "empresa"
  | "area"
  | "funcao"
  | "cpf"
  | "proximo_exame"
  | "dias_para_vencer"
  | "status";
type SortDir = "asc" | "desc";

export const Route = createFileRoute("/_authenticated/colaboradores/")({
  component: ColabList,
});

function ColabList() {
  const { isAdmin } = useAuth();
  const [q, setQ] = useState("");
  const [empresa, setEmpresa] = useState("__all__");
  const [area, setArea] = useState("__all__");
  const [status, setStatus] = useState("__all__");
  const [proxExame, setProxExame] = useState("__all__");
  const [sortKey, setSortKey] = useState<SortKey>("nome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gerando, setGerando] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["colaboradores-list"],
    queryFn: async () => {
      const res = await authFetch("/api/colaboradores");
      if (!res.ok) throw new Error("Erro ao buscar colaboradores");
      const json = await res.json();
      return json.data as Colaborador[];
    },
  });

  const empresas = useMemo(
    () => Array.from(new Set(rows.map((r) => r.empresa).filter(Boolean) as string[])).sort(),
    [rows],
  );
  const areas = useMemo(
    () => Array.from(new Set(rows.map((r) => r.area).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visible = sorted.slice(0, 500).map((r) => r.id);
    const allSelected = visible.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of visible) next.delete(id);
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of visible) next.add(id);
        return next;
      });
    }
  };

  const gerarFormularios = async () => {
    if (selectedIds.size === 0) return;
    setGerando(true);
    try {
      const res = await authFetch("/api/gerar-formularios-colaboradores", {
        method: "POST",
        body: JSON.stringify({ colaborador_ids: Array.from(selectedIds) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao gerar formulários");
      }
      const blob = await res.blob();
      saveAs(blob, `formularios_${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success(`${selectedIds.size} formulários gerados com sucesso!`);
    } catch (err) {
      toast.error("Erro ao gerar formulários", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setGerando(false);
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (empresa !== "__all__" && r.empresa !== empresa) return false;
      if (area !== "__all__" && r.area !== area) return false;
      if (status !== "__all__" && r.status !== status) return false;
      if (proxExame !== "__all__") {
        if (!r.proximo_exame) return false;
        const pe = r.proximo_exame.slice(0, 7);
        if (pe !== proxExame) return false;
      }
      if (!qq) return true;
      const digits = qq.replace(/\D/g, "");
      return (
        r.nome?.toLowerCase().includes(qq) ||
        r.funcao?.toLowerCase().includes(qq) ||
        r.matricula_sap?.toLowerCase().includes(qq) ||
        (digits.length > 0 && r.cpf?.replace(/\D/g, "").includes(digits))
      );
    });
  }, [rows, q, empresa, area, status, proxExame]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (sortKey === "dias_para_vencer") {
        return ((va as number) - (vb as number)) * dir;
      }
      return String(va).localeCompare(String(vb), "pt-BR") * dir;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

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
      "Último exame": r.ultimo_exame,
      "Próximo exame": r.proximo_exame,
      "Dias p/ vencer": r.dias_para_vencer,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Colaboradores");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `colaboradores_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Colaboradores"
        description={
          isLoading ? "Carregando..." : `${filtered.length} de ${rows.length} colaboradores`
        }
        actions={
          <>
            {selectedIds.size > 0 && (
              <span className="text-xs text-muted-foreground self-center">
                {selectedIds.size} selecionado(s)
              </span>
            )}
            <Button variant="outline" size="sm" onClick={gerarFormularios} disabled={selectedIds.size === 0 || gerando}>
              {gerando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {gerando ? "Gerando..." : "Gerar formulários"}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Selecionar
            </Button>
            <Button variant="outline" size="sm" onClick={exportar}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {isAdmin && (
              <Button asChild size="sm">
                <Link to="/colaboradores/$id" params={{ id: "novo" }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo colaborador
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, matrícula ou função..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={empresa} onValueChange={setEmpresa}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as empresas</SelectItem>
            {empresas.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas as áreas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
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
                <th className="px-3 py-3 w-10">
                  <Checkbox
                    checked={sorted.slice(0, 500).length > 0 && sorted.slice(0, 500).every((r) => selectedIds.has(r.id))}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                {[
                  ["nome", "Nome"],
                  ["empresa", "Empresa"],
                  ["area", "Área"],
                  ["funcao", "Função"],
                  ["cpf", "CPF"],
                  ["proximo_exame", "Próx. exame"],
                  ["dias_para_vencer", "Dias"],
                  ["status", "Status"],
                ].map(([key, label]) => {
                  const active = sortKey === key;
                  const Icon = active
                    ? sortDir === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown;
                  return (
                    <th
                      key={key}
                      className="px-4 py-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => toggleSort(key as SortKey)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <Icon className="h-3 w-3" />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 500).map((r) => {
                const b = statusBadge(r.status);
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <Checkbox
                        checked={selectedIds.has(r.id)}
                        onCheckedChange={() => toggleSelect(r.id)}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        to="/colaboradores/$id"
                        params={{ id: r.id }}
                        className="font-medium hover:underline"
                      >
                        {r.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.empresa ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.area ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.funcao ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                      {formatCPF(r.cpf)}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                      {formatDate(r.proximo_exame)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{r.dias_para_vencer ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                          b.className,
                        )}
                      >
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
            Nenhum colaborador encontrado.{" "}
            {isAdmin && (
              <Link to="/importar" className="text-primary hover:underline">
                Importe sua planilha
              </Link>
            )}
            .
          </div>
        )}
      </div>
    </PageContainer>
  );
}
