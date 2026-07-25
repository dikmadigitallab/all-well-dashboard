import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
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
  Upload,
  FileText,
  Download,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { authFetch } from "@/lib/custom-auth";
import { formatDate } from "@/lib/colaboradores";
import { registrarHistorico } from "@/lib/historico";
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
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

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
  arquivo_url: string | null;
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

// Mapa de status para exibição no card
const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  agendado: { label: "Agendado", variant: "secondary" },
  compareceu: { label: "1ª etapa", variant: "default" },
  realizado: { label: "2ª etapa", variant: "default" },
  pendente: { label: "Pendente", variant: "destructive" },
  liberado: { label: "Liberado", variant: "outline" },
  faltou: { label: "Faltou", variant: "destructive" },
};

function getCardDate(colId: string, item: ColaboradorCard | ExameCard): string | null {
  if ("proximo_exame" in item) return item.proximo_exame;
  if ("data_agendada" in item) {
    const ec = item as ExameCard;
    // Mostra a data mais relevante de acordo com a coluna atual
    switch (colId) {
      case "agendados":
        return ec.data_agendada;
      case "primeira_etapa":
        return ec.data_1_etapa;
      case "segunda_etapa":
        return ec.data_2_etapa;
      case "liberado":
        return ec.data_2_etapa ?? ec.data_1_etapa;
      default:
        return ec.data_agendada ?? ec.data_1_etapa ?? ec.data_2_etapa ?? null;
    }
  }
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
  arquivo_url: string | null;
  etapa_faltou: number | null;
  justificativa_falta: string | null;
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

// ─── Draggable Card ───

function DraggableCard({
  card,
  columnId,
  onAction,
  onFaltou,
  onUploadAsO,
  uploading,
}: {
  card: CardData;
  columnId: string;
  onAction: (action: string, card: CardData) => void;
  onFaltou: (card: ExameCard) => void;
  onUploadAsO: (exameId: string, colaboradorId: string) => void;
  uploading: boolean;
}) {
  // Apenas ExameCard pode ser arrastado
  const isDraggable = card.type === "exame";
  const sortableId = `${columnId}::${card.id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={`shadow-sm hover:shadow-md transition-shadow ${isDragging ? "ring-2 ring-primary" : ""}`}>
        <CardContent className="p-3 space-y-2">
          {/* Handle (grip) + Nome */}
          <div className="flex items-start gap-1">
            {isDraggable && (
              <button
                {...listeners}
                className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                tabIndex={-1}
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <Link
                to="/colaboradores/$id"
                params={{ id: card.colaboradorId }}
                className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {card.nome}
              </Link>
            </div>
          </div>

          {/* Empresa */}
          {card.empresa && (
            <div className="text-xs text-muted-foreground truncate pl-5">{card.empresa}</div>
          )}

          {/* Status badge + etapa faltou */}
          {card.type === "exame" && (() => {
            const ec = card as ExameCard;
            const st = STATUS_LABEL[ec.status];
            if (!st) return null;
            return (
              <div className="pl-5 flex flex-wrap gap-1">
                <Badge variant={st.variant} className="text-[10px] h-4 px-1.5 font-normal">
                  {st.label}
                </Badge>
                {ec.etapa_faltou && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal border-destructive text-destructive">
                    Faltou {ec.etapa_faltou}ª etapa
                  </Badge>
                )}
              </div>
            );
          })()}

          {/* Data */}
          {(() => {
            const dateLabel = getCardDate(columnId, card);
            return dateLabel ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{formatDate(dateLabel)}</span>
              </div>
            ) : null;
          })()}

          {/* Status icons */}
          {(() => {
            const isLib = columnId === "liberado" && card.type === "exame";
            const ec = card as ExameCard;
            return isLib && ec.arquivo_url ? (
              <div className="flex items-center gap-1.5 text-xs text-status-ok pl-5">
                <FileText className="h-3 w-3 shrink-0" />
                <span>ASO anexado</span>
              </div>
            ) : null;
          })()}

          {/* Actions */}
          {(() => {
            const actions: { label: string; action: string; variant?: "default" | "secondary" | "destructive" | "outline" }[] = [];
            switch (columnId) {
              case "a_vencer":
              case "vencidos":
              case "a_agendar":
                actions.push({ label: "Agendar", action: "agendar", variant: "default" });
                break;
              case "agendados":
                actions.push({ label: "1ª etapa concluída", action: "primeira_etapa", variant: "default" });
                actions.push({ label: "Faltou", action: "faltou", variant: "destructive" });
                break;
              case "primeira_etapa":
                actions.push({ label: "2ª etapa concluída", action: "segunda_etapa", variant: "default" });
                actions.push({ label: "Faltou", action: "faltou", variant: "destructive" });
                break;
              case "segunda_etapa":
                actions.push({ label: "Liberar", action: "liberar", variant: "default" });
                break;
              case "pendente":
                actions.push({ label: "Resolver pendência", action: "liberar", variant: "default" });
                break;
            }

            const isLib = columnId === "liberado" && card.type === "exame";
            const podeLiberar = (columnId === "segunda_etapa" || columnId === "pendente") && card.type === "exame";
            const ec = card as ExameCard;

            return (
              <div className="flex flex-wrap gap-1.5 pt-1 pl-5">
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
                {isLib && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2.5"
                      disabled={uploading}
                      onClick={() => onUploadAsO(ec.exameId, ec.colaboradorId)}
                    >
                      {uploading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      Subir ASO
                    </Button>
                    {ec.arquivo_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] px-2.5"
                        onClick={() => window.open(ec.arquivo_url!, "_blank")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    )}
                  </>
                )}
                {podeLiberar && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2.5"
                      disabled={uploading}
                      onClick={() => onUploadAsO(ec.exameId, ec.colaboradorId)}
                    >
                      {uploading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      {ec.arquivo_url ? "Trocar ASO" : "Subir ASO"}
                    </Button>
                    {ec.arquivo_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] px-2.5"
                        onClick={() => window.open(ec.arquivo_url!, "_blank")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Ver ASO
                      </Button>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Kanban Column ───

function KanbanColumn({
  column,
  cards,
  onAction,
  onFaltou,
  onUploadAsO,
  uploading,
  isLoading,
}: {
  column: ColumnDef;
  cards: CardData[];
  onAction: (action: string, card: CardData) => void;
  onFaltou: (card: ExameCard) => void;
  onUploadAsO: (exameId: string, colaboradorId: string) => void;
  uploading: boolean;
  isLoading: boolean;
}) {
  // Torna a coluna um alvo de drop
  const { setNodeRef: setDroppableRef } = useDroppable({ id: column.id });

  const sortableIds = useMemo(
    () => cards.map((c) => `${column.id}::${c.id}`),
    [cards, column.id],
  );

  return (
    <div
      ref={setDroppableRef}
      className={`flex flex-col rounded-lg border ${column.borderColor} ${column.bgColor} min-w-[260px] w-[260px] shrink-0 max-h-full`}
    >
      {/* Header — fixo */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-inherit shrink-0">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${column.dotColor}`} />
        <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
        <Badge variant="outline" className="ml-auto text-[11px] h-5 px-1.5">
          {cards.length}
        </Badge>
      </div>

      {/* Cards — scroll vertical */}
      <ScrollArea className="flex-1 overflow-y-auto">
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
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              {cards.map((card) => (
                <DraggableCard
                  key={card.id}
                  card={card}
                  columnId={column.id}
                  onAction={onAction}
                  onFaltou={onFaltou}
                  onUploadAsO={onUploadAsO}
                  uploading={uploading}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Mapa de destino —──
// Define status + campos a limpar ao mover para cada coluna
function buildDropPayload(toCol: string, card: ExameCard): Record<string, unknown> | null {
  const today = todayISO();
  switch (toCol) {
    case "a_agendar":
      return {
        status: "faltou",
        data_agendada: null,
        // mantém etapa_faltou e justificativa_falta se já existirem
      };
    case "agendados":
      return {
        status: "agendado",
        data_1_etapa: null,
        data_2_etapa: null,
        justificativa_falta: null,
        etapa_faltou: null,
      };
    case "primeira_etapa":
      return {
        status: "compareceu",
        data_1_etapa: card.data_1_etapa ?? today,
        data_2_etapa: null,
        justificativa_falta: null,
        etapa_faltou: null,
      };
    case "segunda_etapa":
      return {
        status: "realizado",
        data_2_etapa: card.data_2_etapa ?? today,
        justificativa_falta: null,
        etapa_faltou: null,
      };
    case "pendente":
      return { status: "pendente" };
    case "liberado":
      return { status: "liberado" };
    default:
      return null; // colunas não mapeadas (a_vencer, vencidos)
  }
}

// Valida se o card pode ser liberado (precisa de ASO anexado)
function canLiberate(card: ExameCard): boolean {
  return !!card.arquivo_url;
}

// ─── Page ───

function KanbanExames() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Faltou dialog state
  const [faltouDialogOpen, setFaltouDialogOpen] = useState(false);
  const [faltouCard, setFaltouCard] = useState<ExameCard | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ exameId: string; colaboradorId: string } | null>(null);

  // Liberado toggle
  const [showLiberado, setShowLiberado] = useState(false);

  // Drag state (para overlay)
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

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
      queryClient.invalidateQueries({ queryKey: ["exames-agendados"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Group cards by column
  const columns = useMemo(() => {
    const ativos = colaboradores.filter((c) => c.ativo);

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

    const aAgendarColabs = ativos
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

    const aAgendarExames = exames
      .filter((e) => e.status === "faltou")
      .map(
        (e): ExameCard => ({
          type: "exame",
          id: `ex-${e.id}`,
          exameId: e.id,
          colaboradorId: e.colaborador_id,
          nome: e.colaborador.nome,
          empresa: e.colaborador.empresa,
          data_agendada: e.data_agendada,
          data_1_etapa: e.data_1_etapa,
          data_2_etapa: e.data_2_etapa,
          status: e.status,
          arquivo_url: e.arquivo_url,
          etapa_faltou: e.etapa_faltou,
          justificativa_falta: e.justificativa_falta,
        }),
      );

    const liberado = exames
      .filter((e) => e.status === "liberado")
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
          arquivo_url: e.arquivo_url,
          etapa_faltou: e.etapa_faltou,
          justificativa_falta: e.justificativa_falta,
        }),
      );

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
          arquivo_url: e.arquivo_url,
          etapa_faltou: e.etapa_faltou,
          justificativa_falta: e.justificativa_falta,
        }),
      );

    const primeiraEtapa = exames
      .filter((e) => e.data_1_etapa && !e.data_2_etapa && e.status !== "liberado" && e.status !== "faltou")
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
          arquivo_url: e.arquivo_url,
          etapa_faltou: e.etapa_faltou,
          justificativa_falta: e.justificativa_falta,
        }),
      );

    const segundaEtapa = exames
      .filter((e) => e.data_2_etapa && e.status !== "liberado" && e.status !== "faltou")
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
          arquivo_url: e.arquivo_url,
          etapa_faltou: e.etapa_faltou,
          justificativa_falta: e.justificativa_falta,
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
          arquivo_url: e.arquivo_url,
          etapa_faltou: e.etapa_faltou,
          justificativa_falta: e.justificativa_falta,
        }),
      );

    return {
      a_vencer: aVencer,
      vencidos,
      a_agendar: [...aAgendarColabs, ...aAgendarExames],
      agendados,
      primeira_etapa: primeiraEtapa,
      segunda_etapa: segundaEtapa,
      pendente,
      liberado,
    } as Record<string, CardData[]>;
  }, [colaboradores, exames]);

  // Para o overlay de drag
  const activeCard = useMemo(() => {
    if (!activeDragId) return null;
    const [colId, ...rest] = activeDragId.split("::");
    const cardId = rest.join("::");
    return columns[colId]?.find((c) => c.id === cardId) ?? null;
  }, [activeDragId, columns]);

  // ─── Handlers ───

  // Upload ASO
  const handleUploadAsO = (exameId: string, colaboradorId: string) => {
    setUploadTarget({ exameId, colaboradorId });
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "png", "jpg", "jpeg"].includes(ext)) {
      toast.error("Formato inválido. Use PDF, PNG ou JPG.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("colaborador_id", uploadTarget.colaboradorId);
      formData.append("exame_id", uploadTarget.exameId);

      const res = await authFetch("/api/asos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao fazer upload");
      }

      toast.success("ASO enviado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["exames-kanban"] });
      registrarHistorico({
        colaboradorId: uploadTarget.colaboradorId,
        exameId: uploadTarget.exameId,
        evento: "aso_anexado",
        descricao: "ASO anexado ao exame",
        detalhes: { nome_arquivo: file.name },
      });
    } catch (err) {
      toast.error("Erro ao subir ASO", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setUploading(false);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAction = (action: string, card: CardData) => {
    switch (action) {
      case "agendar":
        navigate({ to: "/agendar-exames" });
        break;

      case "primeira_etapa": {
        if (card.type !== "exame") return;
        const ec1 = card as ExameCard;
        updateExame.mutate(
          {
            exameId: card.exameId,
            payload: { status: "compareceu", data_1_etapa: todayISO() },
          },
          {
            onSuccess: () => {
              toast.success("1ª etapa concluída com sucesso!");
              registrarHistorico({
                colaboradorId: ec1.colaboradorId,
                exameId: ec1.exameId,
                evento: "compareceu_1",
                descricao: "Compareceu à 1ª etapa do exame",
                detalhes: { data: todayISO() },
              });
            },
          },
        );
        break;
      }

      case "segunda_etapa": {
        if (card.type !== "exame") return;
        const ec2 = card as ExameCard;
        updateExame.mutate(
          {
            exameId: card.exameId,
            payload: { status: "realizado", data_2_etapa: todayISO() },
          },
          {
            onSuccess: () => {
              toast.success("2ª etapa concluída com sucesso!");
              registrarHistorico({
                colaboradorId: ec2.colaboradorId,
                exameId: ec2.exameId,
                evento: "compareceu_2",
                descricao: "Compareceu à 2ª etapa do exame",
                detalhes: { data: todayISO() },
              });
            },
          },
        );
        break;
      }

      case "liberar": {
        if (card.type !== "exame") return;
        const exameCard = card as ExameCard;
        if (!canLiberate(exameCard)) {
          toast.error("Faça upload do ASO antes de liberar o exame");
          return;
        }
        updateExame.mutate(
          { exameId: card.exameId, payload: { status: "liberado" } },
          {
            onSuccess: () => {
              toast.success("Exame liberado com sucesso!");
              registrarHistorico({
                colaboradorId: exameCard.colaboradorId,
                exameId: exameCard.exameId,
                evento: "liberado",
                descricao: "Exame liberado",
              });
            },
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
    const card = faltouCard;
    // Se faltou, vai para "a_agendar" para poder reagendar
    const faltouPayload: Record<string, unknown> = {
      status: "faltou",
      data_agendada: null,
      justificativa_falta: payload.justificativa,
      etapa_faltou: etapaNum,
    };

    // Se faltou na 1ª etapa, limpa data_1_etapa e data_2_etapa
    // Se faltou na 2ª etapa, limpa só data_2_etapa (mantém data_1_etapa)
    if (etapaNum === 1) {
      faltouPayload.data_1_etapa = null;
      faltouPayload.data_2_etapa = null;
    } else {
      faltouPayload.data_2_etapa = null;
    }

    await updateExame.mutateAsync(
      {
        exameId: card.exameId,
        payload: faltouPayload,
      },
      {
        onSuccess: () => {
          toast.success("Falta registrada! Exame disponível para reagendamento.");
          setFaltouCard(null);
          registrarHistorico({
            colaboradorId: card.colaboradorId,
            exameId: card.exameId,
            evento: "faltou",
            descricao: `Faltou à ${etapaNum}ª etapa do exame`,
            detalhes: { etapa: etapaNum, justificativa: payload.justificativa },
          });
        },
      },
    );
  };

  // ─── Drag & Drop ───

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);

    const { active, over } = event;
    if (!over) return;

    const fromId = active.id as string;
    const toId = over.id as string;

    // Extrai coluna de origem e id do card
    const [fromCol, ...restFrom] = fromId.split("::");
    const cardId = restFrom.join("::");

    // Extrai coluna de destino (pode ser um card ou a coluna em si)
    const toParts = toId.split("::");
    const toCol = toParts.length === 1 ? toParts[0] : toParts[0];

    // Se mesma coluna, não faz nada
    if (fromCol === toCol) return;

    // Apenas ExameCard pode ser movido
    const card = columns[fromCol]?.find((c) => c.id === cardId);
    if (!card || card.type !== "exame") return;

    const exameCard = card as ExameCard;

    // Monta payload com base na coluna de destino
    const payload = buildDropPayload(toCol, exameCard);
    if (!payload) {
      toast.error(`Não é possível mover para "${toCol}"`);
      return;
    }

    // Valida ASO obrigatório antes de liberar
    if (toCol === "liberado" && !canLiberate(exameCard)) {
      toast.error("Faça upload do ASO antes de mover para Liberado");
      return;
    }

    updateExame.mutate(
      { exameId: exameCard.exameId, payload },
      {
        onSuccess: () => {
          const colLabel = COLUMNS.find((c) => c.id === toCol)?.label ?? toCol;
          toast.success(`${exameCard.nome} movido para "${colLabel}"`);

          const eventoColMap: Record<string, string> = {
            agendados: "agendado",
            primeira_etapa: "compareceu_1",
            segunda_etapa: "compareceu_2",
            pendente: "pendente",
            liberado: "liberado",
          };
          const evento = eventoColMap[toCol] || "movido";
          const descricoes: Record<string, string> = {
            agendados: "Exame reagendado",
            primeira_etapa: "Compareceu à 1ª etapa",
            segunda_etapa: "Compareceu à 2ª etapa",
            pendente: "Exame pendente",
            liberado: "Exame liberado",
          };
          registrarHistorico({
            colaboradorId: exameCard.colaboradorId,
            exameId: exameCard.exameId,
            evento,
            descricao: descricoes[toCol] || `Movido para ${colLabel}`,
          });
        },
      },
    );
  };

  const totalCards = Object.values(columns).reduce((acc, arr) => acc + arr.length, 0);

  // Colunas visíveis (libero é condicional)
  const visibleColumns = useMemo(
    () => COLUMNS.filter((col) => col.id !== "liberado" || showLiberado),
    [showLiberado],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Kanban de Exames"
        description={`${totalCards} cards no board`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLiberado((v) => !v)}
          >
            {showLiberado ? (
              <EyeOff className="h-4 w-4 mr-1.5" />
            ) : (
              <Eye className="h-4 w-4 mr-1.5" />
            )}
            {showLiberado ? "Ocultar liberados" : "Mostrar liberados"}
            {!showLiberado && (columns.liberado?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                {columns.liberado.length}
              </Badge>
            )}
          </Button>
        }
      />

      {/* Board */}
      <div className="h-[calc(100vh-220px)] overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToFirstScrollableAncestor]}
        >
          <div className="flex gap-4 h-full" style={{ minWidth: "max-content" }}>
            {visibleColumns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={columns[col.id] ?? []}
                onAction={handleAction}
                onFaltou={handleFaltou}
                onUploadAsO={handleUploadAsO}
                uploading={uploading}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Drag overlay — card fantasma enquanto arrasta */}
          <DragOverlay>
            {activeCard ? (
              <Card className="shadow-xl ring-2 ring-primary/50 rotate-2 w-[256px]">
                <CardContent className="p-3">
                  <div className="text-sm font-medium">{activeCard.nome}</div>
                  {activeCard.empresa && (
                    <div className="text-xs text-muted-foreground truncate mt-1">{activeCard.empresa}</div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
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

      {/* Hidden file input for ASO upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileSelected}
      />
    </PageContainer>
  );
}