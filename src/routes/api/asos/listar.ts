// GET /api/asos/listar?colaborador_id=xxx — lista ASOs de um colaborador no Storage
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth.server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "asos";

export const Route = createFileRoute("/api/asos/listar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAuth(request);

          const url = new URL(request.url);
          const colaboradorId = url.searchParams.get("colaborador_id");

          if (!colaboradorId) {
            return Response.json(
              { ok: false, error: "colaborador_id é obrigatório" },
              { status: 400 },
            );
          }

          // Lista arquivos na pasta do colaborador
          const listRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
            {
              method: "POST",
              headers: {
                apikey: SERVICE_KEY,
                Authorization: `Bearer ${SERVICE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prefix: `${colaboradorId}/`,
                limit: 100,
                sortBy: { column: "created_at", order: "desc" },
              }),
            },
          );

          if (!listRes.ok) {
            const errBody = await listRes.text();
            console.error("[aso-list] Storage error:", listRes.status, errBody);
            return Response.json({ ok: false, data: [] });
          }

          const files = await listRes.json() as Array<{ name: string; created_at: string; id: string; metadata: Record<string, unknown> }>;

          const data = files.map((f) => ({
            name: f.name.replace(`${colaboradorId}/`, ""),
            fullPath: f.name,
            url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${f.name}`,
            createdAt: f.created_at,
          }));

          return Response.json({ ok: true, data });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/asos/listar] GET:", err);
          return Response.json({ ok: false, error: "Erro ao listar ASOs" }, { status: 500 });
        }
      },
    },
  },
});