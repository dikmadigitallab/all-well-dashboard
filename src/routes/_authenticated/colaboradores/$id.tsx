import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Colaborador, ColaboradorInsert } from "@/lib/colaboradores";
import { formatDate } from "@/lib/colaboradores";
import type { Exame } from "@/lib/exames";
import { TIPO_LABEL, STATUS_EXAME_LABEL, STATUS_EXAME_CLASSES, MOTIVO_LABEL } from "@/lib/exames";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/colaboradores/$id")({
  component: EditColab,
});

const EMPTY: ColaboradorInsert = {
  nome: "",
  empresa: null, area: null, setor: null, funcao: null,
  matricula_sap: null, cpf: null, rg: null, pis: null,
  nascimento: null, escala_turno: null, ghe: null,
  periodicidade_meses: 12, unidade: null,
  ultimo_exame: null, proximo_exame: null, observacoes: null,
};

function EditColab() {
  const { id } = useParams({ from: "/_authenticated/colaboradores/$id" });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isNew = id === "novo";

  const [form, setForm] = useState<ColaboradorInsert>(EMPTY);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["colab", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from("colaboradores").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Colaborador | null;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof ColaboradorInsert>(k: K, v: ColaboradorInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
    setBusy(true);
    if (isNew) {
      const { data: ins, error } = await supabase.from("colaboradores").insert(form).select("id").single();
      setBusy(false);
      if (error) return toast.error("Erro ao salvar", { description: error.message });
      toast.success("Colaborador criado");
      navigate({ to: "/colaboradores/$id", params: { id: ins.id } });
    } else {
      const { id: _drop, created_at: _c, updated_at: _u, created_by: _cb, dias_para_vencer: _d, status: _s, ...upd } = form as Colaborador;
      const { error } = await supabase.from("colaboradores").update(upd).eq("id", id);
      setBusy(false);
      if (error) return toast.error("Erro ao salvar", { description: error.message });
      toast.success("Alterações salvas");
    }
  };

  const remove = async () => {
    const { error } = await supabase.from("colaboradores").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover", { description: error.message });
    toast.success("Colaborador removido");
    navigate({ to: "/colaboradores" });
  };

  if (!isNew && isLoading) {
    return <PageContainer><div className="text-sm text-muted-foreground">Carregando...</div></PageContainer>;
  }

  const readOnly = !isAdmin;

  return (
    <PageContainer>
      <PageHeader
        title={isNew ? "Novo colaborador" : form.nome || "Colaborador"}
        description={isNew ? "Preencha os dados do colaborador" : "Detalhes e edição do cadastro"}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/colaboradores"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
            </Button>
            {!isNew && isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Remover</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover colaborador?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação é permanente e removerá também o histórico de exames.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={remove}>Remover</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        }
      />

      <form onSubmit={save} className="rounded-lg border border-border bg-card p-6 shadow-panel">
        {readOnly && (
          <div className="mb-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Você está em modo somente leitura (perfil Gestor).
          </div>
        )}
        <fieldset disabled={readOnly || busy} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome completo *" className="md:col-span-2">
            <Input required value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} />
          </Field>
          <Field label="Matrícula SAP">
            <Input value={form.matricula_sap ?? ""} onChange={(e) => set("matricula_sap", e.target.value || null)} />
          </Field>

          <Field label="Empresa"><Input value={form.empresa ?? ""} onChange={(e) => set("empresa", e.target.value || null)} /></Field>
          <Field label="Unidade"><Input value={form.unidade ?? ""} onChange={(e) => set("unidade", e.target.value || null)} /></Field>
          <Field label="Área"><Input value={form.area ?? ""} onChange={(e) => set("area", e.target.value || null)} /></Field>

          <Field label="Setor"><Input value={form.setor ?? ""} onChange={(e) => set("setor", e.target.value || null)} /></Field>
          <Field label="Função"><Input value={form.funcao ?? ""} onChange={(e) => set("funcao", e.target.value || null)} /></Field>
          <Field label="Escala / Turno"><Input value={form.escala_turno ?? ""} onChange={(e) => set("escala_turno", e.target.value || null)} /></Field>

          <Field label="CPF"><Input value={form.cpf ?? ""} onChange={(e) => set("cpf", e.target.value || null)} /></Field>
          <Field label="RG"><Input value={form.rg ?? ""} onChange={(e) => set("rg", e.target.value || null)} /></Field>
          <Field label="PIS"><Input value={form.pis ?? ""} onChange={(e) => set("pis", e.target.value || null)} /></Field>

          <Field label="Data de nascimento"><Input type="date" value={form.nascimento ?? ""} onChange={(e) => set("nascimento", e.target.value || null)} /></Field>
          <Field label="GHE"><Input value={form.ghe ?? ""} onChange={(e) => set("ghe", e.target.value || null)} /></Field>
          <Field label="Periodicidade (meses)">
            <Input type="number" min={1} value={form.periodicidade_meses ?? 12} onChange={(e) => set("periodicidade_meses", Number(e.target.value) || 12)} />
          </Field>

          <Field label="Último exame">
            <Input type="date" value={form.ultimo_exame ?? ""} onChange={(e) => set("ultimo_exame", e.target.value || null)} />
          </Field>
          <Field label="Próximo exame">
            <Input type="date" value={form.proximo_exame ?? ""} onChange={(e) => set("proximo_exame", e.target.value || null)} />
          </Field>

          <Field label="Observações" className="md:col-span-3">
            <Textarea rows={3} value={form.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value || null)} />
          </Field>
        </fieldset>

        {isAdmin && (
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={busy}>
              <Save className="h-4 w-4 mr-2" />{isNew ? "Criar colaborador" : "Salvar alterações"}
            </Button>
          </div>
        )}
      </form>

      {!isNew && <HistoricoExames colaboradorId={id} />}
    </PageContainer>
  );
}

function HistoricoExames({ colaboradorId }: { colaboradorId: string }) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["exames-colab", colaboradorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames")
        .select("*")
        .eq("colaborador_id", colaboradorId)
        .order("data_agendada", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Exame[];
    },
  });

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-panel">
      <h2 className="text-base font-semibold mb-3">Histórico de exames</h2>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nenhum exame registrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Agendado</th>
                <th className="text-left p-2">Realizado</th>
                <th className="text-left p-2">Vencimento</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Motivo/Just.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="p-2">{TIPO_LABEL[r.tipo]}</td>
                  <td className="p-2">{formatDate(r.data_agendada)}</td>
                  <td className="p-2">{formatDate(r.data_realizado)}</td>
                  <td className="p-2">{formatDate(r.data_vencimento)}</td>
                  <td className="p-2">
                    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs", STATUS_EXAME_CLASSES[r.status])}>
                      {STATUS_EXAME_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="p-2 text-muted-foreground text-xs">
                    {r.motivo_pendencia ? MOTIVO_LABEL[r.motivo_pendencia] : ""}
                    {r.justificativa ? ` — ${r.justificativa}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
