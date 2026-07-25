// Pós-build do deploy Vercel.
// Garante que tslib seja encontrável em runtime na Vercel via duas estratégias:
// 1. Copia tslib completo da raiz para node_modules/tslib/ da função
// 2. Substitui `from "tslib"` por caminho relativo nos arquivos _libs/*.mjs
// 3. Remove dependências inválidas (.prisma) do package.json

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
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
      console.log(`🧹 Removendo dependência inválida: "${dep}"`);
      delete deps[dep];
      changed = true;
    }
  }

  if (!deps.tslib) {
    deps.tslib = tslibVersion;
    console.log(`📦 tslib@${tslibVersion} no package.json`);
    changed = true;
  }

  if (changed) {
    funcPkg.dependencies = deps;
    writeFileSync(funcPkgPath, JSON.stringify(funcPkg, null, 2) + "\n");
  }
  console.log("✅ package.json OK");
} catch (err) {
  console.error(`❌ package.json: ${err.message}`);
}

// ─── Etapa 2: Copiar tslib completo ─────────────────────────────────────────

const TSLIB_SRC = join(ROOT_NM, "tslib");
const TSLIB_DST = join(FUNC_NM, "tslib");

function copyRecursive(src, dst) {
  if (!existsSync(src)) return false;
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dst, entry);
    statSync(s).isDirectory() ? copyRecursive(s, d) : copyFileSync(s, d);
  }
  return true;
}

if (existsSync(TSLIB_SRC)) {
  copyRecursive(TSLIB_SRC, TSLIB_DST);
  const count = readdirSync(TSLIB_DST).length;
  console.log(`📋 tslib copiado (${count} arquivos) → node_modules/tslib/`);
}

// ─── Etapa 3: Substituir imports "tslib" por caminho relativo ───────────────
// Isso GARANTE que o Node.js encontre o módulo mesmo sem resolução de pacotes

const TSLIB_ENTRY = "tslib.es6.mjs";
let patchedCount = 0;

function patchTslibImports(dirPath) {
  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    if (statSync(fullPath).isDirectory()) {
      if (entry !== "node_modules") patchTslibImports(fullPath);
    } else if (entry.endsWith(".mjs") || entry.endsWith(".js")) {
      const content = readFileSync(fullPath, "utf-8");
      if (!content.includes('from "tslib"') && !content.includes("from 'tslib'")) continue;

      // Calcula caminho relativo do arquivo até node_modules/tslib/tslib.es6.mjs
      const relativePath = relative(dirname(fullPath), join(FUNC_NM, "tslib", TSLIB_ENTRY));
      const normalized = relativePath.replace(/\\/g, "/");

      const newContent = content
        .replace(/from\s+"tslib"/g, `from "${normalized}"`)
        .replace(/from\s+'tslib'/g, `from '${normalized}'`);

      if (newContent !== content) {
        writeFileSync(fullPath, newContent, "utf-8");
        patchedCount++;
        console.log(`🔧 ${join(relative(FUNC_DIR, dirname(fullPath)), entry)} → from "${normalized}"`);
      }
    }
  }
}

patchTslibImports(FUNC_DIR);

if (patchedCount > 0) {
  console.log(`✅ ${patchedCount} arquivo(s) com imports de tslib corrigidos para caminho relativo`);
} else {
  console.log("✅ Nenhum import de tslib para corrigir");
}
