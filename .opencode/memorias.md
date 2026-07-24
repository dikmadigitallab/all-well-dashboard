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
