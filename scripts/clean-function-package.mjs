// Limpa dependências inválidas do package.json gerado pela função Nitro/Vercel
// O Nitro traça node_modules/.prisma como ".prisma" (versão 0.0.0), que não é
// um nome de pacote npm válido. Isso quebra o npm install do Vercel.

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const funcPkgPath = join(
  __dirname,
  "..",
  ".vercel",
  "output",
  "functions",
  "__server.func",
  "package.json"
);

try {
  const pkg = JSON.parse(readFileSync(funcPkgPath, "utf-8"));
  const deps = pkg.dependencies || {};

  // Remove dependências com nomes inválidos (começam com '.' ou são vazias)
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
