# Checkpoints — Última Sessão

## Data: 17/07/2026

## Alterações Realizadas

### Autenticação Custom
- ✅ `.env`: adicionadas vars `AUTH_USERNAME`, `AUTH_PASSWORD`, `AUTH_JWT_SECRET`, `AUTH_USER_FULL_NAME`, `AUTH_USER_ROLE`
- ✅ `src/lib/custom-auth.ts`: servidor de auth (login + verifyToken com JWT via `jose`)
- ✅ `src/hooks/use-auth.tsx`: substituído por contexto custom (sem Supabase Auth)
- ✅ `src/routes/auth.tsx`: login simplificado (usuário/senha, sem cadastro)
- ✅ `src/routes/index.tsx`: compatível com novo auth
- ✅ `src/routes/_authenticated/route.tsx`: guard compatível
- ✅ `src/components/app-shell.tsx`: exibe fullName do usuário
- ✅ `src/start.ts`: removido `attachSupabaseAuth` do middleware
- ✅ Build passou sem erros

### Supabase
- ✅ `supabase/config.toml`: project_id atualizado para `gsxznhzbvcmkytfhkvug`
- ❌ Conexão direta ao banco via pg não funciona (pooler rejeita senha em todas as regiões)
- ❌ 4 migrations SQL não aplicadas
- ⚠️  Usuário `maria_eduarda` criado via Supabase Auth admin API (não usado mais)

## Próximos Passos
1. Resolver conexão ao banco (verificar senha no Supabase Dashboard)
2. Aplicar migrations SQL
3. Migrar auth para tabela própria no banco
