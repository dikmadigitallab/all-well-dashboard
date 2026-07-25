# Checkpoint — 2026-07-24

## Estado Atual
- Build local: ✅ passa com npm run build
- tslib: bundled inline (não externalizado)
- .prisma: removido do package.json da função via postbuild script
- Pronto para deploy na Vercel

## Últimos Commits
- (pendente) — o usuário precisa commitar e fazer push para testar o deploy

## Mudanças desde o último checkpoint
- `vite.config.ts`: adicionado `.prisma` ao externals, `noExternals`, `traceDeps`
- `package.json`: build command com postbuild script
- `scripts/clean-function-package.mjs`: novo arquivo
- `tslib` adicionado como dependência direta
