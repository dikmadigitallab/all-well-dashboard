import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Check, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/colaboradores";
import type { Colaborador } from "@/lib/colaboradores";
import type { Exame, ExameStatus, ExameTipo, PendenciaMotivo } from "@/lib/exames";
import {
  TIPO_LABEL, STATUS_EXAME_LABEL, STATUS_EXAME_CLASSES, MOTIVO_LABEL,
} from "@/lib/exames";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/exames")({
  component: ExamesPage,
});

type Row = Exame & { colaborador: Pick<Colaborador, "id" | "nome" | "empresa" | "unidade"> | null };

function ExamesPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | ExameStatus>("all");
  const [empresa, setEmpresa] = useState<string>("__all__");
  const [openNew, setOpenNew] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["exames-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames")
        .select("*, colaborador:colaboradores!inner(id,nome,empresa,unidade)")
        .order("data_agendada", { ascending: true, nullsFirst: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const empresas = useMemo(
    () => Array.from(new Set(rows.map((r) => r.colaborador?.empresa).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (empresa !== "__all__" && r.colaborador?.empresa !== empresa) return false;
        return true;
      }),
    [rows, statusFilter, empresa],
  );

  const mark = useMutation({
    mutationFn: async (args: { id: string; patch: Partial<Exame> }) => {
      const { error } = await supabase.from("exames").update(args.patch).eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exames-lista"] });
      qc.invalidateQueries({ queryKey: ["pendencias-list"] });
      toast.success("Exame atualizado");
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Agenda de exames"
        description="Convocações, comparecimentos e reagendamentos"
        actions={
          isAdmin && (
            <Dialog open={openNew} onOpenChange={setOpenNew}>
              <DialogTrigger asChild>
                <Button size="sm"><CalendarPlus className="h-4 w-4 mr-2" />Novo exame</Button>
              </DialogTrigger>
              <NewExameDialog onClose={() => setOpenNew(false)} />
            </Dialog>
          )
        }
      />

      <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | ExameStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(STATUS_EXAME_LABEL) as ExameStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_EXAME_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs text-muted-foreground">Empresa</Label>
            <Select value={empresa} onValueChange={setEmpresa}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
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
                <th className="text-left p-2">Agendado</th>
                <th className="text-left p-2">Realizado</th>
                <th className="text-left p-2">Status</th>
                {isAdmin && <th className="text-right p-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum exame encontrado.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/60 hover:bg-muted/30">
                  <td className="p-2 font-medium">{r.colaborador?.nome ?? "—"}</td>
                  <td className="p-2 text-muted-foreground">{r.colaborador?.empresa ?? "—"} · {r.colaborador?.unidade ?? "—"}</td>
                  <td className="p-2">{TIPO_LABEL[r.tipo]}</td>
                  <td className="p-2">{formatDate(r.data_agendada)}</td>
                  <td className="p-2">{formatDate(r.data_realizado)}</td>
                  <td className="p-2">
                    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", STATUS_EXAME_CLASSES[r.status])}>
                      {STATUS_EXAME_LABEL[r.status]}
                    </span>
                    {r.status === "pendente" && r.motivo_pendencia && (
                      <span className="ml-2 text-xs text-muted-foreground">{MOTIVO_LABEL[r.motivo_pendencia]}</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" title="Compareceu"
                          onClick={() => mark.mutate({ id: r.id, patch: { status: "compareceu", data_realizado: new Date().toISOString().slice(0, 10) } })}>
                          <Check className="h-4 w-4 text-status-ok-foreground" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Faltou"
                          onClick={() => mark.mutate({ id: r.id, patch: { status: "faltou" } })}>
                          <X className="h-4 w-4 text-status-danger" />
                        </Button>
                        <MarkPendenteButton id={r.id} onDone={() => qc.invalidateQueries({ queryKey: ["exames-lista"] })} />
                      </div>
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

function MarkPendenteButton({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<PendenciaMotivo>("agendamento");
  const [just, setJust] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const { error } = await supabase.from("exames").update({
      status: "pendente", motivo_pendencia: motivo, justificativa: just || null,
    }).eq("id", id);
    setBusy(false);
    if (error) return toast.error("Erro", { description: error.message });
    toast.success("Pendência registrada");
    setOpen(false); onDone();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Marcar pendência"><AlertCircle className="h-4 w-4 text-status-warn-foreground" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar pendência</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Motivo</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as PendenciaMotivo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(MOTIVO_LABEL) as PendenciaMotivo[]).map((m) => (
                  <SelectItem key={m} value={m}>{MOTIVO_LABEL[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Justificativa (opcional)</Label>
            <Textarea rows={3} value={just} onChange={(e) => setJust(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={busy}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewExameDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [colaboradorId, setColaboradorId] = useState("");
  const [tipo, setTipo] = useState<ExameTipo>("periodico");
  const [dataAgendada, setDataAgendada] = useState("");
  const [clinica, setClinica] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: colabs = [] } = useQuery({
    queryKey: ["colabs-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("colaboradores").select("id,nome,empresa").eq("ativo", true).order("nome").limit(2000);
      if (error) throw error;
      return data as Array<Pick<Colaborador, "id" | "nome" | "empresa">>;
    },
  });

  const submit = async () => {
    if (!colaboradorId) return toast.error("Selecione um colaborador");
    if (!dataAgendada) return toast.error("Informe a data agendada");
    setBusy(true);
    const { error } = await supabase.from("exames").insert({
      colaborador_id: colaboradorId,
      tipo,
      data_agendada: dataAgendada,
      clinica: clinica || null,
      status: "agendado",
    });
    setBusy(false);
    if (error) return toast.error("Erro", { description: error.message });
    toast.success("Exame agendado");
    qc.invalidateQueries({ queryKey: ["exames-lista"] });
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Novo exame</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Colaborador</Label>
          <Select value={colaboradorId} onValueChange={setColaboradorId}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {colabs.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} {c.empresa ? `· ${c.empresa}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as ExameTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TIPO_LABEL) as ExameTipo[]).map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Data agendada</Label>
            <Input type="date" value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Clínica (opcional)</Label>
          <Input value={clinica} onChange={(e) => setClinica(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={busy}>Agendar</Button>
      </DialogFooter>
    </DialogContent>
  );
}
