# Checkpoint — 2026-07-27

## Estado Atual
- Build local: ✅ passa com `npm run build`
- Login refatorado para usar Prisma pool (não cria conexões avulsas)
- `jspdf`/`jspdf-autotable` instalados (estavam faltando)
- Prisma client patcheado pós-generate para evitar `edge.js` (causa do erro WASM no Lovable)
- `engineType = "library"` + `binaryTargets` configurados no schema.prisma
- `@prisma/engines` incluído no package.json da função Vercel

## Últimas Alterações
- `src/routes/api/login.ts`: refatorado para usar `prisma.user.findUnique()` via pool compartilhado (removeu `Client` do `pg`, retry manual e funções auxiliares)
- `node_modules`: instalado `jspdf` e `jspdf-autotable` (faltavam)

## Problemas Resolvidos
1. **❌ Blank screen no Lovable**: `jspdf`/`jspdf-autotable` não instalados → build quebrava nas páginas que importam `reports.ts`. Agora instalados.
2. **❌ Pool size**: Login criava `new Client()` por requisição (~3 tentativas cada) → podia exaurir pooler Supabase. Agora usa pool compartilhado do Prisma (max 5/10).
3. **❌ `No such module "wasm/query_compiler_fast_bg-*.wasm"` + `WebAssembly.Module() disallowed by embedder`**: Prisma v7 usava WASM query compiler incompatível com Lovable. Resolvido com downgrade para Prisma v6 (engine binário nativo, zero WASM).

## Últimas Alterações
- **Protocolo**: Prisma v7 → v6.19.3
- `@prisma/adapter-pg` removido
- `prisma.server.ts`: simplificado para `new PrismaClient()` padrão
- `schema.prisma`: `url = env("DATABASE_URL")` adicionado, `engineType` removido

## A Fazer
- [ ] Testar login no Lovable
