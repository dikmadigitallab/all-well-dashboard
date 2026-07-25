# Memorias

## Sessão: 2026-07-24 — Fix deploy Vercel

### Problema 1: Prisma Client não encontrado
```
Error: Cannot find module '.prisma/client/default'
```

### Problema 2: tslib não encontrado (após fix do problema 1)
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tslib'
```

### Causas
1. `prisma generate` nunca era executado na Vercel — o diretório `.prisma/client/` não existia
2. O preset padrão do Lovable config era `cloudflare-module`, incompatível com Vercel
3. `tslib` era uma dependência transitória traçada pelo Nitro, mas o trace copiava apenas parte dos arquivos, faltando `tslib.es6.mjs` necessário para resolução ESM

### Alterações Feitas

1. **package.json**
   - Adicionado `"postinstall": "prisma generate"` — gera o Prisma Client automaticamente após `npm install`
   - Adicionado `"tslib": "^2.8.1"` em `dependencies` — garante que esteja disponível no runtime

2. **vite.config.ts**
   - Adicionado `nitro: { preset: "vercel" }` — sobrescreve o default `cloudflare-module`
   - Adicionado `externals.external` — externaliza `@prisma/client`, `.prisma/client`, `prisma`, `@prisma/adapter-pg` e `pg`
   - Adicionado `externals.traceExclude: ["tslib"]` — evita trace incompleto do tslib

### Resultado
Build executado com sucesso localmente. Saída em `.vercel/output/` (formato Vercel, preset vercel, nodejs24.x).

### Autoria
VIBECODE
