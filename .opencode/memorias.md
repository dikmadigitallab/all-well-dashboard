# Memorias

## Sessão: 2026-07-27 — Fix build: @dnd-kit packages não instalados

### Problema
- Página "indisponível" no Lovable — build falhava
- `node_modules/@dnd-kit/` existia mas estava VAZIO — nenhum subpacote instalado
- Erro: `Rolldown failed to resolve import "@dnd-kit/core" from "kanban-exames.tsx"`

### Correção
- Executado `npm install @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities`
- 102 pacotes instalados (incluindo dependências internas do @dnd-kit)
- Build local: ✅ passa sem erros
- `@dnd-kit/core@6.3.1`, `@dnd-kit/modifiers@9.0.0`, `@dnd-kit/sortable@10.0.0`, `@dnd-kit/utilities@3.2.2`

### Causa Raiz
Provavelmente os pacotes foram adicionados ao `package.json` mas o `npm install` não foi executado (ou foi executado antes da adição e depois nunca mais), deixando o diretório `@dnd-kit` vazio.

### Autoria
VIBECODE

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

## Sessão: 2026-07-27 — Fix erro WASM Prisma v7 no Lovable

### Problema
- Lovable exibia: `Erro interno: No such module "wasm/query_compiler_fast_bg-34bd5a009b666ebc.wasm"`
- Causa raiz: Prisma v7 usa **WASM query compiler** por padrão, e o client `edge.js` carrega o `.wasm` via `import()` dinâmico, que quebra no Lovable/Vercel porque o bundler Vite/Nitro renomeia o arquivo com hash
- O `engineType` não estava especificado no schema, então o default do Prisma v7 (`"wasm"`) era usado

### Correções

**1. `prisma/schema.prisma`**
- Adicionado `engineType = "library"` — usa o engine binário clássico (mais compatível com serverless)
- Adicionado `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` — necessario para deploy Vercel (linux-musl)

**2. `scripts/patch-prisma-client.mjs` (NOVO)**
- Patch pós-`prisma generate` que modifica `.prisma/client/package.json`:
  - Força `#main-entry-point` a usar `./index.js` em TODAS as condições (edge-light, workerd, worker)
  - Força `exports["."]` e `exports["./client"]` a usar `./index.js` em todas as condições
  - Substitui `#wasm-compiler-loader` por um loader seguro baseado em base64 (`wasm-safe-loader.mjs`)
- Isso impede que o runtime carregue `edge.js` (que faz `import()` dinâmico do `.wasm`)

**3. `package.json`**
- `postinstall` atualizado: `prisma generate && node scripts/patch-prisma-client.mjs` — o patch roda automaticamente em cada `npm install`

**4. `scripts/clean-function-package.mjs`**
- Adicionado `@prisma/engines` ao package.json da função Vercel (necessário para o engine binário)

**5. `vite.config.ts`**
- Adicionado `@prisma/engines` aos externals (nitro + vite.ssr)

### Build
- ✅ `npm run build` passa sem erros
- ✅ Nenhum erro WASM no build
- ✅ Function package.json inclui `@prisma/engines`

### Autoria
VIBECODE

## Sessão: 2026-07-27 — Fix erro WASM (2ª tentativa) — Downgrade Prisma v7 → v6

### Problema
Após o patch do client (que trocou `edge.js` por `index.js`), o Lovable passou a exibir:
`WebAssembly.Module(): Wasm code generation disallowed by embedder`

Isso ocorre porque o **Prisma v7** usa o WASM query compiler **sempre**, mesmo com `engineType = "library"`. O runtime do Lovable simplesmente não permite `WebAssembly.Module()`.

### Solução
**Downgrade do Prisma v7.8.0 → v6.19.3** — o v6 não tem o WASM compiler, usa o engine binário nativo (Rust).

### Mudanças

**1. `package.json`**
- `@prisma/client`: `^7.8.0` → `^6.19.3`
- `prisma`: `^7.8.0` → `^6.19.3`
- `@prisma/adapter-pg`: **removido** (era específico do v7)
- `allowScripts`: versões atualizadas para v6

**2. `prisma/schema.prisma`**
- Removido `engineType = "library"` (não existe no v6)
- Adicionado `url = env("DATABASE_URL")` (obrigatório no v6)
- Mantido `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`

**3. `src/lib/prisma.server.ts`**
- Removido `PrismaPg` adapter e `Pool` do `pg`
- Agora usa `new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })` (padrão v6)

**4. `vite.config.ts`**
- Removido `@prisma/adapter-pg` dos externals
- Mantido `@prisma/engines`, `.prisma/client`, etc.

**5. `scripts/clean-function-package.mjs`**
- Versão do `@prisma/engines` agora usa a mesma do `@prisma/client` (v6)

### Client Gerado (v6)
- Usa `@prisma/client/runtime/library.js` (engine binário)
- `config.engineWasm = undefined` e `config.compilerWasm = undefined` → **zero WASM**
- Patch ainda funciona e bloqueia condições edge (mas não é mais crítico)

### Build
- ✅ `npm run build` passa sem erros

### Autoria
VIBECODE

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

## Sessão: 2026-07-27 — Fix binaryTarget para Vercel Node.js 20.x

### Problema
Após downgrade Prisma v7 → v6, a página ficava "indisponível" no Lovable. Causa: o `binaryTargets` usava `linux-musl-openssl-3.0.x` (Alpine/musl), mas o runtime Vercel Node.js 20.x é Amazon Linux 2023 (GLIBC, `rhel-openssl-3.0.x`). O engine .so.node compilado para musl não carregava via `process.dlopen` num sistema GLIBC.

### Correção
- `prisma/schema.prisma`: `binaryTargets` alterado de `["native", "linux-musl-openssl-3.0.x"]` para `["native", "rhel-openssl-3.0.x"]`
- `prisma generate` baixou o engine `libquery_engine-rhel-openssl-3.0.x.so.node`
- Build `.vercel/output/` agora contém apenas o engine correto

### Build
- ✅ `prisma generate` com sucesso
- ✅ `npm run build` passa sem erros
- ✅ Engine correto no output function

### Autoria
VIBECODE
