# Memorias

## Sessão: 2026-07-25 — Fix deploy Vercel (5ª tentativa)

### Histórico

| Tentativa | Abordagem | Resultado |
|---|---|---|
| 1 | `postinstall: prisma generate` + `preset: vercel` | ✅ `.prisma/client` resolvido, mas `tslib` quebrou |
| 2 | `noExternals: ["tslib"]` (inline) | ❌ TypeError: `__toESM(...).default` undefined — `tslib` CJS tem `__esModule: true` |
| 3 | `tslib` traçado + script copia arquivos faltantes | ❌ `ERR_MODULE_NOT_FOUND` — Vercel não usa `node_modules` traçado, recria do zero |
| 4 | `tslib` externalizado + forçado no `package.json` + `node_modules/tslib/` removido | ❌ Script foi modificado depois para copiar tslib + patchar imports relativos, causando `ERR_MODULE_NOT_FOUND` no `tslib.es6.mjs` |
| **5 (atual)** | `tslib` em `externals.external` + script limpa `.prisma` e garante `tslib` no `package.json` | 🔄 Pendente testar no Vercel |

### Problema Raiz
O Vercel **ignora** o `node_modules/` traçado pelo Nitro e recria as dependências do zero (provavelmente executa `npm install` baseado no `package.json` da função). O `package.json` anterior tinha `".prisma": "0.0.0"` (inválido), o que quebrava o `npm install`, e o `tslib` nunca era instalado.

### Solução Atual

**`vite.config.ts`**
- `externals.external` inclui `"tslib"`, `"@prisma/client"`, `.prisma`, etc.
- Removeu `vite.resolve.alias` para tslib (não afeta build do Nitro)

**`scripts/clean-function-package.mjs`** (2 etapas APENAS)
1. Remove `.prisma` do `package.json` da função
2. Garante que `tslib` esteja no `package.json` (lê versão do `package.json` raiz)
3. ❌ NÃO copia tslib manualmente
4. ❌ NÃO patcha imports para caminho relativo

### Resultado do Build Local
- ✅ `package.json` da função: `@prisma/client`, `@prisma/client-runtime-utils`, `tslib` (sem `.prisma`)
- ✅ Imports: `import { ... } from "tslib"` (resolução padrão de pacote Node.js)
- ✅ Sem cópia manual de tslib
- ✅ Sem patch de imports

### Pendente
- Usuário fazer commit, push e redeploy no Vercel
- Se falhar, tentar abordagem inline com alias no Nitro (`nitro.rollupConfig.plugins`)

## Sessão: 2026-07-27 — Fix login (Lovable RUNTIME_ERROR + pool size)

### Problema
- Login no Lovable resultava em tela branca com `RUNTIME_ERROR`
- Suspeita de estouro de pool de conexão
- Build local falhava com `ERR_MODULE_NOT_FOUND` para `jspdf`

### Diagnóstico

**1. Dependências faltando**
- `jspdf` e `jspdf-autotable` estavam em `package.json` mas NÃO instalados em `node_modules/`
- Isso quebrava o build e causava blank screen nas páginas que importam `reports.ts` (colaboradores, relatórios)

**2. Login criava conexões avulsas ao banco**
- `routes/api/login.ts` usava `new Client()` do `pg` em cada requisição
- Isso criava conexões FORA do pool do Prisma, podendo exaurir o pooler do Supabase (~15 conexões limite)
- Retry de 3 tentativas agravava o problema

### Correções

**`src/routes/api/login.ts`** — Refatorado para usar Prisma:
- Removeu `Client` do `pg`, `getDatabaseConnectionString()`, `queryUser()` (~60 linhas)
- Agora usa `prisma.user.findUnique()` via pool compartilhado
- Reduz conexões paralelas e respeita `max: 5/10` configurado no pool

**`node_modules/`** — Instalado `jspdf` e `jspdf-autotable`:
- `npm install` baixou os 23 pacotes ausentes

### Build
- ✅ `npm run build` passa sem erros
- ✅ `jspdf` e `jspdf-autotable` inclusos no bundle server-side

### Autoria
VIBECODE
