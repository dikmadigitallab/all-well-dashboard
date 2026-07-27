# Deploy na Vercel

O projeto já está configurado para gerar build no formato da Vercel
(`nitro.preset = "vercel"` em `vite.config.ts`). Basta conectar o repo do
GitHub na Vercel e configurar as variáveis de ambiente.

## 1. Conectar o repositório

1. Sincronize este projeto Lovable com o GitHub (menu **GitHub → Connect
   project**).
2. Na Vercel: **Add New → Project → Import Git Repository** e selecione o
   repositório criado.
3. Em **Framework Preset** selecione **Other** (o `vercel.json` já define os
   comandos corretos — não use o preset "Vite").
   - Build Command: `npm run build`
   - Output Directory: (deixe em branco — o Nitro emite `.vercel/output`)
   - Install Command: `npm install`

## 2. Variáveis de ambiente (Environment Variables)

Adicione em **Project Settings → Environment Variables** (todas em
Production + Preview + Development):

### Backend (server-only)
| Nome | Valor |
|---|---|
| `SUPABASE_URL` | `https://gdsnytnolhvgxemuopux.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_H9x185vDR3LqFn6jr4Jcpg_6uQg56HM` |
| `SUPABASE_SERVICE_ROLE_KEY` | copie do painel **Cloud** do Lovable |
| `SUPABASE_DB_URL` / `DATABASE_URL` | copie do painel **Cloud** do Lovable e use porta `6543` no host `pooler` |
| `DATABASE_POOL_PORT` | `6543` |
| `LOVABLE_API_KEY` | copie do painel **Cloud** do Lovable (necessário para Lovable AI) |

### Frontend (expostas ao browser)
| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | mesmo valor de `SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | mesmo valor de `SUPABASE_PUBLISHABLE_KEY` |
| `VITE_SUPABASE_PROJECT_ID` | `gdsnytnolhvgxemuopux` |

> Os valores acima já apontam para o **mesmo Lovable Cloud** que a versão
> preview usa — dados e usuários são compartilhados.

## 3. Deploy

Basta um `git push` na branch principal. A Vercel roda:

1. `npm install` → dispara `postinstall` (`prisma generate`)
2. `npm run build` → Vite + Nitro geram `.vercel/output/`
3. Deploy automático como Serverless Function + assets estáticos.

## 4. OAuth (opcional)

Se você usa Google Sign-in, adicione o domínio da Vercel
(`seu-projeto.vercel.app` e o custom domain, se houver) em:

- **Lovable Cloud → Auth → URL Configuration → Redirect URLs**
- Console do Google OAuth (Authorized JavaScript origins e redirect URIs)
