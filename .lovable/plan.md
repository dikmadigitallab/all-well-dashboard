
## Escopo desta 1ª entrega (MVP priorizado)

1. **Backend Lovable Cloud** com autenticação e perfis (Admin/SESMT vs Gestor).
2. **Cadastro de colaboradores** com todos os campos da planilha (nome, empresa, área, setor, função, matrícula SAP, CPF, RG, PIS, nascimento, escala/turno, GHE, periodicidade, unidade, último exame, próximo exame, vencimento).
3. **Importação da planilha Excel** (upload .xlsx → inserção em lote com deduplicação por CPF).
4. **Dashboard gerencial** com KPIs (Em dia / A vencer 30d / Vencido), gráficos (evolução, distribuição por unidade/empresa/setor) e filtros por empresa, unidade, setor, cargo e período (semanal/mensal/trimestral/anual).
5. **Listagem/edição/CRUD** de colaboradores com filtros, busca e status calculado automaticamente com base em `próximo exame`.
6. **Exportação** da lista filtrada em Excel/CSV.

## Arquitetura preparada para as próximas etapas

Tabelas e estrutura já criadas prevendo:
- `exames` (histórico completo por colaborador, tipo admissional/periódico/demissional/retorno, agendamento, comparecimento, justificativa, ASO PDF).
- `pendencias` (motivo tipado: agendamento, falta, documentação, afastamento, outro).
- `convocacoes` (agenda + status de comparecimento).
- `alertas` (fila para notificação in-app + e-mail).
- `audit_log` para rastreabilidade.
- Enum de motivos, tipos de exame e status, para viabilizar rapidamente comparecimento, pendências, alertas por e-mail (Lovable Emails), preenchimento de formulários e relatórios em PDF nas próximas iterações.

## Perfis e permissões

- **Admin / SESMT**: CRUD total, importação, dashboards, relatórios.
- **Gestor**: somente leitura (dashboards, listas, relatórios).
- Roles armazenadas em tabela `user_roles` separada + função `has_role()` (padrão seguro contra escalonamento).

## Stack técnica

- TanStack Start + React + Tailwind + shadcn.
- Lovable Cloud (Supabase) — Postgres + Auth + Storage.
- Recharts para gráficos.
- SheetJS (xlsx) para import/export.
- Design corporativo sóbrio (azul-petróleo + neutros), foco em densidade de dados e legibilidade.

## Estrutura de rotas

```text
/auth                       — login / cadastro (público)
/                           — landing pública com CTA "Entrar"
/_authenticated/dashboard   — KPIs + gráficos + filtros
/_authenticated/colaboradores           — lista + busca + filtros + export
/_authenticated/colaboradores/novo      — cadastro (Admin)
/_authenticated/colaboradores/:id       — detalhes + edição (Admin)
/_authenticated/importar                — upload da planilha (Admin)
```

## Fora desta entrega (próximas etapas)

Módulos previstos na arquitetura mas construídos nas próximas iterações, conforme priorização: agendamento e convocações, registro de comparecimento/faltas com justificativas, painel de pendências, alertas automáticos por e-mail (Lovable Emails), preenchimento automático de formulários (PDF), relatórios em PDF, histórico completo por colaborador.

## Etapas de execução

1. Ativar Lovable Cloud.
2. Migrations: enum `app_role`, tabelas `profiles`, `user_roles`, `colaboradores`, `exames`, `pendencias`, `convocacoes`, `alertas`, função `has_role`, RLS + GRANTs.
3. Design system (tokens azul-petróleo/neutros) e layout autenticado com sidebar.
4. Auth (email/senha) + `_authenticated` layout + hook `useRole`.
5. Módulo colaboradores (lista, filtros, CRUD, export).
6. Importador de Excel.
7. Dashboard com KPIs e gráficos.
8. Landing pública + rota `/auth`.
