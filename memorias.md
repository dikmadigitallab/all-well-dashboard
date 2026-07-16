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

## Pendente
- Conexão direta ao banco PostgreSQL não funciona (pooler rejeita senha)
- 4 migrations SQL não aplicadas (schema de colaboradores, exames, alertas, etc.)
- Usuário `maria_eduarda` criado via Supabase Auth admin API (pode ser removido depois)
- Quando banco estiver acessível: migrar auth para tabela própria e aplicar migrations

## Credenciais de acesso
- Usuário: maria_eduarda
- Senha: 123456
