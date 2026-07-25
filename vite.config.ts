// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    // Preset para deploy na Vercel (Node.js runtime)
    preset: "vercel",
    // Externaliza @prisma/client para evitar que o bundler quebre as requires
    // dinâmicas para .prisma/client (gerado pelo prisma generate)
    externals: {
      external: [
        "@prisma/client",
        ".prisma/client",
        ".prisma",
        "prisma",
        "@prisma/adapter-pg",
        "pg",
      ],
    },
    // Força bundle do tslib em vez de externalizar/traçar, porque o trace do Nitro
    // copia apenas parte dos arquivos (falta tslib.es6.mjs) e o npm install da
    // Vercel falha com o package.json inválido (contém ".prisma" que não é um
    // nome de pacote npm válido)
    noExternals: ["tslib"],
    traceDeps: ["!tslib"],
  },
});
