# Checkpoint — 23/07/2026

## Estado Atual
- Build: ✅ passa (client + SSR + Nitro)
- Rotas: `exames/index.ts` + `exames/enviar-confirmacao.ts` (conflito de diretório resolvido)
- Prisma: model `Exame` + `EmailContato` + `EmailConfig` — todos `prisma db push` aplicados
- Frontend: página `/agendar-exames` com formulário completo e listagem

## Pendente
- Testar fluxo: "Agendar" e "Agendar e enviar confirmação" agora que a rota está correta
