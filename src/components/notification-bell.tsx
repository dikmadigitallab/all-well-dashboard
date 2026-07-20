import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/colaboradores";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  nome: string;
  empresa: string | null;
  proximo_exame: string | null;
  dias_para_vencer: number | null;
  status: string | null;
};

export function NotificationBell() {
  const { data } = useQuery({
    queryKey: ["notif-alerts"],
    queryFn: async () => {
      const { data: vencidos } = await supabase
        .from("colaboradores").select("id,nome,empresa,proximo_exame,dias_para_vencer,status")
        .eq("status", "vencido").order("dias_para_vencer", { ascending: true }).limit(20);
      const { data: aVencer } = await supabase
        .from("colaboradores").select("id,nome,empresa,proximo_exame,dias_para_vencer,status")
        .eq("status", "a_vencer").order("dias_para_vencer", { ascending: true }).limit(20);
      const { count: pendCount } = await supabase
        .from("exames").select("id", { count: "exact", head: true }).eq("status", "pendente");
      const { count: faltouCount } = await supabase
        .from("exames").select("id", { count: "exact", head: true }).eq("status", "faltou");
      return {
        vencidos: (vencidos ?? []) as Item[],
        aVencer: (aVencer ?? []) as Item[],
        pendentes: pendCount ?? 0,
        faltas: faltouCount ?? 0,
      };
    },
    refetchInterval: 60_000,
  });

  const total = (data?.vencidos.length ?? 0) + (data?.aVencer.length ?? 0) + (data?.pendentes ?? 0) + (data?.faltas ?? 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {total > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-status-danger text-white text-[10px] font-semibold flex items-center justify-center">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px]">
        <DropdownMenuLabel>Alertas</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 grid grid-cols-2 gap-2 text-xs">
          <Stat label="Vencidos" value={data?.vencidos.length ?? 0} tone="danger" />
          <Stat label="A vencer" value={data?.aVencer.length ?? 0} tone="warn" />
          <Stat label="Pendências" value={data?.pendentes ?? 0} tone="warn" />
          <Stat label="Faltas" value={data?.faltas ?? 0} tone="danger" />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Vencidos</DropdownMenuLabel>
        {(data?.vencidos.length ?? 0) === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">Nenhum ASO vencido 🎉</div>
        )}
        {data?.vencidos.slice(0, 5).map((c) => (
          <DropdownMenuItem key={c.id} asChild>
            <Link to="/colaboradores/$id" params={{ id: c.id }} className="flex flex-col items-start">
              <span className="text-sm font-medium truncate w-full">{c.nome}</span>
              <span className="text-xs text-muted-foreground">
                {c.empresa ?? "—"} · Venceu em {formatDate(c.proximo_exame)} ({Math.abs(c.dias_para_vencer ?? 0)}d)
              </span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Próximos 30 dias</DropdownMenuLabel>
        {(data?.aVencer.length ?? 0) === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">Nada nos próximos 30 dias.</div>
        )}
        {data?.aVencer.slice(0, 5).map((c) => (
          <DropdownMenuItem key={c.id} asChild>
            <Link to="/colaboradores/$id" params={{ id: c.id }} className="flex flex-col items-start">
              <span className="text-sm font-medium truncate w-full">{c.nome}</span>
              <span className="text-xs text-muted-foreground">
                {c.empresa ?? "—"} · Vence {formatDate(c.proximo_exame)} (em {c.dias_para_vencer}d)
              </span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/pendencias" className="text-sm">Ver todas as pendências →</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "danger" | "warn" }) {
  return (
    <div className={cn(
      "rounded-md border p-2",
      tone === "danger" ? "bg-status-danger/10 border-status-danger/30" : "bg-status-warn/15 border-status-warn/40",
    )}>
      <div className="text-lg font-semibold leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
