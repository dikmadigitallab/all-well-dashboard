import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CalendarPlus,
  Search,
  Loader2,
  Send,
  ChevronDown,
  X,
  Check,
  Trash2,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { authFetch } from "@/lib/custom-auth";
import { formatDate } from "@/lib/colaboradores";
import { registrarHistorico } from "@/lib/historico";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/agendar-exames")({
  component: AgendarExames,
});

// ─── Types ───

interface Colaborador {
  id: string;
  nome: string;
  empresa: string | null;
  cpf: string | null;
}

interface ExameAgendado {
  id: string;
  colaborador_id: string;
  tipo: string;
  data_agendada: string | null;
  data_1_etapa: string | null;
  data_2_etapa: string | null;
  status: string;
  clinica: string | null;
  justificativa_falta: string | null;
  etapa_faltou: number | null;
  created_at: string;
  colaborador: {
    id: string;
    nome: string;
    empresa: string | null;
    cpf: string | null;
  };
}

interface EmailContato {
  id: string;
  email: string;
  nome: string | null;
}

// ─── Page ───

function AgendarExames() {
  const queryClient = useQueryClient();

  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dataSegundaEtapa, setDataSegundaEtapa] = useState<Date | undefined>(undefined);
  const [colaboradorId, setColaboradorId] = useState("");
  const [colaboradorNome, setColaboradorNome] = useState("");
  const [colabSearch, setColabSearch] = useState("");
  const [colabOpen, setColabOpen] = useState(false);
  const [tipo, setTipo] = useState("periodico");
  const [clinica, setClinica] = useState("");
  const [editingExameId, setEditingExameId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const colabInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: exames = [], isLoading: loadingExames } = useQuery<ExameAgendado[]>({
    queryKey: ["exames-agendados"],
    queryFn: async () => {
      const res = await authFetch("/api/exames?status=agendado");
      if (!res.ok) throw new Error("Erro ao buscar exames");
      const json = await res.json();
      return json.data as ExameAgendado[];
    },
  });

  const { data: colaboradores = [] } = useQuery<Colaborador[]>({
    queryKey: ["colaboradores-list"],
    queryFn: async () => {
      const res = await authFetch("/api/colaboradores");
      if (!res.ok) throw new Error("Erro ao buscar colaboradores");
      const json = await res.json();
      return json.data as Colaborador[];
    },
  });

  const { data: emailsContato = [] } = useQuery<EmailContato[]>({
    queryKey: ["emails-contato"],
    queryFn: async () => {
      const res = await authFetch("/api/emails-contato");
      if (!res.ok) throw new Error("Erro ao buscar emails");
      const json = await res.json();
      return json.data as EmailContato[];
    },
  });

  // Mutations
  const criarExame = useMutation({
    mutationFn: async (payload: {
      colaborador_id: string;
      data_agendada: string;
      tipo: string;
      clinica?: string;
    }) => {
      const res = await authFetch("/api/exames", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao agendar");
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
      queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
      queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
      // Registra histórico do agendamento
      const exame = result?.data;
      if (exame) {
        registrarHistorico({
          colaboradorId: exame.colaborador_id,
          exameId: exame.id,
          evento: "agendado",
          descricao: `Exame agendado para ${format(new Date(exame.data_agendada + "T12:00:00"), "dd/MM/yyyy")}`,
          detalhes: { tipo: exame.tipo, data_agendada: exame.data_agendada },
        });
      }
      // Limpa form
      setDate(undefined);
      setDataSegundaEtapa(undefined);
      setColaboradorId("");
      setColaboradorNome("");
      setColabSearch("");
      setEmail("");
      toast.success("Exame agendado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Mutation para atualizar exame existente (reagendamento)
  const updateExame = useMutation({
    mutationFn: async ({
      exameId,
      payload,
    }: {
      exameId: string;
      payload: Record<string, unknown>;
    }) => {
      const res = await authFetch(`/api/exames/${exameId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao reagendar");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
      queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
      queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
      // Limpa form
      limparForm();
      toast.success("Exame reagendado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const salvarEmail = useMutation({
    mutationFn: async (payload: { email: string; nome?: string }) => {
      const res = await authFetch("/api/emails-contato", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar email");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails-contato"] });
    },
  });

  const enviarConfirmacao = useMutation({
    mutationFn: async (payload: { exame_id: string; email: string }) => {
      const res = await authFetch("/api/exames/enviar-confirmacao", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao enviar");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Confirmação enviada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const cancelarExame = useMutation({
    mutationFn: async (exameId: string) => {
      const res = await authFetch(`/api/exames/${exameId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "cancelado",
          data_1_etapa: null,
          data_2_etapa: null,
          justificativa_falta: null,
          etapa_faltou: null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao cancelar exame");
      }
      return res.json();
    },
    onSuccess: (_data, exameId) => {
      queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
      queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
      queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
      toast.success("Exame desmarcado com sucesso!");
      // Busca o exame para saber o colaborador_id
      const exame = exames.find((e) => e.id === exameId);
      if (exame) {
        registrarHistorico({
          colaboradorId: exame.colaborador_id,
          exameId: exame.id,
          evento: "cancelado",
          descricao: "Exame desmarcado/cancelado",
        });
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Colaborador search filter
  const colabFiltrados = useMemo(
    () =>
      colaboradores
        .filter(
          (c) =>
            c.nome.toLowerCase().includes(colabSearch.toLowerCase()) ||
            (c.cpf || "").includes(colabSearch.replace(/\D/g, "")),
        )
        .slice(0, 30),
    [colaboradores, colabSearch],
  );

  // Colaborador selecionado
  const colabSelecionado = useMemo(
    () => colaboradores.find((c) => c.id === colaboradorId),
    [colaboradores, colaboradorId],
  );

  // Agrupa exames por colaborador (para exibição em cards)
  const examesPorColaborador = useMemo(() => {
    const map = new Map<string, { colaborador: ExameAgendado["colaborador"]; exames: ExameAgendado[] }>();
    for (const ex of exames) {
      const entry = map.get(ex.colaborador_id) ?? {
        colaborador: ex.colaborador,
        exames: [],
      };
      entry.exames.push(ex);
      map.set(ex.colaborador_id, entry);
    }
    return Array.from(map.entries())
      .map(([_, entry]) => entry)
      .sort((a, b) => a.colaborador.nome.localeCompare(b.colaborador.nome));
  }, [exames]);

  // Datas que têm exames
  const datasComExames = useMemo(
    () => exames.map((e) => (e.data_agendada ? e.data_agendada.slice(0, 10) : "")).filter(Boolean),
    [exames],
  );

  // ─── Handlers ───

  const handleAgendar = async (comEnvio = false) => {
    if (!date) {
      toast.error("Selecione uma data");
      return;
    }
    if (!colaboradorId) {
      toast.error("Selecione um colaborador");
      return;
    }

    const data1 = format(date, "yyyy-MM-dd");
    const data2 = dataSegundaEtapa ? format(dataSegundaEtapa, "yyyy-MM-dd") : null;

    if (editingExameId) {
      // ── Reagendamento: atualiza exame existente ──
      await updateExame.mutateAsync({
        exameId: editingExameId,
        payload: {
          data_agendada: data1,
          data_1_etapa: data1,
          data_2_etapa: data2,
          clinica: clinica || null,
        },
      });
    } else {
      // ── Novo agendamento ──
      const result = await criarExame.mutateAsync({
        colaborador_id: colaboradorId,
        data_agendada: data1,
        data_1_etapa: data1,
        data_2_etapa: data2 ?? undefined,
        tipo,
        clinica: clinica || undefined,
      });

      if (comEnvio) {
        console.log("[handleAgendar] comEnvio=true, result?.data?.id:", result?.data?.id, "email:", email, "emailNovo:", emailNovo);

        if (!result?.data?.id) {
          toast.error("Exame criado mas sem ID para enviar confirmação");
          return;
        }

        let emailParaEnviar = email;

        // Se tem email novo não salvo, salva primeiro
        if (emailNovo && !emailsContato.find((e) => e.email === emailNovo.toLowerCase())) {
          const saved = await salvarEmail.mutateAsync({ email: emailNovo });
          emailParaEnviar = saved.data.email;
          setEmailNovo("");
        }

        if (!emailParaEnviar) {
          toast.error("Selecione ou digite um email para enviar a confirmação");
          return;
        }

        console.log("[handleAgendar] chamando enviarConfirmacao com:", { exame_id: result.data.id, email: emailParaEnviar });

        enviarConfirmacao.mutate(
          { exame_id: result.data.id, email: emailParaEnviar },
          {
            onSuccess: (data) => {
              console.log("[enviarConfirmacao] onSuccess:", data);
              toast.success("Confirmação enviada com sucesso!");
            },
            onError: (err) => {
              console.error("[enviarConfirmacao] onError:", err);
              toast.error(err.message);
            },
          },
        );
      }
    }
  };

  const handleAddEmail = async () => {
    const novo = emailNovo.trim().toLowerCase();
    if (!novo) return;
    if (emailsContato.find((e) => e.email === novo)) {
      setEmail(novo);
      setEmailNovo("");
      setEmailOpen(false);
      return;
    }
    await salvarEmail.mutateAsync({ email: novo });
    setEmail(novo);
    setEmailNovo("");
    setEmailOpen(false);
    toast.success("Email salvo na lista!");
  };

  const agendando = criarExame.isPending || updateExame.isPending;

  const limparForm = () => {
    setDate(undefined);
    setDataSegundaEtapa(undefined);
    setColaboradorId("");
    setColaboradorNome("");
    setColabSearch("");
    setEditingExameId(null);
    setEmail("");
    setTipo("periodico");
    setClinica("");
  };

  const handleEditExame = (ex: ExameAgendado) => {
    setEditingExameId(ex.id);
    setDate(ex.data_agendada ? new Date(ex.data_agendada + "T12:00:00") : undefined);
    setDataSegundaEtapa(ex.data_2_etapa ? new Date(ex.data_2_etapa + "T12:00:00") : undefined);
    setColaboradorId(ex.colaborador_id);
    setColaboradorNome(ex.colaborador.nome);
    setTipo(ex.tipo);
    setClinica(ex.clinica ?? "");
    setEmail("");
    setColabSearch(ex.colaborador.nome);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Agendar Exames ASO"
        description="Agende exames e envie confirmações por email"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Formulário ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Data 1ª etapa */}
          <div className="space-y-2">
            <Label>Data 1ª etapa</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {date ? format(date, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarUI
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  modifiers={{
                    hasExam: (d) =>
                      datasComExames.includes(format(d, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    hasExam: "border-2 border-primary",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data 2ª etapa */}
          <div className="space-y-2">
            <Label>Data 2ª etapa</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataSegundaEtapa && "text-muted-foreground",
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {dataSegundaEtapa ? format(dataSegundaEtapa, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarUI
                  mode="single"
                  selected={dataSegundaEtapa}
                  onSelect={setDataSegundaEtapa}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Colaborador */}
          <div className="space-y-2">
            <Label>Colaborador</Label>
            <Popover open={colabOpen} onOpenChange={setColabOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={colabOpen}
                  className="w-full justify-between"
                >
                  {colabSelecionado ? (
                    <span className="truncate">{colabSelecionado.nome}</span>
                  ) : (
                    <span className="text-muted-foreground">Buscar colaborador...</span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar por nome ou CPF..."
                    value={colabSearch}
                    onValueChange={setColabSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum colaborador encontrado</CommandEmpty>
                    <CommandGroup>
                      {colabFiltrados.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.id}
                          onSelect={(value) => {
                            setColaboradorId(value);
                            setColabOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              colaboradorId === c.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{c.nome}</span>
                            {c.empresa && (
                              <span className="text-xs text-muted-foreground">
                                {c.empresa}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de exame</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="periodico">Periódico</SelectItem>
                <SelectItem value="admissional">Admissional</SelectItem>
                <SelectItem value="demissional">Demissional</SelectItem>
                <SelectItem value="retorno_ao_trabalho">Retorno ao trabalho</SelectItem>
                <SelectItem value="mudanca_riscos">Mudança de riscos</SelectItem>
                <SelectItem value="complementar">Complementar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clínica */}
          <div className="space-y-2">
            <Label>Clínica (opcional)</Label>
            <Input
              placeholder="Nome da clínica"
              value={clinica}
              onChange={(e) => setClinica(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email para confirmação</Label>
            <Popover open={emailOpen} onOpenChange={setEmailOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {email ? (
                    <span className="truncate">{email}</span>
                  ) : emailNovo ? (
                    <span className="truncate text-muted-foreground">
                      Novo: {emailNovo}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Selecionar ou digitar novo email...
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 space-y-2">
                {/* Lista de emails salvos */}
                {emailsContato.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {emailsContato.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setEmail(c.email);
                          setEmailNovo("");
                          setEmailOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                          email === c.email && "bg-accent font-medium",
                        )}
                      >
                        {c.email}
                        {c.nome && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({c.nome})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Adicionar novo email */}
                <div className="flex gap-2">
                  <Input
                    placeholder="novo@email.com"
                    value={emailNovo}
                    onChange={(e) => setEmailNovo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddEmail}
                    disabled={!emailNovo.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Digite um novo email e clique em ✓ para salvá-lo na lista
                </p>
              </PopoverContent>
            </Popover>
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-2">
            {editingExameId && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={limparForm}
                disabled={agendando}
              >
                <X className="h-3 w-3 mr-1" /> Cancelar edição
              </Button>
            )}
            <Button
              className="w-full"
              onClick={() => handleAgendar(false)}
              disabled={agendando || !date || !colaboradorId}
            >
              {agendando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {editingExameId ? "Reagendando..." : "Agendando..."}
                </>
              ) : editingExameId ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reagendar
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-2" /> Agendar
                </>
              )}
            </Button>

            {!editingExameId && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleAgendar(true)}
                disabled={agendando || !date || !colaboradorId}
              >
                <Send className="h-4 w-4 mr-2" /> Agendar e enviar confirmação
              </Button>
            )}
          </div>
        </div>

        {/* ── Cards de colaboradores com agendamentos ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos por colaborador
            <span className="text-muted-foreground font-normal ml-1">
              ({exames.length} exames)
            </span>
          </div>

          {loadingExames ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground rounded-lg border border-border bg-card">
              <Loader2 className="h-4 w-4 mx-auto mb-2 animate-spin" />
              Carregando...
            </div>
          ) : exames.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground rounded-lg border border-border bg-card">
              Nenhum exame agendado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {examesPorColaborador.map(({ colaborador, exames: exams }) => (
                <Card key={colaborador.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    {/* Cabeçalho do colaborador */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{colaborador.nome}</div>
                        {colaborador.empresa && (
                          <div className="text-xs text-muted-foreground">{colaborador.empresa}</div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {exams.length} {exams.length === 1 ? "exame" : "exames"}
                      </Badge>
                    </div>

                    {/* Lista de exames do colaborador */}
                    <div className="space-y-2">
                      {exams.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium">
                              {ex.tipo.replace(/_/g, " ")}
                              {ex.clinica && <span className="text-muted-foreground"> · {ex.clinica}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ex.data_1_etapa && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  1ª: {format(new Date(ex.data_1_etapa.slice(0, 10) + "T12:00:00"), "dd/MM")}
                                </Badge>
                              )}
                              {ex.data_2_etapa && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  2ª: {format(new Date(ex.data_2_etapa.slice(0, 10) + "T12:00:00"), "dd/MM")}
                                </Badge>
                              )}
                              {!ex.data_1_etapa && !ex.data_2_etapa && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  {ex.data_agendada
                                    ? format(new Date(ex.data_agendada.slice(0, 10) + "T12:00:00"), "dd/MM")
                                    : "—"}
                                </Badge>
                              )}
                              {ex.justificativa_falta && (
                                <Badge variant="destructive" className="text-[10px] h-4 px-1">
                                  Faltou {ex.etapa_faltou}ª etapa
                                </Badge>
                              )}
                            </div>
                            {ex.justificativa_falta && (
                              <div className="text-[10px] text-destructive mt-0.5 italic">
                                {ex.justificativa_falta}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                              onClick={() => handleEditExame(ex)}
                              title="Reagendar"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              disabled={cancelarExame.isPending}
                              onClick={() => {
                                if (window.confirm(`Desmarcar exame de ${colaborador.nome}?`)) {
                                  cancelarExame.mutate(ex.id);
                                }
                              }}
                              title="Desmarcar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
