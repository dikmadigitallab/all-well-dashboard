# Memórias

## Autenticação Custom (17/07/2026)
- Substituído Supabase Auth por sistema de autenticação 100% custom
- Credenciais armazenadas em `.env` (AUTH_USERNAME, AUTH_PASSWORD)
- JWT gerado com `jose` (HS256, expiração 24h)
- Servidor valida usuário/senha via server function `login()`
- Token armazenado no localStorage do cliente
- Login page modificada: campo "Usuário" (não email), sem aba de cadastro
- Role admin definida via AUTH_USER_ROLE no .env
- `AppShell` exibe `fullName` do usuário
- Supabase Auth files (`auth-attacher.ts`, `auth-middleware.ts`) mantidos como dead code

## Migrations Aplicadas (17/07/2026)
- Pooler Supabase (`aws-1-sa-east-1.pooler.supabase.com:5432`) está FUNCIONANDO
- Todas as 4 migrations SQL aplicadas com sucesso via `prisma db push`
- FK constraints de `auth.users` removidas (não usamos mais Supabase Auth)
- RLS policies e funções (has_role, is_admin) removidas (auth custom)

## Prisma ORM (17/07/2026)
- Prisma 7.8.0 instalado e configurado
- `@prisma/adapter-pg` para conexão direta ao PostgreSQL
- Schema em `prisma/schema.prisma` com 5 models + 6 enums
- `DATABASE_URL` configurada no `.env`
- Prisma client gerado e funcional
- `src/lib/prisma.server.ts` — singleton do PrismaClient (server-side)
- API endpoints criados:
  - `GET/POST /api/colaboradores` — listar/criar (suporta batch)
  - `GET/PUT/DELETE /api/colaboradores/$id` — buscar/atualizar/deletar
- Frontend atualizado para usar `fetch()` para as APIs ao invés de Supabase JS client
- Supabase client (`@/integrations/supabase/client`) ainda existe como dead code

## Segurança nas APIs (22/07/2026)
- Adicionado model `User` no schema (tabela `users` com username, password_hash, role)
- Criado `src/lib/auth.server.ts` com funções: hashPassword, verifyPassword, createToken, verifyToken, requireAuth, requireRole
- Login (`POST /api/login`) agora autentica contra banco de dados (tabela `users`)
- Token JWT é gerado com `jose` e verificado nas rotas de API
- `GET/POST /api/colaboradores` — protegido com `requireAuth`
- `GET/PUT/DELETE /api/colaboradores/$id` — protegido com `requireAuth`
- `POST /api/apply-migrations` — requer role "admin"
- `created_by` agora extraído do token JWT, não do body da requisição
- Pool config melhorado: `idleTimeoutMillis`, `connectionTimeoutMillis`, SSL condicional
- `DATABASE_SSL=false` permite desabilitar SSL quando necessário
- Instalado `bcryptjs` para hash de senhas
- Front-end: criado `authFetch()` e `authHeaders()` em `custom-auth.ts`
- Todas as chamadas front-end para API agora enviam Bearer token
- Criado `POST /api/setup` para bootstrap do primeiro admin (só funciona sem usuários)
- Criado `prisma/seed.ts` com script de seed configurado no `package.json`

## Rotina de Emails (22/07/2026)
- Adicionado model `EmailConfig` (tabela `email_configs`) no schema Prisma
  - Armazena: email_address, email_password_enc (criptografada), imap_host, imap_port, search_term, sender_filter, folder, ativo
  - Index por user_id
- Adicionado model `EmailLog` (tabela `email_logs`) para histórico de execuções
- Instalado `imapflow` para conexão IMAP
- Criado `src/lib/email-crypto.ts` — criptografia AES-256-GCM para senhas (usa AUTH_JWT_SECRET como chave)
- Criado `src/lib/email-service.ts` — serviço de busca IMAP:
  - Conecta via ImapFlow, busca emails não lidos
  - Filtra por termo (assunto + corpo) e remetente
  - Retorna subject, from, date, text, html
