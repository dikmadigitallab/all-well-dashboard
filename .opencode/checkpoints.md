# Checkpoint — 2026-07-27

## Estado Atual
- Build local: ✅ passa com `npm run build`
- Login refatorado para usar Prisma pool (não cria conexões avulsas)
- `jspdf`/`jspdf-autotable` instalados (estavam faltando)
- Prisma client patcheado pós-generate para evitar `edge.js` (causa do erro WASM no Lovable)
- `engineType = "library"` + `binaryTargets` configurados no schema.prisma
- `@prisma/engines` incluído no package.json da função Vercel

## Últimas Alterações
- `src/routes/api/login.ts`: refatorado para usar `prisma.user.findUnique()` via pool compartilhado
- `node_modules`: instalado `jspdf` e `jspdf-autotable` (faltavam)
- **Protocolo**: Prisma v7 → v6.19.3
- `@prisma/adapter-pg` removido
- `prisma.server.ts`: `datasources` → `datasourceUrl` (v6 NÃO aceita `datasources` no constructor)
- `schema.prisma`: `url = env("DATABASE_URL")`, `engineType` removido, `binaryTargets`: `linux-musl` → `rhel-openssl-3.0.x`

## Problemas Resolvidos
1. **❌ `Unknown property datasources`**: Prisma v6 não aceita `datasources` no constructor. Usar `datasourceUrl` em vez disso.
2. **❌ Blank screen no Lovable**: `jspdf`/`jspdf-autotable` não instalados → build quebrava nas páginas que importam `reports.ts`. Agora instalados.
3. **❌ Pool size**: Login criava `new Client()` por requisição (~3 tentativas cada) → podia exaurir pooler Supabase. Agora usa pool compartilhado do Prisma.
4. **❌ `WebAssembly.Module() disallowed by embedder`**: Prisma v7 usava WASM incompatível com Lovable. Downgrade para Prisma v6 (engine binário).
5. **❌ Engine binary incompatível**: `linux-musl-openssl-3.0.x` (Alpine) não roda no Vercel (Amazon Linux). Agora `rhel-openssl-3.0.x`.

## A Fazer
- [ ] Testar login no Lovable (após commit + push)
