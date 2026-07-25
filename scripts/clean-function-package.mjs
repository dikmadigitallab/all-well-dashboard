// Pós-build do deploy Vercel:
// 1. Remove dependências inválidas do package.json da função
//    (ex: ".prisma" — não é nome de pacote npm válido, quebra npm install)
// 2. Garante que arquivos essenciais do tslib estejam completos
//    (Nitro traça tslib parcialmente, faltando tslib.es6.mjs)

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, copyFileSync, readdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FUNC_DIR = join(ROOT, ".vercel", "output", "functions", "__server.func");
const FUNC_NM = join(FUNC_DIR, "node_modules");
const ROOT_NM = join(ROOT, "node_modules");

// ─── Etapa 1: Limpar package.json ────────────────────────────────────────────

const funcPkgPath = join(FUNC_DIR, "package.json");

try {
  const pkg = JSON.parse(readFileSync(funcPkgPath, "utf-8"));
  const deps = pkg.dependencies || {};

  for (const dep of Object.keys(deps)) {
    if (dep.startsWith(".") || dep === "") {
      console.log(`🧹 Removendo dependência inválida: "${dep}": "${deps[dep]}"`);
      delete deps[dep];
    }
  }

  pkg.dependencies = deps;
  writeFileSync(funcPkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("✅ package.json da função limpo com sucesso");
} catch (err) {
  console.error(`❌ Erro ao limpar package.json: ${err.message}`);
}

// ─── Etapa 2: Completar tslib (arquivos que o trace do Nitro não copia) ─────

const TSLIB_SRC = join(ROOT_NM, "tslib");
const TSLIB_DST = join(FUNC_NM, "tslib");

const REQUIRED_TSLIB_FILES = [
  "tslib.es6.mjs",    // Entrypoint ESM — ESSENCIAL para import { __assign } from "tslib"
  "tslib.es6.js",     // Module entrypoint
  "tslib.d.ts",       // TypeScript types
];

if (existsSync(TSLIB_SRC) && existsSync(TSLIB_DST)) {
  let copied = 0;
  for (const file of REQUIRED_TSLIB_FILES) {
    const src = join(TSLIB_SRC, file);
    const dst = join(TSLIB_DST, file);
    if (existsSync(src) && !existsSync(dst)) {
      copyFileSync(src, dst);
      console.log(`📋 Copiado ${file} → node_modules/tslib/`);
      copied++;
    }
  }
  if (copied === 0) {
    console.log("✅ tslib já está completo");
  }
} else if (!existsSync(TSLIB_DST)) {
  console.log("ℹ️  tslib não traçado, nada a completar");
} else {
  console.log("⚠️  tslib não encontrado no node_modules raiz");
}

// ─── Etapa 3: Verificar integridade do .prisma no node_modules da função ────
// Remove o diretório .prisma da função se existir, já que não pode ser
// instalado como pacote npm (nome inválido). O @prisma/client externo
// resolve o .prisma via caminho relativo no próprio node_modules raiz.

const PRISMA_CLIENT_DIR = join(FUNC_NM, ".prisma");
if (existsSync(PRISMA_CLIENT_DIR)) {
  // Só remove se não estiver no package.json (já limpamos na etapa 1)
  // Não removemos pra não quebrar a resolução local do @prisma/client
  console.log("ℹ️  .prisma ainda existe em node_modules da função (pode ser necessário)");
}