- Criado `src/routes/api/email-config.ts` — API route:
  - `GET /api/email-config` — busca config do usuário logado
  - `PUT /api/email-config` — cria ou atualiza config (upsert por user_id)
- Criado `src/routes/api/email-config.test.ts` — `POST /api/email-config/test` — testa conexão e busca
- Criado `src/routes/_authenticated/config-email.tsx` — página de configuração:
  - Formulário com: email, senha, servidor IMAP, porta, pasta, termo de busca, filtro de remetente, ativar/desativar
  - Botões: Salvar, Testar conexão, Buscar emails agora
  - Cache local via localStorage (fallback quando servidor indisponível)
  - Exibição de resultados da busca
- Adicionado link "Config. Email" na sidebar do AppShell
- `prisma db push` executado com sucesso
- Build passou sem erros

## Sistema de Notificações (23/07/2026)
- Criado endpoint `GET /api/notificacoes` em `src/routes/api/notificacoes.ts`
  - Protegido com `requireAuth` (apenas usuários autenticados)
  - Retorna lista de colaboradores ativos com `proximo_exame` nos próximos 60 dias (a_vencer)
  - Retorna lista de colaboradores ativos com `proximo_exame` vencido (vencidos)
  - Dados retornados: id, nome, empresa, proximo_exame, status, dias_para_vencer
  - Ordenação: a_vencer por dias_para_vencer (menor primeiro), vencidos por data (mais antigo primeiro)
  - Contagem total e por categoria
- Criado componente `NotificationBell` em `src/components/notification-bell.tsx`
  - Ícone de sino (`Bell`) da lucide-react
  - Badge vermelho com contagem total (99+ se >99)
  - Dropdown via `Popover` do Radix UI com duas seções: "Vencendo em 60 dias" e "Vencidos"
  - Cada item da lista é um link para `/colaboradores/$id`
  - Exibe dias restantes para os "a vencer" e rótulo "Vencido" para os vencidos
  - Limite de 20 itens por seção com link "Ver todos" quando exceder
  - Re-busca automática a cada 60 segundos
  - ScrollArea para listas longas
  - Estado vazio e de carregamento tratados
- Integrado `NotificationBell` no `AppShell` (sidebar header)
  - Exibido apenas para admin (`isAdmin`)
  - Posicionado ao lado do logo/branding

## Agendamento de Exames (23/07/2026)
- Criado model `EmailContato` no schema (tabela `email_contatos`) para salvar emails de notificação
- Criado endpoint `GET/POST /api/exames` — listar e criar agendamentos
- Criado endpoint `GET/POST /api/emails-contato` — listar e adicionar emails de contato
- Criado endpoint `POST /api/exames/enviar-confirmacao` — enviar email de confirmação via SMTP
- Criada página `/agendar-exames` com:
  - Calendário para seleção de data
  - Busca de colaborador com autocomplete (Command/cmdk)
  - Seleção de tipo de exame (periódico, admissional, etc.)
  - Campo de email combinado: selecionar da lista ou adicionar novo (salvo automaticamente)
  - Botões "Agendar" e "Agendar e enviar confirmação"
  - Lista de exames agendados agrupados por data
- Adicionado link "Agendar exames" na sidebar (adminOnly)
- **Bug corrigido**: rota `/api/exames` não estava sendo registrada por conflito entre `exames.ts` (arquivo) e `exames/` (diretório). Solução: movido conteúdo de `exames.ts` para `exames/index.ts` e removido o arquivo plano

## Próximos Passos
- Limpar arquivos legados do Supabase (`integrations/supabase/`)
- Migrar tipos de `@/integrations/supabase/types` para tipos do Prisma
- Remover variáveis AUTH_USERNAME/AUTH_PASSWORD do .env (não usadas mais)

## Credenciais de acesso
- Usuário: maria_eduarda
- Senha: 123456
