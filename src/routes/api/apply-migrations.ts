// POST /api/apply-migrations — aplica os SQLs no banco via pooler
import { createFileRoute } from "@tanstack/react-router";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve } from "path";

export const Route = createFileRoute("/api/apply-migrations")({
  server: {
    handlers: {
      POST: async () => {
        const { Pool } = await import("pg");

        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          max: 1,
          connectionTimeoutMillis: 15000,
        });

        // Testa conexão
        try {
          const c = await pool.connect();
          const v = await c.query("SELECT version()");
          c.release();
          console.log(`[migrate] Conectado: ${v.rows[0].version.split(",")[0]}`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[migrate] Falha conexão: ${msg}`);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }

        // Lê migrations
        const dir = resolve(".", "supabase/migrations");
        if (!existsSync(dir)) {
          console.error(`[migrate] Diretório não encontrado: ${dir}`);
          return Response.json({ ok: false, error: "Migrations dir not found" }, { status: 500 });
        }

        const files = readdirSync(dir).filter(f => f.endsWith(".sql")).sort();
        const results: { file: string; status: string; error?: string }[] = [];

        for (const file of files) {
          const sql = readFileSync(resolve(dir, file), "utf-8").trim();
          if (!sql) { results.push({ file, status: "empty" }); continue; }

          try {
            await pool.query(sql);
            results.push({ file, status: "ok" });
            console.log(`[migrate] ✅ ${file}`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("already exists")) {
              results.push({ file, status: "exists" });
              console.log(`[migrate] ⚠️  ${file} — já existe`);
            } else {
              results.push({ file, status: "error", error: msg });
              console.error(`[migrate] ❌ ${file}: ${msg}`);
            }
          }
        }

        await pool.end();
        return Response.json({ ok: true, results });
      },
    },
  },
});
