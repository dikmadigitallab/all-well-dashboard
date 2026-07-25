// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: {
        // Redireciona tslib para o ESM puro (.mjs), evitando o wrapper CJS
        // que causava conflito de __esModule com o __toESM do bundler.
        tslib: resolve(__dirname, "node_modules/tslib/tslib.es6.mjs"),
      },
    },
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
  },
});
