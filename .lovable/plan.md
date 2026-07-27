## Escopo proposto (5 módulos)

Como é um pacote grande, sugiro entregar em **3 iterações sequenciais**, cada uma testável de forma independente. Confirme e eu executo — ou me diga se prefere reordenar/reduzir.

---

### Iteração 1 — Agendamento, Convocações, Comparecimento e Pendências

**Backend (uma migration):**
- Tabela `convocacoes` (colaborador, exame_id, data, local, status: convocado/confirmado/compareceu/faltou/reagendar, observação).
- Reaproveitar `exames` já existente para o histórico e usar `pendencias` derivadas de `exames.status = pendente` + `motivo_pendencia` (já modelado).
- View/funções auxiliares para KPIs de pendências.
- RLS: admin/SESMT escreve; gestor lê.

**Frontend (novas rotas):**
- `/_authenticated/exames` — agenda: cria exame agendado, marca comparecimento (compareceu/faltou + justificativa opcional), reagendar. Filtros por período/empresa/unidade.
- `/_authenticated/pendencias` — painel com contadores por motivo (agendamento, falta, documentação, afastamento, recusa, outro), gráfico de pizza + lista filtrável, ação "resolver pendência".
- No detalhe do colaborador (`/colaboradores/:id`): aba "Histórico de exames" listando todos os `exames` do colaborador com status/tipo/data.

---

### Iteração 2 — Alertas automáticos por e-mail + notificação no painel

- Configurar Lovable Emails (domínio + template `aso-vencimento`).
- Server function diária (cron `pg_cron`) que:
  - Recalcula alertas em `alertas` (ASO vencido, a vencer em 30d, exame pendente > 7d).
  - Dispara e-mail para admin/SESMT e gestores agrupando por unidade.
- Sino de notificação no header (contador de `alertas` não lidos + dropdown com lista).
- Página `/_authenticated/alertas` com lista completa, filtros e ação "marcar como lido".

> Requer domínio de e-mail próprio. Vou pedir o setup na hora da iteração 2.

---

### Iteração 3 — PDF de formulário de exame + Relatórios exportáveis

- **Formulário de exame em PDF**: botão em `/colaboradores/:id` → gera PDF preenchido (dados do colaborador, tipo de exame, GHE, riscos, campos para clínica preencher). Usa `pdf-lib` no lado servidor.
- **Relatórios PDF**:
  - Relatório gerencial (KPIs, gráficos, distribuição por unidade/empresa).
  - Relatório por unidade/empresa (lista de colaboradores com status).
  - Relatório de pendências.
- Mantém o export Excel já existente na lista de colaboradores.
- Botões "Exportar PDF" em Dashboard, Colaboradores e Pendências.

---

### Detalhes técnicos

- Server functions com `requireSupabaseAuth`, escritas admin-only via `has_role`.
- PDFs gerados server-side (`pdf-lib`) e devolvidos como `Response` via server route `/api/pdf/*`.
- Cron de alertas via `pg_cron` + `pg_net` chamando `/api/public/hooks/run-alertas` com verificação por `apikey`.
- Gráficos com Recharts (já instalado).

---

### O que faço agora

Se você aprovar, começo pela **Iteração 1** completa nesta rodada (agendamento + comparecimento + pendências). Iterações 2 e 3 vêm nas próximas mensagens, para manter o entregável testável a cada passo.

Confirma? Se quiser mudar a ordem (ex.: PDFs antes de alertas) ou tirar algo do escopo, me diga.
