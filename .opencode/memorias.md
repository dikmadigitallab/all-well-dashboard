# Memorias

Registro de decisões e alterações do projeto.

## Sessão

| Data | Decisão | Autor |
|------|---------|-------|
| 2026-07-07 | `hiskra-code` sem argumentos agora auto-inicia `.opencode/` e lança o opencode | VIBECODE |
| 2026-07-07 | Adicionado `--help` / `-h` / `help` para exibir ajuda | VIBECODE |
| 2026-07-07 | `hiskra-code` sem args verifica versão e avisa se precisar de update antes de abrir opencode | VIBECODE |
| 2026-07-09 | v4.0.0 — Modo Legado: comando `conect`, motor NVIDIA com tool calling, streaming, histórico | VIBECODE |
| 2026-07-09 | `conect-config.js`: gerencia `.opencode/conect.json` com provider, modelo, baseUrl | VIBECODE |
| 2026-07-09 | `nvidia-api.js`: cliente NVIDIA NIM com listagem de modelos, chat streaming, tool calling | VIBECODE |
| 2026-07-09 | `engine-tools.js`: 10 ferramentas (bash, read, edit, write, glob, grep, todowrite, websearch, webfetch, task) | VIBECODE |
| 2026-07-09 | `engine-context.js`: histórico com truncagem automática por limite de tokens | VIBECODE |
| 2026-07-09 | `engine-prompt.js`: system prompt dinâmico combinando config.md + orquestrador + skills | VIBECODE |
| 2026-07-09 | `engine-nvidia.js`: motor principal com loop de conversa interativo e tool calling multi-turn | VIBECODE |
| 2026-07-09 | `index.cjs` (initProject): cria `.env` com KEY_NVIDIA padrão + `.gitignore` com `.env` | VIBECODE |
| 2026-07-09 | `nvidia-api.js`: `DEFAULT_NVIDIA_KEY` embutida como chave padrão do pacote | VIBECODE |
| 2026-07-16 | Script `fill-forms.mjs`: lê base.xlsx e gera PDFs A4 replicando o form (pdfkit) | VIBECODE |
| 2026-07-16 | Migrado para .docx + JSZip: manipula XML do Word sem corromper | VIBECODE |
| 2026-07-16 | Interface gráfica: rota `/gerar-formularios` com upload, detecção automática e download ZIP | VIBECODE |
| 2026-07-16 | `src/lib/fill-forms-client.ts`: lógica de preenchimento client-side com JSZip + xlsx | VIBECODE |
| 2026-07-16 | `public/formulario 1.docx` e `public/formulario 2.docx`: templates acessíveis ao navegador | VIBECODE |
| 2026-07-16 | Sidebar: novo item "Gerar formulários" na navegação (admin) | VIBECODE |
| 2026-07-16 | Mapeamento: colunas Excel → campos formulário (NOME, CPF, RG, PIS, GHE, FUNÇÃO, Nascimento) | VIBECODE |
| 2026-07-16 | Manipulação binária .doc (cfb) corrompe arquivos — abandonada, .docx + JSZip é a saída | VIBECODE |
