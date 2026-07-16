# Checkpoints — Última Sessão

## Data: 17/07/2026

## Alterações Realizadas

### Prisma ORM
- ✅ Prisma 7.8.0 + @prisma/adapter-pg instalados
- ✅ `prisma/schema.prisma` criado com models: Profile, UserRole, Colaborador, Exame, Alerta + 6 enums
- ✅ `prisma.config.ts` configurado com DATABASE_URL
- ✅ `prisma db generate` — client gerado
- ✅ `prisma db push` — schema sincronizado com o banco (pooler Supabase)
- ✅ FK constraints para `auth.users` removidas
- ✅ RLS policies e funções (has_role, is_admin) removidas
- ✅ `src/lib/prisma.server.ts` — singleton com PrismaPg adapter

### APIs de Dados
- ✅ `GET/POST /api/colaboradores` — listar (orderBy nome, limit 5000) / criar (single ou batch)
- ✅ `GET /api/colaboradores/$id` — buscar com exames incluídos
- ✅ `PUT /api/colaboradores/$id` — atualizar
- ✅ `DELETE /api/colaboradores/$id` — remover

### Frontend Atualizado
- ✅ `src/routes/_authenticated/colaboradores/index.tsx` — usa fetch /api/colaboradores
- ✅ `src/routes/_authenticated/colaboradores/$id.tsx` — usa fetch CRUD via API
- ✅ `src/routes/_authenticated/dashboard.tsx` — usa fetch /api/colaboradores
- ✅ `src/routes/_authenticated/importar.tsx` — usa fetch POST /api/colaboradores (batch)
- ✅ Build passou sem erros

### Arquivos Temporários
- ✅ `tmp-fk-query.sql`, `tmp-drop-fks.sql`, `tmp-drop-deps.sql` removidos

### .env
- ✅ Adicionada `DATABASE_URL` com connection string PostgreSQL

## Nova Estrutura
```
prisma/
├── schema.prisma      # Schema oficial do banco
├── prisma.config.ts    # Config Prisma CLI
src/
├── lib/
│   ├── prisma.server.ts  # PrismaClient singleton (server-only)
│   └── ...
├── routes/
│   ├── api/
│   │   ├── colaboradores.ts    # List/criar
│   │   ├── colaboradores.$id.ts # Buscar/atualizar/deletar
│   │   └── ...
│   └── ...
```

## Próximos Passos
1. Criar tabela `users` própria e migrar auth custom (sair do .env)
2. Limpar arquivos legados Supabase (`integrations/supabase/`)
3. Migrar tipos de `@/integrations/supabase/types` para tipos do Prisma
4. Considerar adicionar outros CRUDs (exames, alertas, dashboard consolidado)
