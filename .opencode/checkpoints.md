# Checkpoint — 2026-07-27

## Estado Atual
- Build local: ✅ passa com `npm run build`
- Login refatorado para usar Prisma pool (não cria conexões avulsas)
- `jspdf`/`jspdf-autotable` instalados (estavam faltando)
- Estratégia Vercel: `tslib` externalizado + forçado no `package.json` da função
- `.prisma` removido do `package.json` da função

## Últimas Alterações
- `src/routes/api/login.ts`: refatorado para usar `prisma.user.findUnique()` via pool compartilhado (removeu `Client` do `pg`, retry manual e funções auxiliares)
- `node_modules`: instalado `jspdf` e `jspdf-autotable` (faltavam)

## Problemas Resolvidos
1. **❌ Blank screen no Lovable**: `jspdf`/`jspdf-autotable` não instalados → build quebrava nas páginas que importam `reports.ts`. Agora instalados.
2. **❌ Pool size**: Login criava `new Client()` por requisição (~3 tentativas cada) → podia exaurir pooler Supabase. Agora usa pool compartilhado do Prisma (max 5/10).

## A Fazer
- [ ] Commitar, push e testar deploy na Vercel
