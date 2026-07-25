# Memorias

## Sessão: 2026-07-25 — Fix deploy Vercel (3ª tentativa)

### Histórico

| Tentativa | Abordagem | Resultado |
|---|---|---|
| 1 | `postinstall: prisma generate` + `preset: vercel` | ✅ `.prisma/client` resolvido, mas `tslib` quebrou |
| 2 | `noExternals: ["tslib"]` (inline) | ❌ TypeError: `__toESM(...).default` undefined — `tslib` CJS tem `__esModule: true` |
| 3 | `tslib` traçado + script copia arquivos faltantes | ❌ `ERR_MODULE_NOT_FOUND` — Vercel não usa `node_modules` traçado, recria do zero |
| 4 **(atual)** | `tslib` externalizado + forçado no `package.json` + `node_modules/tslib/` removido | 🔄 Pendente testar |

### Problema

O Vercel **ignora** o `node_modules/` traçado pelo Nitro e recria as dependências do zero (provavelmente executa `npm install` baseado no `package.json` da função). O `package.json` anterior tinha `".prisma": "0.0.0"` (inválido), o que quebrava o `npm install`, e o `tslib` nunca era instalado.

### Solução Atual

**`vite.config.ts`**
- `externals.external` agora inclui `"tslib"` — o bundler mantém o import `from "tslib"` sem inlinear
- `.prisma` no externals para evitar que seja traçado como dependência inválida

**`scripts/clean-function-package.mjs`** (3 etapas)
1. Remove `.prisma` do `package.json` da função
2. Garante que `tslib` esteja no `package.json` (lê versão do `package.json` raiz)
3. Remove `node_modules/tslib/` traçado (incompleto) — força Vercel a instalar do npm

### Resultado do Build Local
- ✅ `package.json` da função: `@prisma/client`, `@prisma/client-runtime-utils`, `tslib`
- ✅ `node_modules/tslib/` removido
- ✅ Import: `import { __assign, __rest, __spreadArray } from "tslib"` (externo, 83 KB)

### Pendente
- Testar deploy na Vercel

### Autoria
VIBECODE
