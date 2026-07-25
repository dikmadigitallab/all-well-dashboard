# Memórias do Projeto

## 2024-07-24 — Correção: Status do card não reflete regressão no Kanban
[...]

## 2024-07-24 — Fluxo de "Faltou" redireciona para agendamento
[...]

## 2024-07-24 — Tela de agendamento: cards por colaborador

**Problema:** A listagem de exames agendados era agrupada por data (linhas soltas), dificultando a visualização de todos os agendamentos de um mesmo colaborador.

**Solução:**
- Agrupamento `examesPorColaborador` em vez de `examesPorData`
- Cada colaborador agora aparece em um **Card** com nome, empresa e todos os seus exames listados dentro
- Cada exame dentro do card mostra: tipo, clínica, badges das etapas (1ª e/ou 2ª), badge "Faltou" se houver, botões de reagendar e desmarcar
- `examesPorData` removido (não usado)

**Arquivos alterados:**
- `src/routes/_authenticated/agendar-exames.tsx`

## 2026-07-24 — Kanban: coluna "A agendar" com exames faltou + badge de etapa

**Problemas:**
1. Drag para "a_agendar" era bloqueado (`buildDropPayload` retornava `null`)
2. Ao clicar "Faltou", o status era setado como `"agendado"` em vez de ir para "a agendar"
3. Coluna "a agendar" só exibia colaboradores `sem_exame`, ignorando exames com falta
4. Não exibia qual etapa o colaborador faltou

**Solução:**
- `buildDropPayload` agora aceita `"a_agendar"` → seta status `"faltou"`
- `handleConfirmFaltou` seta status `"faltou"` (em vez de `"agendado"`) + limpa `data_agendada`
- Coluna "a agendar" agora exibe **ColaboradorCard** (sem_exame) + **ExameCard** (faltou)
- `ExameCard` ganhou campos `etapa_faltou` e `justificativa_falta`
- Card exibe badge extra "Faltou Nª etapa" quando `etapa_faltou` está preenchido
- Filtros de `primeira_etapa` e `segunda_etapa` excluem status `"faltou"` para não duplicar

**Arquivos alterados:**
- `src/routes/_authenticated/kanban-exames.tsx`

## 2026-07-24 — Correção: Ícone de edição (lápis) quebrava tela de agendamento

**Problema:** Clicar no ícone de lápis para editar um exame na tela de agendamento fazia o React lançar erro "Invalid time value" e quebrava a aplicação.

**Causa raiz:** A API do Prisma serializa datas como ISO string completa (`"2024-07-24T00:00:00.000Z"`). O `handleEditExame` concatenava `+ "T12:00:00"` resultando em `"2024-07-24T00:00:00.000ZT12:00:00"` → **data inválida**. O `format()` do date-fns então lançava exceção.

**Solução:**
- Criada função `parseDateSafe(d)` que extrai apenas a parte da data (`split("T")[0]`) antes de criar o Date, evitando datas inválidas
- Usada também no registro de histórico do agendamento
- Corrigido payload de edição: agora só envia `data_agendada` + `clinica` (não mais `data_1_etapa`/`data_2_etapa`, que sobrescreviam dados incorretamente)
- Adicionado `data_agendada` no handler PUT da API (`$id.ts`), que estava faltando
- Corrigido tipo da mutation `criarExame` para incluir `data_1_etapa` e `data_2_etapa`
- Removidos `console.log` de debug

**Arquivos alterados:**
- `src/routes/_authenticated/agendar-exames.tsx`
- `src/routes/api/exames/$id.ts`

## 2026-07-24 — Paginação na listagem de colaboradores

**Problema:** A tela de colaboradores carregava todos os registros de uma vez e limitava a exibição em 500, sem navegação entre páginas.

**Solução (client-side):**
- Estado `page` + constante `perPage = 50`
- `paginado` = slice calculado com base na página atual
- `useEffect` reseta página para 1 quando filtros/ordenação mudam
- Navegação no footer da tabela com botões Anterior/Próximo + números de página com elipses (`1 … 3 4 5 … 20`)
- "Selecionar todos" opera apenas na página atual
- Indicador "X–Y de Z resultados" no rodapé

**Arquivos alterados:**
- `src/routes/_authenticated/colaboradores/index.tsx`
