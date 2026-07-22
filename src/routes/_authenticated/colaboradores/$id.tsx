import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authFetch } from "@/lib/custom-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Colaborador } from "@/lib/colaboradores";

export const Route = createFileRoute("/_authenticated/colaboradores/$id")({
  component: EditColab,
});

interface ColabForm {
  nome: string;
  empresa: string | null;
  area: string | null;
  setor: string | null;
  funcao: string | null;
  matricula_sap: string | null;
  cpf: string | null;
  rg: string | null;
  pis: string | null;
  nascimento: string | null;
  escala_turno: string | null;
  ghe: string | null;
  periodicidade_meses: number | null;
  ultimo_exame: string | null;
  proximo_exame: string | null;
  observacoes: string | null;
}

const EMPTY: ColabForm = {
  nome: "",
  empresa: null,
  area: null,
  setor: null,
  funcao: null,
  matricula_sap: null,
  cpf: null,
  rg: null,
  pis: null,
  nascimento: null,
  escala_turno: null,
  ghe: null,
  periodicidade_meses: 12,
  ultimo_exame: null,
  proximo_exame: null,
  observacoes: null,
};

function EditColab() {
  const { id } = useParams({ from: "/_authenticated/colaboradores/$id" });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isNew = id === "novo";

  const [form, setForm] = useState<ColabForm>(EMPTY);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["colab", id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await authFetch(`/api/colaboradores/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar colaborador");
      const json = await res.json();
      return json.data as Colaborador | null;
    },
    enabled: !isNew,
  });

  // Normaliza datas ISO vindas do Prisma para YYYY-MM-DD
  useEffect(() => {
    if (!data) return;
    setForm({
      ...data,
      ultimo_exame: data.ultimo_exame?.slice(0, 10) ?? null,
      proximo_exame: data.proximo_exame?.slice(0, 10) ?? null,
      nascimento: data.nascimento?.slice(0, 10) ?? null,
    });
  }, [data]);

  const set = <K extends keyof ColabForm>(k: K, v: ColabForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
    setBusy(true);
    try {
      if (isNew) {
        const res = await authFetch("/api/colaboradores", {
          method: "POST",
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const json = await res.json();
        toast.success("Colaborador criado");
        navigate({ to: "/colaboradores/$id", params: { id: json.data.id } });
      } else {
        const {
          id: _drop,
          created_at: _c,
          updated_at: _u,
          created_by: _cb,
          dias_para_vencer: _d,
          status: _s,
          exames: _e,
          alertas: _a,
          ...upd
        } = form as Colaborador & { exames?: unknown; alertas?: unknown };
        const res = await authFetch(`/api/colaboradores/${id}`, {
          method: "PUT",
          body: JSON.stringify(upd),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        toast.success("Alterações salvas");
      }
    } catch (err) {
      toast.error("Erro ao salvar", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      const res = await authFetch(`/api/colaboradores/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Colaborador removido");
      navigate({ to: "/colaboradores" });
    } catch (err) {
      toast.error("Erro ao remover", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  };

  if (!isNew && isLoading) {
    return (
      <PageContainer>
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </PageContainer>
    );
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
              <Link to="/colaboradores">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            {!isNew && isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover colaborador?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é permanente e removerá também o histórico de exames.
                    </AlertDialogDescription>
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
            <Input
              value={form.matricula_sap ?? ""}
              onChange={(e) => set("matricula_sap", e.target.value || null)}
            />
          </Field>

          <Field label="Empresa">
            <Input
              value={form.empresa ?? ""}
              onChange={(e) => set("empresa", e.target.value || null)}
            />
          </Field>
          <Field label="Área">
            <Input value={form.area ?? ""} onChange={(e) => set("area", e.target.value || null)} />
          </Field>

          <Field label="Setor">
            <Input
              value={form.setor ?? ""}
              onChange={(e) => set("setor", e.target.value || null)}
            />
          </Field>
          <Field label="Função">
            <Input
              value={form.funcao ?? ""}
              onChange={(e) => set("funcao", e.target.value || null)}
            />
          </Field>
          <Field label="Escala / Turno">
            <Input
              value={form.escala_turno ?? ""}
              onChange={(e) => set("escala_turno", e.target.value || null)}
            />
          </Field>

          <Field label="CPF">
            <Input value={form.cpf ?? ""} onChange={(e) => set("cpf", e.target.value || null)} />
          </Field>
          <Field label="RG">
            <Input value={form.rg ?? ""} onChange={(e) => set("rg", e.target.value || null)} />
          </Field>
          <Field label="PIS">
            <Input value={form.pis ?? ""} onChange={(e) => set("pis", e.target.value || null)} />
          </Field>

          <Field label="Data de nascimento">
            <Input
              type="date"
              value={form.nascimento ?? ""}
              onChange={(e) => set("nascimento", e.target.value || null)}
            />
          </Field>
          <Field label="GHE">
            <Input value={form.ghe ?? ""} onChange={(e) => set("ghe", e.target.value || null)} />
          </Field>
          <Field label="Periodicidade (meses)">
            <Input
              type="number"
              min={1}
              value={form.periodicidade_meses ?? 12}
              onChange={(e) => {
                const meses = Number(e.target.value) || 12;
                set("periodicidade_meses", meses);
                if (form.ultimo_exame) {
                  const d = new Date(form.ultimo_exame);
                  d.setMonth(d.getMonth() + meses);
                  set("proximo_exame", d.toISOString().slice(0, 10));
                }
              }}
            />
          </Field>

          <Field label="Último exame">
            <Input
              type="date"
              value={form.ultimo_exame ?? ""}
              onChange={(e) => {
                const val = e.target.value || null;
                set("ultimo_exame", val);
                if (val && form.periodicidade_meses) {
                  const d = new Date(val);
                  d.setMonth(d.getMonth() + form.periodicidade_meses);
                  set("proximo_exame", d.toISOString().slice(0, 10));
                } else {
                  set("proximo_exame", null);
                }
              }}
            />
          </Field>
          <Field label="Próximo exame">
            <Input
              type="date"
              readOnly
              value={form.proximo_exame ?? ""}
              className="cursor-default opacity-80"
            />
          </Field>

          <Field label="Observações" className="md:col-span-3">
            <Textarea
              rows={3}
              value={form.observacoes ?? ""}
              onChange={(e) => set("observacoes", e.target.value || null)}
            />
          </Field>
        </fieldset>

        {isAdmin && (
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={busy}>
              <Save className="h-4 w-4 mr-2" />
              {isNew ? "Criar colaborador" : "Salvar alterações"}
            </Button>
          </div>
        )}
      </form>
    </PageContainer>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
