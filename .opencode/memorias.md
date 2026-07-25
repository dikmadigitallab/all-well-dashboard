# Memorias

## Sessão: 2026-07-24 — Fix deploy Vercel (continuação)

### Problemas Resolvidos

1. **Prisma Client não encontrado** — `Error: Cannot find module '.prisma/client/default'`
   - ✅ Causa: `prisma generate` nunca executado na Vercel
   - ✅ Fix: `"postinstall": "prisma generate"` no package.json

2. **tslib não encontrado** — `Error: Cannot find package 'tslib'`
   - ✅ Causa: Nitro traçava `tslib` como dependência externa, mas copiava apenas parte dos arquivos (faltava `tslib.es6.mjs`)
   - ✅ Fix: `noExternals: ["tslib"]` + `traceDeps: ["!tslib"]` — força bundling inline do tslib

3. **Dependência inválida `.prisma` no package.json da função** — `npm install` quebrava na Vercel
   - ✅ Causa: Nitro listava `node_modules/.prisma` como `".prisma": "0.0.0"` no `package.json` da função, mas `.prisma` não é um nome de pacote npm válido
   - ✅ Fix duplo:
     - Preventivo: `".prisma"` adicionado ao `externals.external` no `vite.config.ts`
     - Redundante: script `scripts/clean-function-package.mjs` roda após o build e remove dependências com nome começando por `.`

### Alterações Feitas

1. **vite.config.ts**
   - `noExternals: ["tslib"]` — força bundle inline do tslib em vez de externalizar
   - `traceDeps: ["!tslib"]` — exclui tslib do tracing
   - `externals.external` agora inclui `".prisma"` (além dos já existentes)

2. **scripts/clean-function-package.mjs** (novo)
   - Lê `.vercel/output/functions/__server.func/package.json`
   - Remove dependências com nome inválido (começam com `.`)
   - Executado automaticamente via `npm run build`

3. **package.json**
   - Scripts `build` e `build:dev` agora encadeiam `&& node scripts/clean-function-package.mjs`

### Resultado Final
- Build local: ✅ sucesso
- Tracing: 3 dependências (sem tslib), 10 arquivos
- `tslib`: bundled inline no `@radix-ui/react-alert-dialog+[...].mjs` (104.50 kB)
- `package.json` da função: limpo, sem `.prisma`
- Pronto para deploy na Vercel

### Pendente
- Testar deploy na Vercel com o build atualizado

### Autoria
VIBECODE
