# Checkpoint — 2026-07-24

## Estado Atual
- Build local: ✅ passa com `npm run build`
- tslib: traçado + complementado pelo script pós-build (com `tslib.es6.mjs`)
- `.prisma`: removido do `package.json` da função
- Pronto para deploy na Vercel

## Últimas Alterações
- `vite.config.ts`: removido `noExternals`/`traceDeps` do tslib; adicionado `.prisma` ao externals
- `package.json`: build command com postbuild script; tslib como dependência direta
- `scripts/clean-function-package.mjs`: limpa `.prisma` + completa tslib + verifica integridade

## Problemas Conhecidos Ainda Não Testados
- Deploy na Vercel ainda não foi validado com estas alterações
