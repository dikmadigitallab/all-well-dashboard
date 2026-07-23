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

## Próximos Passos
- Migrar auth custom para tabela `users` própria (remover dependência de .env)
- Criar tabela `users` (ou usar `user_roles` já existente com uma `users` table)
- Limpar arquivos legados do Supabase (`integrations/supabase/`)
- Remover imports de `@/integrations/supabase/types` e usar tipos do Prisma

## Credenciais de acesso
- Usuário: maria_eduarda
- Senha: 123456
