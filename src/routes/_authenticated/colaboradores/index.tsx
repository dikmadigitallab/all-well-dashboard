/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Plus, Download, Search, ArrowUpDown, ArrowUp, ArrowDown, FileText, Loader2, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const perPage = 8;

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

  // Reseta página quando filtros ou ordenação mudam
  const resetPage = useCallback(() => setPage(1), []);
  useEffect(() => resetPage(), [q, empresa, area, status, proxExame, sortKey, sortDir, resetPage]);

  const toggleSelectAll = () => {
    const visible = paginado.map((r) => r.id);
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

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginado = useMemo(
    () => sorted.slice((page - 1) * perPage, page * perPage),
    [sorted, page, perPage],
  );

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
          isLoading
            ? "Carregando..."
            : `${filtered.length} colaboradores · Página ${page} de ${totalPages}`
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
                    checked={paginado.length > 0 && paginado.every((r) => selectedIds.has(r.id))}
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
              {paginado.map((r) => {
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
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, sorted.length)} de {sorted.length} resultados
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {(() => {
                const pages: (number | string)[] = [];
                const delta = 2;
                const start = Math.max(1, page - delta);
                const end = Math.min(totalPages, page + delta);
                if (start > 1) pages.push(1);
                if (start > 2) pages.push("…");
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < totalPages - 1) pages.push("…");
                if (end < totalPages) pages.push(totalPages);
                return pages.map((p, i) =>
                  typeof p === "string" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "ghost"}
                      size="sm"
                      className="h-7 min-w-[28px] px-1 text-xs"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ),
                );
              })()}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
