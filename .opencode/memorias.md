# Memorias

## Sessão: 2026-07-24 — Fix deploy Vercel (final)

### Problema 1: Prisma Client não encontrado
```
Error: Cannot find module '.prisma/client/default'
```
- ✅ Causa: `prisma generate` nunca executado na Vercel  
- ✅ Fix: `"postinstall": "prisma generate"` no `package.json`

### Problema 2: tslib não encontrado (ERR_MODULE_NOT_FOUND)
```
Error: Cannot find package 'tslib'
```
- ✅ Causa: Nitro traçava `tslib` mas copiava apenas `modules/`, `package.json` e `tslib.js` — faltava `tslib.es6.mjs`, que é o entrypoint ESM exigido pelo `import { __assign } from "tslib"`  
- ✅ Fix (tentativa 1 — falhou): `noExternals: ["tslib"]` + `traceDeps: ["!tslib"]` — inlinou o tslib, mas quebrou o `__toESM` do bundler porque o tslib tem `__esModule: true`  
- ✅ Fix (final): Remover `noExternals`/`traceDeps`, deixar tslib ser traçado normalmente + script pós-build copia os arquivos faltantes

### Problema 3: Dependência inválida `.prisma` no package.json da função
- ✅ Causa: Nitro listava `node_modules/.prisma` como `".prisma": "0.0.0"` no `package.json` da função — `.prisma` não é nome de pacote npm válido, quebrava o `npm install` na Vercel  
- ✅ Fix duplo:
  - Preventivo: `".prisma"` no `externals.external` do `vite.config.ts`
  - Redundante: script `scripts/clean-function-package.mjs` remove dependências com nome começando por `.`

### Problema 4: TypeError no bundle inline do tslib
```
TypeError: Cannot destructure property '__extends' of '__toESM(...).default' as it is undefined.
```
- ✅ Causa: `noExternals: ["tslib"]` fez o bundler inlinear o tslib. O tslib CJS tem `__esModule: true` (setado pelo `createExporter`). O `__toESM` vê isso e retorna o objeto sem `.default`, mas o código tenta acessar `.default` — resultando em `undefined`  
- ✅ Fix: Reverter o inline, deixar tslib como dependência externa traçada, e garantir que `tslib.es6.mjs` seja copiado

### Alterações Atuais

**`vite.config.ts`**
- `preset: "vercel"` — sobrescreve o default `cloudflare-module`
- `externals.external`: `@prisma/client`, `.prisma/client`, `.prisma`, `prisma`, `@prisma/adapter-pg`, `pg`
- Sem `noExternals` ou `traceDeps` — tslib é traçado normalmente

**`scripts/clean-function-package.mjs`** (faz 3 coisas)
1. Remove dependências inválidas (`.prisma`) do `package.json` da função
2. Copia arquivos faltantes do `tslib` (`tslib.es6.mjs`, `tslib.es6.js`, `tslib.d.ts`) da raiz para `node_modules/tslib/` da função
3. Verifica integridade do `.prisma` no node_modules da função

**`package.json`**
- `"postinstall": "prisma generate"`
- `"tslib": "^2.8.1"` como dependência direta
- `build` executa: `vite build && node scripts/clean-function-package.mjs`

### Resultado Final
- Build local: ✅ sucesso
- Tracing: 4 dependências incluindo `tslib` (14 arquivos)
- `@radix-ui/react-alert-dialog+[...].mjs`: 83.09 kB (tslib NÃO inlinado)
- Import: `import { __assign, __rest, __spreadArray } from "tslib"` (externo)
- `node_modules/tslib/` na função: completo (com `tslib.es6.mjs`)
- `package.json` da função: apenas `@prisma/client`, `@prisma/client-runtime-utils`, `tslib`
- Pronto para deploy na Vercel

### Pendente
- Testar deploy na Vercel com o build atualizado

### Autoria
VIBECODE
