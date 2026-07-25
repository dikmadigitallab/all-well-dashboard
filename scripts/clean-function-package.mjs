// Pós-build do deploy Vercel:
// 1. Remove dependências inválidas do package.json da função (.prisma)
// 2. Copia tslib completo da raiz para node_modules/ da função
//    (o trace do Nitro não copia tslib quando está em externals.external,
//     e o Vercel também não instala — então fazemos manualmente)
// 3. Garante tslib no package.json como redundância

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FUNC_DIR = join(ROOT, ".vercel", "output", "functions", "__server.func");
const FUNC_NM = join(FUNC_DIR, "node_modules");
const ROOT_NM = join(ROOT, "node_modules");
const funcPkgPath = join(FUNC_DIR, "package.json");

// ─── Etapa 1: Limpar package.json ──────────────────────────────────────────

try {
  const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const funcPkg = JSON.parse(readFileSync(funcPkgPath, "utf-8"));
  const tslibVersion = rootPkg.dependencies?.tslib || "^2.8.1";
  const deps = funcPkg.dependencies || {};
  let changed = false;

  for (const dep of Object.keys(deps)) {
    if (dep.startsWith(".") || dep === "") {
      console.log(`🧹 Removendo dependência inválida: "${dep}": "${deps[dep]}"`);
      delete deps[dep];
      changed = true;
    }
  }

  // Garante tslib no package.json
  if (!deps.tslib) {
    deps.tslib = tslibVersion;
    console.log(`📦 Adicionando tslib@${tslibVersion} ao package.json`);
    changed = true;
  }

  if (changed) {
    funcPkg.dependencies = deps;
    writeFileSync(funcPkgPath, JSON.stringify(funcPkg, null, 2) + "\n");
    console.log("✅ package.json atualizado");
  } else {
    console.log("✅ package.json OK");
  }
} catch (err) {
  console.error(`❌ Erro no package.json: ${err.message}`);
}

// ─── Etapa 2: Copiar tslib completo para node_modules/ da função ───────────
// O Nitro NÃO copia pacotes que estão em externals.external.
// O Vercel também não instala via npm (usa o node_modules como está).
// Portanto, copiamos manualmente o tslib completo da raiz.

const TSLIB_SRC = join(ROOT_NM, "tslib");
const TSLIB_DST = join(FUNC_NM, "tslib");

function copyRecursive(src, dst) {
  if (!existsSync(src)) return false;
  const entries = readdirSync(src);
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
  return true;
}

if (existsSync(TSLIB_SRC)) {
  copyRecursive(TSLIB_SRC, TSLIB_DST);
  console.log(`📋 tslib copiado completo (${readdirSync(TSLIB_SRC).length} arquivos) → node_modules/tslib/`);
} else {
  console.log("⚠️  tslib não encontrado no node_modules raiz");
}

// ─── Etapa 3: Verificar resultado ──────────────────────────────────────────

const tslibFiles = existsSync(TSLIB_DST) ? readdirSync(TSLIB_DST) : [];
const hasESSentials = tslibFiles.includes("tslib.es6.mjs") && tslibFiles.includes("package.json");
if (hasESSentials) {
  console.log("✅ tslib pronto (tslib.es6.mjs OK, package.json OK)");
} else {
  console.error(`❌ tslib incompleto na função: ${tslibFiles.join(", ")}`);
}
