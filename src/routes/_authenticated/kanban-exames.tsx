import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  CalendarPlus,
  ClipboardCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Calendar,
  Clock,
  Ban,
  Loader2,
} from "lucide-react";
import { authFetch } from "@/lib/custom-auth";
import { formatDate } from "@/lib/colaboradores";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/_authenticated/kanban-exames")({
  component: KanbanExames,
});

// ─── Types ───

interface Colaborador {
  id: string;
  nome: string;
  empresa: string | null;
  cpf: string | null;
  status: string | null;
  proximo_exame: string | null;
  ativo: boolean;
}

interface Exame {
  id: string;
  colaborador_id: string;
  tipo: string;
  data_agendada: string | null;
  data_1_etapa: string | null;
  data_2_etapa: string | null;
  data_realizado: string | null;
  status: string;
  clinica: string | null;
  justificativa_falta: string | null;
  etapa_faltou: number | null;
  colaborador: {
    id: string;
    nome: string;
    empresa: string | null;
    cpf: string | null;
  };
}

// ─── Column config ───

interface ColumnDef {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "a_vencer",
    label: "A vencer",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  {
    id: "vencidos",
    label: "Vencidos",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
  {
    id: "a_agendar",
    label: "A agendar",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-800",
    dotColor: "bg-slate-500",
  },
  {
    id: "agendados",
    label: "Agendados",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  {
    id: "primeira_etapa",
    label: "1ª etapa",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
  },
  {
    id: "segunda_etapa",
    label: "2ª etapa",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    dotColor: "bg-indigo-500",
  },
  {
    id: "pendente",
    label: "Pendente",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    dotColor: "bg-orange-500",
  },
  {
    id: "liberado",
    label: "Liberado",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-500",
  },
];

// ─── Helpers ───

function isWithinDays(dateStr: string | null, days: number): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const diff = date.getTime() - Date.now();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCardDate(
  colId: string,
  item: ColaboradorCard | ExameCard,
): string | null {
  if ("proximo_exame" in item) return item.proximo_exame;
  if ("data_agendada" in item) return item.data_agendada ?? item.data_1_etapa ?? item.data_2_etapa ?? null;
  return null;
}

// ─── Card data types ───

interface ColaboradorCard {
  type: "colaborador";
  id: string;
  colaboradorId: string;
  nome: string;
  empresa: string | null;
  proximo_exame: string | null;
}

interface ExameCard {
  type: "exame";
  id: string;
  exameId: string;
  colaboradorId: string;
  nome: string;
  empresa: string | null;
  data_agendada: string | null;
  data_1_etapa: string | null;
  data_2_etapa: string | null;
  status: string;
}

type CardData = ColaboradorCard | ExameCard;

// ─── Faltou Dialog ───

function FaltouDialog({
  open,
  onClose,
  exameId,
  colaboradorNome,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  exameId: string;
  colaboradorNome: string;
  onConfirm: (payload: { etapa: string; justificativa: string }) => void;
}) {
  const [etapa, setEtapa] = useState("1");
  const [justificativa, setJustificativa] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!justificativa.trim()) {
      toast.error("Informe a justificativa da falta");
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({ etapa, justificativa: justificativa.trim() });
      onClose();
    } catch {
      // erro tratado no mutation
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar falta</DialogTitle>
          <DialogDescription>
            Colaborador: <strong>{colaboradorNome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Etapa que faltou</Label>
            <Select value={etapa} onValueChange={setEtapa}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1ª etapa</SelectItem>
                <SelectItem value="2">2ª etapa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justificativa"
              placeholder="Descreva o motivo da falta..."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting || !justificativa.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Confirmar falta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Card Component ───

function KanbanCard({
  card,
  columnId,
  onAction,
  onFaltou,
}: {
  card: CardData;
  columnId: string;
  onAction: (action: string, card: CardData) => void;
  onFaltou: (card: ExameCard) => void;
}) {
  const dateLabel = getCardDate(columnId, card);

  const actions = useMemo(() => {
    const list: { label: string; action: string; variant?: "default" | "secondary" | "destructive" | "outline" }[] = [];
    switch (columnId) {
      case "a_vencer":
      case "vencidos":
      case "a_agendar":
        list.push({ label: "Agendar", action: "agendar", variant: "default" });
        break;
      case "agendados":
        list.push({ label: "1ª etapa concluída", action: "primeira_etapa", variant: "default" });
        list.push({ label: "Faltou", action: "faltou", variant: "destructive" });
        break;
      case "primeira_etapa":
        list.push({ label: "2ª etapa concluída", action: "segunda_etapa", variant: "default" });
        list.push({ label: "Faltou", action: "faltou", variant: "destructive" });
        break;
      case "segunda_etapa":
        list.push({ label: "Liberar", action: "liberar", variant: "default" });
        break;
      case "pendente":
        list.push({ label: "Resolver pendência", action: "liberar", variant: "default" });
        break;
      // liberado: sem ações
    }
    return list;
  }, [columnId]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 space-y-2">
        {/* Nome */}
        <div className="text-sm font-medium leading-tight line-clamp-2">{card.nome}</div>

        {/* Empresa */}
        {card.empresa && (
          <div className="text-xs text-muted-foreground truncate">{card.empresa}</div>
        )}

        {/* Data do próximo exame */}
        {dateLabel && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatDate(dateLabel)}</span>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {actions.map((act) => (
              <Button
                key={act.action}
                size="sm"
                variant={act.variant ?? "default"}
                className="h-7 text-[11px] px-2.5"
                onClick={() => {
                  if (act.action === "faltou") {
                    onFaltou(card as ExameCard);
                  } else {
                    onAction(act.action, card);
                  }
                }}
              >
                {act.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Kanban Column ───

function KanbanColumn({
  column,
  cards,
  onAction,
  onFaltou,
  isLoading,
}: {
  column: ColumnDef;
  cards: CardData[];
  onAction: (action: string, card: CardData) => void;
  onFaltou: (card: ExameCard) => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border ${column.borderColor} ${column.bgColor} min-w-[260px] w-[260px] shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-inherit">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${column.dotColor}`} />
        <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
        <Badge variant="outline" className="ml-auto text-[11px] h-5 px-1.5">
          {cards.length}
        </Badge>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </div>
          ) : cards.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Nenhum colaborador
            </div>
          ) : (
            cards.map((card) => (
              <KanbanCard
                key={`${column.id}-${card.id}`}
                card={card}
                columnId={column.id}
                onAction={onAction}
                onFaltou={onFaltou}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Page ───

function KanbanExames() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Faltou dialog state
  const [faltouDialogOpen, setFaltouDialogOpen] = useState(false);
  const [faltouCard, setFaltouCard] = useState<ExameCard | null>(null);

  // Queries
  const { data: colaboradores = [], isLoading: loadingColabs } = useQuery<Colaborador[]>({
    queryKey: ["colaboradores-kanban"],
    queryFn: async () => {
      const res = await authFetch("/api/colaboradores");
      if (!res.ok) throw new Error("Erro ao buscar colaboradores");
      const json = await res.json();
      return json.data as Colaborador[];
    },
  });

  const { data: exames = [], isLoading: loadingExames } = useQuery<Exame[]>({
    queryKey: ["exames-kanban"],
    queryFn: async () => {
      const res = await authFetch("/api/exames");
      if (!res.ok) throw new Error("Erro ao buscar exames");
      const json = await res.json();
      return json.data as Exame[];
    },
  });

  const isLoading = loadingColabs || loadingExames;

  // Mutation genérica para atualizar exame
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
        throw new Error(err.error || "Erro ao atualizar exame");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
      queryClient.invalidateQueries({ queryKey: ["colaboradores-kanban"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Group cards by column
  const columns = useMemo(() => {
    const ativos = colaboradores.filter((c) => c.ativo);

    // Colaboradores ativos
    const aVencer = ativos
      .filter((c) => c.status === "a_vencer" && isWithinDays(c.proximo_exame, 60))
      .map(
        (c): ColaboradorCard => ({
          type: "colaborador",
          id: `col-${c.id}`,
          colaboradorId: c.id,
          nome: c.nome,
          empresa: c.empresa,
          proximo_exame: c.proximo_exame,
        }),
      );

    const vencidos = ativos
      .filter((c) => c.status === "vencido")
      .map(
        (c): ColaboradorCard => ({
          type: "colaborador",
          id: `col-${c.id}`,
          colaboradorId: c.id,
          nome: c.nome,
          empresa: c.empresa,
          proximo_exame: c.proximo_exame,
        }),
      );

    const aAgendar = ativos
      .filter((c) => c.status === "sem_exame")
      .map(
        (c): ColaboradorCard => ({
          type: "colaborador",
          id: `col-${c.id}`,
          colaboradorId: c.id,
          nome: c.nome,
          empresa: c.empresa,
          proximo_exame: c.proximo_exame,
        }),
      );

    const liberado = ativos
      .filter((c) => c.status === "em_dia")
      .map(
        (c): ColaboradorCard => ({
          type: "colaborador",
          id: `col-${c.id}`,
          colaboradorId: c.id,
          nome: c.nome,
          empresa: c.empresa,
          proximo_exame: c.proximo_exame,
        }),
      );

    // Exames
    const agendados = exames
      .filter((e) => e.status === "agendado")
      .map(
        (e): ExameCard => ({
          type: "exame",
          id: `ex-${e.id}`,
          exameId: e.id,
          colaboradorId: e.colaborador_id,
          nome: e.colaborador.nome,
          empresa: e.colaborador.empresa,
          data_agendada: e.data_agendada,
          data_1_etapa: null,
          data_2_etapa: null,
          status: e.status,
        }),
      );

    const primeiraEtapa = exames
      .filter((e) => e.data_1_etapa && !e.data_2_etapa && e.status !== "liberado")
      .map(
        (e): ExameCard => ({
          type: "exame",
          id: `ex-${e.id}`,
          exameId: e.id,
          colaboradorId: e.colaborador_id,
          nome: e.colaborador.nome,
          empresa: e.colaborador.empresa,
          data_agendada: null,
          data_1_etapa: e.data_1_etapa,
          data_2_etapa: null,
          status: e.status,
        }),
      );

    const segundaEtapa = exames
      .filter((e) => e.data_2_etapa && e.status !== "liberado")
      .map(
        (e): ExameCard => ({
          type: "exame",
          id: `ex-${e.id}`,
          exameId: e.id,
          colaboradorId: e.colaborador_id,
          nome: e.colaborador.nome,
          empresa: e.colaborador.empresa,
          data_agendada: null,
          data_1_etapa: e.data_1_etapa,
          data_2_etapa: e.data_2_etapa,
          status: e.status,
        }),
      );

    const pendente = exames
      .filter((e) => e.status === "pendente")
      .map(
        (e): ExameCard => ({
          type: "exame",
          id: `ex-${e.id}`,
          exameId: e.id,
          colaboradorId: e.colaborador_id,
          nome: e.colaborador.nome,
          empresa: e.colaborador.empresa,
          data_agendada: null,
          data_1_etapa: e.data_1_etapa,
          data_2_etapa: e.data_2_etapa,
          status: e.status,
        }),
      );

    return {
      a_vencer: aVencer,
      vencidos,
      a_agendar: aAgendar,
      agendados,
      primeira_etapa: primeiraEtapa,
      segunda_etapa: segundaEtapa,
      pendente,
      liberado,
    } as Record<string, CardData[]>;
  }, [colaboradores, exames]);

  // ─── Handlers ───

  const handleAction = (action: string, card: CardData) => {
    switch (action) {
      case "agendar":
        navigate({ to: "/agendar-exames" });
        break;

      case "primeira_etapa": {
        if (card.type !== "exame") return;
        updateExame.mutate(
          {
            exameId: card.exameId,
            payload: { status: "compareceu", data_1_etapa: todayISO() },
          },
          {
            onSuccess: () => toast.success("1ª etapa concluída com sucesso!"),
          },
        );
        break;
      }

      case "segunda_etapa": {
        if (card.type !== "exame") return;
        updateExame.mutate(
          {
            exameId: card.exameId,
            payload: { status: "realizado", data_2_etapa: todayISO() },
          },
          {
            onSuccess: () => toast.success("2ª etapa concluída com sucesso!"),
          },
        );
        break;
      }

      case "liberar": {
        if (card.type !== "exame") return;
        updateExame.mutate(
          {
            exameId: card.exameId,
            payload: { status: "liberado" },
          },
          {
            onSuccess: () => toast.success("Exame liberado com sucesso!"),
          },
        );
        break;
      }
    }
  };

  const handleFaltou = (card: ExameCard) => {
    setFaltouCard(card);
    setFaltouDialogOpen(true);
  };

  const handleConfirmFaltou = async (payload: { etapa: string; justificativa: string }) => {
    if (!faltouCard) return;

    const etapaNum = parseInt(payload.etapa, 10);

    await updateExame.mutateAsync(
      {
        exameId: faltouCard.exameId,
        payload: {
          status: "faltou",
          etapa_faltou: etapaNum,
          justificativa_falta: payload.justificativa,
        },
      },
      {
        onSuccess: () => {
          toast.success("Falta registrada com sucesso!");
          setFaltouCard(null);
        },
      },
    );
  };

  const totalCards = Object.values(columns).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Kanban de Exames"
        description={`${totalCards} cards no board`}
      />

      {/* Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={columns[col.id] ?? []}
              onAction={handleAction}
              onFaltou={handleFaltou}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Faltou Dialog */}
      {faltouCard && (
        <FaltouDialog
          open={faltouDialogOpen}
          onClose={() => {
            setFaltouDialogOpen(false);
            setFaltouCard(null);
          }}
          exameId={faltouCard.exameId}
          colaboradorNome={faltouCard.nome}
          onConfirm={handleConfirmFaltou}
        />
      )}
    </PageContainer>
  );
}