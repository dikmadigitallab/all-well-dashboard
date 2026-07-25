# Checkpoints

## Sessão 2024-07-24
- Estado: Build OK
- `kanban-exames.tsx`: getCardDate contextual, STATUS_LABEL, handleConfirmFaltou redireciona para agendado
- `agendar-exames.tsx`: cards por colaborador com todos os exames, reagendamento, badge de faltou, invalidação cruzada Kanban
- Próximos passos: N/A

## Sessão 2026-07-24 (Kanban)
- Estado: Build OK
- `kanban-exames.tsx`:
  - `ExameCard` agora inclui `etapa_faltou` e `justificativa_falta`
  - `buildDropPayload` aceita `"a_agendar"` → seta status `"faltou"`
  - `handleConfirmFaltou` seta status `"faltou"` + limpa `data_agendada`
  - Coluna "a agendar" exibe ColaboradorCard (sem_exame) + ExameCard (faltou)
  - Card exibe badge "Faltou Nª etapa" quando `etapa_faltou` está presente
  - Filtros `primeira_etapa` e `segunda_etapa` excluem status `"faltou"`

## Sessão 2026-07-24 (Agendamento)
- Estado: Build OK
- `agendar-exames.tsx`:
  - Criada `parseDateSafe(d)` para evitar datas inválidas ao editar
  - Payload de edição agora só envia `data_agendada` + `clinica`
  - Mutation `criarExame` com tipo corrigido (inclui `data_1_etapa`, `data_2_etapa`)
  - Removidos `console.log` de debug
- `src/routes/api/exames/$id.ts`:
  - Adicionado `data_agendada` no handler PUT

## Sessão 2026-07-24 (Colaboradores Paginação)
- Estado: Build OK
- `colaboradores/index.tsx`: paginação client-side, `perPage=50`, navegação com números + elipses, selecionar todos por página, reseta página ao filtrar
- Próximos passos: N/A
