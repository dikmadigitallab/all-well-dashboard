import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/custom-auth";
import { formatDate } from "@/lib/colaboradores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const BATCH_SIZE = 30;

interface NotificacaoItem {
  id: string;
  nome: string;
  empresa: string | null;
  proximo_exame: string | null;
  status: string;
  dias_para_vencer: number | null;
}

interface NotificacaoData {
  total: number;
  a_vencer: NotificacaoItem[];
  vencidos: NotificacaoItem[];
  totais: {
    a_vencer: number;
    vencidos: number;
  };
}

function ItemLink({
  item,
  children,
}: {
  item: NotificacaoItem;
  children: React.ReactNode;
}) {
  return (
    <Link
      to="/colaboradores/$id"
      params={{ id: item.id }}
      className="flex items-start gap-3 px-4 py-2 hover:bg-muted/50 transition-colors no-underline"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">
          {item.nome}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {item.empresa ?? "—"} · {formatDate(item.proximo_exame)}
        </div>
      </div>
      {children}
    </Link>
  );
}

export function NotificationBell() {
  const { data, isLoading } = useQuery<NotificacaoData>({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const res = await authFetch("/api/notificacoes");
      if (!res.ok) throw new Error("Erro ao buscar notificações");
      const json = await res.json();
      return json.data as NotificacaoData;
    },
    refetchInterval: 60_000,
  });

  const total = data?.total ?? 0;
  const aVencer = data?.a_vencer ?? [];
  const vencidos = data?.vencidos ?? [];
  const temAlerta = total > 0;

  // Limites visíveis para cada seção
  const [limAVencer, setLimAVencer] = useState(BATCH_SIZE);
  const [limVencidos, setLimVencidos] = useState(BATCH_SIZE);

  const aVencerVisiveis = aVencer.slice(0, limAVencer);
  const vencidosVisiveis = vencidos.slice(0, limVencidos);
  const restanteAVencer = aVencer.length - limAVencer;
  const restanteVencidos = vencidos.length - limVencidos;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {temAlerta && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold leading-none"
            >
              {total > 99 ? "99+" : total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="px-4 py-3 text-sm font-medium border-b border-border">
          Notificações
          {!isLoading && (
            <span className="text-muted-foreground font-normal ml-1">
              ({total} pendente{total !== 1 ? "s" : ""})
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            Carregando...
          </div>
        ) : total === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            Nenhuma pendência no momento
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {/* ── Vencidos (primeiro) ── */}
            {vencidos.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold text-status-danger uppercase tracking-wide">
                  Vencidos ({vencidos.length})
                </span>
              </div>
            )}

            {vencidosVisiveis.map((item) => (
              <ItemLink key={item.id} item={item}>
                <span className="shrink-0 text-xs font-medium text-status-danger">
                  Vencido
                </span>
              </ItemLink>
            ))}

            {restanteVencidos > 0 && (
              <div className="px-4 py-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setLimVencidos((prev) =>
                      Math.min(prev + BATCH_SIZE, vencidos.length),
                    )
                  }
                  className="text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <ChevronDown className="h-3 w-3" />
                  Ver mais {Math.min(restanteVencidos, BATCH_SIZE)} de {restanteVencidos}
                </Button>
              </div>
            )}

            {/* ── Separador ── */}
            {aVencer.length > 0 && vencidos.length > 0 && (
              <Separator className="my-1" />
            )}

            {/* ── Vencendo em 60 dias ── */}
            {aVencer.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold text-status-warn uppercase tracking-wide">
                  Vencendo em 60 dias ({aVencer.length})
                </span>
              </div>
            )}

            {aVencerVisiveis.map((item) => (
              <ItemLink key={item.id} item={item}>
                {item.dias_para_vencer != null && (
                  <span className="shrink-0 text-xs font-medium text-status-warn">
                    {item.dias_para_vencer}d
                  </span>
                )}
              </ItemLink>
            ))}

            {restanteAVencer > 0 && (
              <div className="px-4 py-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setLimAVencer((prev) =>
                      Math.min(prev + BATCH_SIZE, aVencer.length),
                    )
                  }
                  className="text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <ChevronDown className="h-3 w-3" />
                  Ver mais {Math.min(restanteAVencer, BATCH_SIZE)} de {restanteAVencer}
                </Button>
              </div>
            )}

            <div className="h-2" />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
