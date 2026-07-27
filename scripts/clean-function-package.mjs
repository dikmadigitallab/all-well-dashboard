// Pós-build do deploy Vercel.
// O Vercel recria node_modules do zero baseado no package.json da função.
// Precisamos:
// 1. Remover dependências inválidas (.prisma) que quebram npm install
// 2. Garantir que tslib esteja no package.json (pois está externalizado)
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FUNC_DIR = join(ROOT, ".vercel", "output", "functions", "__server.func");
const funcPkgPath = join(FUNC_DIR, "package.json");

try {
  const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
  const funcPkg = JSON.parse(readFileSync(funcPkgPath, "utf-8"));
  const tslibVersion = rootPkg.dependencies?.tslib || "^2.8.1";
  const deps = funcPkg.dependencies || {};
  let changed = false;

  // Remove dependências com nome inválido (ex: ".prisma")
  for (const dep of Object.keys(deps)) {
    if (dep.startsWith(".") || dep === "") {
      console.log(`🧹 Removendo dependência inválida: "${dep}"`);
      delete deps[dep];
      changed = true;
    }
  }

  // Garante tslib no package.json para o Vercel instalar
  if (!deps.tslib) {
    deps.tslib = tslibVersion;
    console.log(`📦 Adicionado tslib@${tslibVersion} ao package.json da função`);
    changed = true;
  }

  // Garante @prisma/engines (engine binário necessário em runtime serverless)
  // Usa a mesma versão do @prisma/client para consistência
  const clientVersion = rootPkg.dependencies?.["@prisma/client"] || "^6.19.3";
  if (!deps["@prisma/engines"]) {
    deps["@prisma/engines"] = clientVersion;
    console.log(`📦 Adicionado @prisma/engines@${clientVersion} ao package.json da função`);
    changed = true;
  }

  if (changed) {
    funcPkg.dependencies = deps;
    writeFileSync(funcPkgPath, JSON.stringify(funcPkg, null, 2) + "\n");
  }
  console.log("✅ package.json OK");
} catch (err) {
  console.error(`❌ Erro: ${err.message}`);
}
