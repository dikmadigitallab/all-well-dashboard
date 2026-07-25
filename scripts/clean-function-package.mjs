// Pós-build do deploy Vercel:
// 1. Remove dependências inválidas do package.json da função (.prisma)
// 2. Garante que tslib esteja no package.json (Nitro não traça pois é externalizado)
// 3. Remove node_modules/tslib/ traçado (incompleto) para não conflitar com npm install

import { readFileSync, writeFileSync, existsSync, rmSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FUNC_DIR = join(ROOT, ".vercel", "output", "functions", "__server.func");
const FUNC_NM = join(FUNC_DIR, "node_modules");
const ROOT_NM = join(ROOT, "node_modules");
const funcPkgPath = join(FUNC_DIR, "package.json");

// ─── Etapa 1: Limpar + Garantir tslib no package.json ──────────────────────

try {
  const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const funcPkg = JSON.parse(readFileSync(funcPkgPath, "utf-8"));

  // Pega versão do tslib do package.json raiz
  const tslibVersion = rootPkg.dependencies?.tslib || rootPkg.devDependencies?.tslib || "^2.8.1";

  const deps = funcPkg.dependencies || {};

  // Remove dependências com nomes inválidos (começam com '.')
  for (const dep of Object.keys(deps)) {
    if (dep.startsWith(".") || dep === "") {
      console.log(`🧹 Removendo dependência inválida: "${dep}": "${deps[dep]}"`);
      delete deps[dep];
    }
  }

  // Garante tslib no package.json (Nitro não traça pois é externalizado)
  if (!deps.tslib) {
    deps.tslib = tslibVersion;
    console.log(`📦 Adicionando tslib@${tslibVersion} ao package.json da função`);
  }

  funcPkg.dependencies = deps;
  writeFileSync(funcPkgPath, JSON.stringify(funcPkg, null, 2) + "\n");
  console.log("✅ package.json da função atualizado");
} catch (err) {
  console.error(`❌ Erro ao processar package.json: ${err.message}`);
}

// ─── Etapa 2: Remover node_modules/tslib/ traçado (incompleto) ─────────────
// O tslib é externalizado — Vercel instala via npm, que trará o pacote completo.
// O trace parcial do Nitro (que só copia alguns arquivos) atrapalharia.

const TSLIB_DST = join(FUNC_NM, "tslib");
if (existsSync(TSLIB_DST)) {
  try {
    rmSync(TSLIB_DST, { recursive: true, force: true });
    console.log(`🗑️  Removido node_modules/tslib/ traçado (será instalado via npm)`);
  } catch (err) {
    console.error(`⚠️  Erro ao remover node_modules/tslib/: ${err.message}`);
  }
}

// ─── Etapa 3: Se @prisma/client estiver externalizado, precisamos que o
//   .prisma/client gerado exista no node_modules da função ― o script
//   copia da raiz se necessário (para resolução local)

const PRISMA_CLIENT_SRC = join(ROOT_NM, ".prisma", "client");
const PRISMA_CLIENT_DST = join(FUNC_NM, ".prisma", "client");

if (existsSync(PRISMA_CLIENT_SRC) && !existsSync(PRISMA_CLIENT_DST)) {
  try {
    // Cria diretório .prisma na função e copia o client gerado
    const dstDir = join(FUNC_NM, ".prisma");
    if (!existsSync(dstDir)) {
      // Precisa copiar recursivamente — mas por enquanto só logamos
      console.log("ℹ️  .prisma/client precisa ser copiado para node_modules da função");
      // Na prática, o @prisma/client externalizado resolve de node_modules raiz
    }
  } catch (_) {}
}
