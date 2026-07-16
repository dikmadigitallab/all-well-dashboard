import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suName, setSuName] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(loginEmail, loginPass);
    setBusy(false);
    if (error) {
      toast.error("Falha no login", { description: error });
    } else {
      toast.success("Bem-vindo!");
      navigate({ to: "/dashboard" });
    }
  };

  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUp(suEmail, suPass, suName);
    setBusy(false);
    if (error) {
      toast.error("Falha no cadastro", { description: error });
    } else {
      toast.success("Conta criada. Você já pode entrar.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Controle de ASOs</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse com sua conta corporativa</p>
        </div>

        <div className="border border-border bg-card rounded-lg p-6 shadow-panel">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={doLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="le">E-mail</Label>
                  <Input id="le" type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lp">Senha</Label>
                  <Input id="lp" type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                </div>
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={doSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sn">Nome completo</Label>
                  <Input id="sn" required value={suName} onChange={(e) => setSuName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="se">E-mail</Label>
                  <Input id="se" type="email" required value={suEmail} onChange={(e) => setSuEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp">Senha</Label>
                  <Input id="sp" type="password" required minLength={8} value={suPass} onChange={(e) => setSuPass(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
                </div>
                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? "Criando..." : "Criar conta"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  O primeiro usuário cadastrado será Administrador (SESMT). Os demais entrarão como Gestor (somente leitura) até serem promovidos.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
