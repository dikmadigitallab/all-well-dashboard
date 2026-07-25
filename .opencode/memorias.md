# Memorias

## Sessão: 2026-07-24 — Fix deploy Vercel (Prisma MODULE_NOT_FOUND)

### Problema
Erro ao deploy na Vercel:
```
Error: Cannot find module '.prisma/client/default'
Require stack: /var/task/node_modules/@prisma/client/default.js
```

### Causa
O `@prisma/client/default.js` faz `require('.prisma/client/default')`, que o Node.js resolve através da cadeia de `node_modules/` até `node_modules/.prisma/client/default.js`. Esse diretório só existe após executar `prisma generate`. Na Vercel, o `prisma generate` nunca era executado durante o build.

### Alterações Feitas

1. **package.json** — Adicionado script `postinstall: "prisma generate"` para garantir que o Prisma Client seja gerado automaticamente após `npm install` na Vercel.

2. **vite.config.ts** — Adicionada configuração Nitro para Vercel:
   - `preset: "vercel"` — sobrescreve o default `cloudflare-module` do Lovable config
   - `externals.external` — externaliza `@prisma/client`, `.prisma/client`, `prisma`, `@prisma/adapter-pg` e `pg` para evitar que o bundler quebre as requires dinâmicas

### Resultado
Build executado com sucesso localmente. Saída gerada em `.vercel/output/` no formato esperado pela Vercel.

### Autoria
VIBECODE
