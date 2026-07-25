# Checkpoint — 2026-07-25

## Estado Atual
- Build local: ✅ passa com `npm run build`
- Estratégia: `tslib` externalizado + forçado no `package.json` da função
- `node_modules/tslib/` removido da função (Vercel instalará via npm)
- `.prisma` removido do `package.json` da função

## Últimas Alterações
- `vite.config.ts`: adicionado `"tslib"` ao `externals.external`
- `scripts/clean-function-package.mjs`: agora garante `tslib` no package.json e remove node_modules/tslib/

## Problema Principal
- `ERR_MODULE_NOT_FOUND: Cannot find package 'tslib'` no runtime da Vercel
- Hipótese: Vercel recria node_modules do zero, ignorando o trace do Nitro
- Fix atual: package.json limpo + tslib listado → Vercel instala via npm

## A Fazer
- [ ] Commitar, push e testar deploy na Vercel
