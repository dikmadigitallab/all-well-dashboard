import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Search, Settings, User, Server, FolderOpen, Loader2, Send, CheckCircle2, XCircle } from "lucide-react";
import { authFetch } from "@/lib/custom-auth";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/config-email")({
  component: ConfigEmailPage,
});

interface EmailConfigData {
  id?: string;
  email_address: string;
  imap_host: string;
  imap_port: number;
  smtp_host: string;
  smtp_port: number;
  search_term: string;
  sender_filter: string;
  folder: string;
  ativo: boolean;
  has_password: boolean;
}

interface EmailPreview {
  id: number;
  subject: string;
  from: string;
  date: string;
  text: string;
}

function ConfigEmailPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [config, setConfig] = useState<EmailConfigData>({
    email_address: "",
    imap_host: "imap.gmail.com",
    imap_port: 993,
    smtp_host: "",
    smtp_port: 587,
    search_term: "",
    sender_filter: "",
    folder: "INBOX",
    ativo: true,
    has_password: false,
  });
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<EmailPreview[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<{
    sent: boolean;
    error: string | null;
  } | null>(null);

  // Cache local
  const saveLocalCache = (data: EmailConfigData) => {
    try {
      localStorage.setItem("email_config_cache", JSON.stringify(data));
    } catch {
      // Ignora
    }
  };

  const loadLocalCache = (): EmailConfigData | null => {
    try {
      const raw = localStorage.getItem("email_config_cache");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  // Carrega config do servidor (com fallback para cache local)
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await authFetch("/api/email-config");
        if (!res.ok) throw new Error("Erro ao carregar");
        const json = await res.json();
        if (json.data) {
          setConfig({
            ...json.data,
            smtp_host: json.data.smtp_host || "",
            smtp_port: json.data.smtp_port || 587,
          });
          saveLocalCache(json.data);
        } else {
          const cached = loadLocalCache();
          if (cached) setConfig(cached);
        }
      } catch (err) {
        console.error("[config-email] load error:", err);
        const cached = loadLocalCache();
        if (cached) setConfig(cached);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setConfirmationStatus(null);
    try {
      const payload = {
        ...config,
        ...(password ? { email_password: password } : {}),
      };

      const res = await authFetch("/api/email-config", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Erro ao salvar");

      setConfig({
        ...json.data,
        smtp_host: json.data.smtp_host || "",
        smtp_port: json.data.smtp_port || 587,
      });
      saveLocalCache(json.data);

      // Se enviou email de confirmação
      if (json.confirmation) {
        setConfirmationStatus(json.confirmation);
        if (json.confirmation.sent) {
          toast.success("Configuração salva! Email de confirmação enviado.");
        } else if (json.confirmation.error) {
          toast.warning("Configuração salva, mas não foi possível enviar o email de confirmação.");
        } else {
          toast.success("Configuração salva com sucesso");
        }
      } else {
        toast.success("Configuração salva com sucesso");
      }

      setPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.email_address || !password) {
      toast.error("Informe o email e a senha para testar");
      return;
    }

    setTesting(true);
    setShowResults(false);
    try {
      const res = await authFetch("/api/email-config/test", {
        method: "POST",
        body: JSON.stringify({
          email: config.email_address,
          password,
          host: config.imap_host,
          port: config.imap_port,
          folder: config.folder,
          search_term: config.search_term || null,
          sender_filter: config.sender_filter || null,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Falha na conexão");

      setResults(json.emails || []);
      setShowResults(true);

      if (json.emails_count > 0) {
        toast.success(`${json.emails_count} email(ns) encontrado(s) — exibindo ${json.emails.length}`);
      } else if (json.debug) {
        // Exibe debug info se não encontrou emails
        const debug = json.debug;
        console.debug("[email-debug]", debug);
        if (debug.unseenUidsCount === 0 && debug.allUidsCount === 0) {
          toast.info("Conexão OK, mas a caixa de entrada parece vazia");
        } else if (debug.unseenUidsCount === 0) {
          toast.info(`Conexão OK, mas não há emails não lidos (total na caixa: ${debug.allUidsCount})`);
        } else {
          toast.info(`Conexão OK, ${debug.unseenUidsCount} não lidos encontrados, mas nenhum passou nos filtros`);
        }
      } else {
        toast.info("Conexão OK, nenhum email encontrado com os filtros atuais");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao testar";
      toast.error(msg);
      setShowResults(true);
      setResults([]);
    } finally {
      setTesting(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setShowResults(false);
    try {
      const savePayload = {
        ...config,
        ...(password ? { email_password: password } : {}),
      };

      const saveRes = await authFetch("/api/email-config", {
        method: "PUT",
        body: JSON.stringify(savePayload),
      });

      const saveJson = await saveRes.json();
      if (!saveJson.ok) throw new Error(saveJson.error || "Erro ao salvar antes da busca");

      const res = await authFetch("/api/email-config/test", {
        method: "POST",
        body: JSON.stringify({
          email: config.email_address,
          password: password || "usar_salva",
          host: config.imap_host,
          port: config.imap_port,
          folder: config.folder,
          search_term: config.search_term || null,
          sender_filter: config.sender_filter || null,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Falha na busca");

      setResults(json.emails || []);
      setShowResults(true);

      if (json.emails_count > 0) {
        toast.success(`${json.emails_count} email(ns) encontrado(s)`);
      } else {
        toast.info("Nenhum email encontrado com os filtros atuais");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na busca";
      toast.error(msg);
      setShowResults(true);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Carregando configurações...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Configuração de Email"
        description="Configure a conta de email para busca e envio de mensagens"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda: Configurações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados da Conta IMAP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" /> Recebimento (IMAP)
              </CardTitle>
              <CardDescription>Configurações de leitura de emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={config.email_address}
                    onChange={(e) => setConfig({ ...config, email_address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={config.has_password ? "•••••• (deixe vazio para manter)" : "Senha do email"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {config.has_password && !password && (
                    <p className="text-xs text-muted-foreground">Deixe vazio para manter a senha atual</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Servidor IMAP</Label>
                  <Input
                    id="host"
                    placeholder="imap.gmail.com"
                    value={config.imap_host}
                    onChange={(e) => setConfig({ ...config, imap_host: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="993"
                    value={config.imap_port}
                    onChange={(e) => setConfig({ ...config, imap_port: Number(e.target.value) || 993 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folder">Pasta</Label>
                  <Input
                    id="folder"
                    placeholder="INBOX"
                    value={config.folder}
                    onChange={(e) => setConfig({ ...config, folder: e.target.value || "INBOX" })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" /> Envio (SMTP)
              </CardTitle>
              <CardDescription>
                Configurações para envio de emails. Usa a mesma conta acima.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    placeholder="smtp.gmail.com"
                    value={config.smtp_host}
                    onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para usar o padrão do provedor
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta SMTP</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    value={config.smtp_port}
                    onChange={(e) => setConfig({ ...config, smtp_port: Number(e.target.value) || 587 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros de Busca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" /> Filtros de Busca
              </CardTitle>
              <CardDescription>
                Defina o que procurar nos emails não lidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search_term">Termo de busca</Label>
                <Input
                  id="search_term"
                  placeholder='Ex: "ASO", "exame médico", "agendamento"...'
                  value={config.search_term}
                  onChange={(e) => setConfig({ ...config, search_term: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  O sistema buscará este termo no assunto e no corpo dos emails
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender">Remetente (opcional)</Label>
                <Input
                  id="sender"
                  placeholder="Filtrar por remetente: clinica@exemplo.com"
                  value={config.sender_filter}
                  onChange={(e) => setConfig({ ...config, sender_filter: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Se preenchido, apenas emails deste remetente serão considerados
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ativo">Rotina ativa</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando ativo, o sistema buscará emails durante o uso
                  </p>
                </div>
                <Switch
                  id="ativo"
                  checked={config.ativo}
                  onCheckedChange={(v) => setConfig({ ...config, ativo: v })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da direita: Ações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" /> Ações
              </CardTitle>
              <CardDescription>Salve, teste ou execute a busca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar configuração"
                )}
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleTest}
                disabled={testing || !config.email_address}
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testando...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" /> Testar conexão
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleSearch}
                disabled={searching || !config.email_address}
              >
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" /> Buscar emails agora
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Ao salvar com uma senha válida, o sistema envia um email de confirmação para a conta configurada
              </p>
            </CardContent>
          </Card>

          {/* Status do Email de Confirmação */}
          {confirmationStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {confirmationStatus.sent ? (
                    <CheckCircle2 className="h-4 w-4 text-status-ok" />
                  ) : (
                    <XCircle className="h-4 w-4 text-status-danger" />
                  )}
                  Email de Confirmação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {confirmationStatus.sent ? (
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-status-ok mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-status-ok">Enviado com sucesso!</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Verifique sua caixa de entrada
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-status-danger mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-status-danger">Falha ao enviar</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {confirmationStatus.error || "Erro desconhecido"}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Verifique as configurações SMTP e tente novamente.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cache local */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" /> Sessão
              </CardTitle>
              <CardDescription>
                As configurações são salvas no servidor e também armazenadas localmente neste navegador para acesso offline.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Resultados da busca */}
      {showResults && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="h-4 w-4" /> Resultados
              </CardTitle>
              <CardDescription>
                {results.length > 0
                  ? `${results.length} email(ns) encontrado(s)`
                  : "Nenhum email encontrado"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum email não lido corresponde aos filtros definidos.
                  <br />
                  Verifique se a conexão está funcionando e se existem emails com o termo buscado.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((email) => (
                    <div
                      key={email.id}
                      className="rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-sm">{email.subject}</div>
                          <div className="text-xs text-muted-foreground mt-1">{email.from}</div>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {new Date(email.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      {email.text && (
                        <div className="mt-2 text-xs text-muted-foreground line-clamp-3">
                          {email.text.slice(0, 300)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
