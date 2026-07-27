// Pós `prisma generate` — Patcha o .prisma/client/package.json
// para FORÇAR o uso de index.js (base64 WASM) em TODOS os ambientes,
// evitando o edge.js que usa import() dinâmico de .wasm e quebra no Lovable/Vercel.
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CLIENT_PKG = join(ROOT, "node_modules", ".prisma", "client", "package.json");

try {
  const pkg = JSON.parse(readFileSync(CLIENT_PKG, "utf-8"));
  let changed = false;

  // ── 1. Patch exports → forçar index.js para edge-like conditions ──
  const patchExportEntry = (entry) => {
    if (!entry || typeof entry !== "object") return entry;
    for (const condition of ["require", "import"]) {
      const cond = entry[condition];
      if (cond && typeof cond === "object") {
        for (const key of ["edge-light", "workerd", "worker"]) {
          if (cond[key] && cond[key] !== "./index.js") {
            console.log(`  🔧 exports.${condition}.${key}: ${cond[key]} → ./index.js`);
            cond[key] = "./index.js";
            changed = true;
          }
        }
      }
    }
    return entry;
  };

  if (pkg.exports) {
    for (const [key, val] of Object.entries(pkg.exports)) {
      if (key === "." || key === "./client") {
        console.log(`📝 Patcheando exports["${key}"]...`);
        pkg.exports[key] = patchExportEntry(val);
      }
    }
  }

  // ── 2. Patch imports (#main-entry-point) ──
  if (pkg.imports?.["#main-entry-point"]) {
    console.log(`📝 Patcheando imports["#main-entry-point"]...`);
    const entry = pkg.imports["#main-entry-point"];
    for (const mode of ["require", "import"]) {
      const cond = entry[mode];
      if (cond && typeof cond === "object") {
        for (const key of ["edge-light", "workerd", "worker"]) {
          if (cond[key] && cond[key] !== "./index.js") {
            console.log(`  🔧 #main-entry-point.${mode}.${key}: ${cond[key]} → ./index.js`);
            cond[key] = "./index.js";
            changed = true;
          }
        }
      }
    }
  }

  // ── 3. Patch imports (#wasm-compiler-loader) — evitar loader que usa import() de .wasm ──
  // Cria um loader inline que usa a base64 (como em index.js) em vez de import() do .wasm
  if (pkg.imports?.["#wasm-compiler-loader"]) {
    console.log(`📝 Patcheando imports["#wasm-compiler-loader"]...`);
    // Vamos criar um arquivo loader que usa base64 em vez de import() do .wasm
    const safeLoaderPath = "./wasm-safe-loader.mjs";
    const safeLoaderFull = join(dirname(CLIENT_PKG), safeLoaderPath);

    const loaderContent = `// Patched by patch-prisma-client.mjs — usa base64 em vez de import() de .wasm
const { Buffer } = require('node:buffer');
const { wasm } = require('./query_compiler_fast_bg.wasm-base64.js');
const queryCompilerWasmFileBytes = Buffer.from(wasm, 'base64');
const mod = new WebAssembly.Module(queryCompilerWasmFileBytes);
export default mod;
`;
    writeFileSync(safeLoaderFull, loaderContent, "utf-8");
    console.log(`  ✅ Criado ${safeLoaderPath} (loader base64 seguro)`);

    const wasmLoader = pkg.imports["#wasm-compiler-loader"];
    for (const key of Object.keys(wasmLoader)) {
      if (wasmLoader[key] !== safeLoaderPath) {
        console.log(`  🔧 #wasm-compiler-loader.${key}: ${wasmLoader[key]} → ${safeLoaderPath}`);
        wasmLoader[key] = safeLoaderPath;
        changed = true;
      }
    }
  }

  if (changed) {
    writeFileSync(CLIENT_PKG, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    console.log("✅ .prisma/client/package.json patched com sucesso!");
  } else {
    console.log("ℹ️ Nenhuma alteração necessária no package.json.");
  }
} catch (err) {
  console.error(`❌ Erro ao patchear Prisma client: ${err.message}`);
  process.exit(1);
}
