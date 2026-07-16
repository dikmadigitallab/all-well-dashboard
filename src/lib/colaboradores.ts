import type { Database } from "@/integrations/supabase/types";

export type Colaborador = Database["public"]["Tables"]["colaboradores"]["Row"];
export type ColaboradorInsert = Database["public"]["Tables"]["colaboradores"]["Insert"];
export type AsoStatus = Database["public"]["Enums"]["aso_status"];

export const STATUS_LABEL: Record<AsoStatus, string> = {
  em_dia: "Em dia",
  a_vencer: "A vencer",
  vencido: "Vencido",
  sem_exame: "Sem exame",
};

export const STATUS_CLASSES: Record<AsoStatus, string> = {
  em_dia: "bg-status-ok/20 text-status-ok-foreground border-status-ok/40",
  a_vencer: "bg-status-warn/25 text-status-warn-foreground border-status-warn/50",
  vencido: "bg-status-danger/20 text-status-danger border-status-danger/40",
  sem_exame: "bg-status-neutral/40 text-status-neutral-foreground border-status-neutral/60",
};

export function statusBadge(s: AsoStatus | null | undefined) {
  const st = (s ?? "sem_exame") as AsoStatus;
  return { label: STATUS_LABEL[st], className: STATUS_CLASSES[st] };
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatCPF(cpf: string | null | undefined) {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "").padStart(11, "0");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
