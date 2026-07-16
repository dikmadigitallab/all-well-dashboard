import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BarChart3, Bell, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold">A</div>
            <div className="font-semibold">Controle de ASOs</div>
          </div>
          <Button asChild size="sm">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground mb-6">
            <ShieldCheck className="h-3.5 w-3.5" /> Saúde ocupacional em um só lugar
          </div>
          <h1 className="text-5xl font-semibold tracking-tight leading-tight">
            Gestão completa dos Atestados de Saúde Ocupacional
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            Centralize colaboradores, acompanhe vencimentos, controle exames e visualize indicadores
            em tempo real. Reduza retrabalho e mantenha sua operação em conformidade.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Acessar plataforma</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { icon: BarChart3, title: "Dashboard gerencial", desc: "KPIs em tempo real: em dia, a vencer, vencido, por empresa, unidade e setor." },
            { icon: FileSpreadsheet, title: "Importação da base", desc: "Suba sua planilha e mantenha todos os colaboradores atualizados em segundos." },
            { icon: Bell, title: "Alertas automáticos", desc: "Notificações no painel e por e-mail de ASOs próximos do vencimento." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-lg border border-border bg-card shadow-panel">
              <f.icon className="h-6 w-6 text-primary" />
              <div className="mt-4 font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
