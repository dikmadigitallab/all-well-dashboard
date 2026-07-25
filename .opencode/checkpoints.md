# Checkpoints

## Sessão: 2026-07-24 — Fix deploy Vercel

### Estado atual
- Build local funcionando (vite build → Nitro preset vercel)
- Saída em `.vercel/output/` — formato nativo Vercel
- Prisma Client gerado em `node_modules/.prisma/client/`

### Arquivos modificados
- `package.json` — postinstall + tslib dependency
- `vite.config.ts` — nitro preset vercel + externals config
- `.opencode/memorias.md` — registro de decisões
- `.opencode/checkpoints.md` — este arquivo

### Próximos passos
- Commitar e fazer push para Vercel
- Validar deploy na Vercel
- Se houver erro, verificar logs da Vercel para mais detalhes
