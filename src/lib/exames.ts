import type { Database } from "@/integrations/supabase/types";

export type Exame = Database["public"]["Tables"]["exames"]["Row"];
export type ExameInsert = Database["public"]["Tables"]["exames"]["Insert"];
export type ExameStatus = Database["public"]["Enums"]["exame_status"];
export type ExameTipo = Database["public"]["Enums"]["exame_tipo"];
export type PendenciaMotivo = Database["public"]["Enums"]["pendencia_motivo"];

export const TIPO_LABEL: Record<ExameTipo, string> = {
  admissional: "Admissional",
  periodico: "Periódico",
  demissional: "Demissional",
  retorno_ao_trabalho: "Retorno ao trabalho",
  mudanca_riscos: "Mudança de riscos",
  complementar: "Complementar",
};

export const STATUS_EXAME_LABEL: Record<ExameStatus, string> = {
  agendado: "Agendado",
  compareceu: "Compareceu",
  faltou: "Faltou",
  pendente: "Pendente",
  cancelado: "Cancelado",
  realizado: "Realizado",
};

export const STATUS_EXAME_CLASSES: Record<ExameStatus, string> = {
  agendado: "bg-primary/15 text-primary border-primary/30",
  compareceu: "bg-status-ok/20 text-status-ok-foreground border-status-ok/40",
  realizado: "bg-status-ok/20 text-status-ok-foreground border-status-ok/40",
  faltou: "bg-status-danger/20 text-status-danger border-status-danger/40",
  pendente: "bg-status-warn/25 text-status-warn-foreground border-status-warn/50",
  cancelado: "bg-status-neutral/40 text-status-neutral-foreground border-status-neutral/60",
};

export const MOTIVO_LABEL: Record<PendenciaMotivo, string> = {
  agendamento: "Agendamento",
  falta_colaborador: "Falta do colaborador",
  documentacao: "Documentação",
  afastamento: "Afastamento",
  recusa: "Recusa",
  outro: "Outro",
};

export const MOTIVO_COLORS: Record<PendenciaMotivo, string> = {
  agendamento: "#0ea5e9",
  falta_colaborador: "#ef4444",
  documentacao: "#f59e0b",
  afastamento: "#8b5cf6",
  recusa: "#ec4899",
  outro: "#64748b",
};
