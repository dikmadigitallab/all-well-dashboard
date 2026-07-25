// POST /api/asos/upload — faz upload de ASO para o Storage e atualiza arquivo_url no exame
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth.server";
import { prisma } from "@/lib/prisma.server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "asos";

export const Route = createFileRoute("/api/asos/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);

          const form = await request.formData();
          const file = form.get("file") as File | null;
          const colaboradorId = form.get("colaborador_id") as string | null;
          const exameId = form.get("exame_id") as string | null;

          if (!file || !colaboradorId || !exameId) {
            return Response.json(
              { ok: false, error: "file, colaborador_id e exame_id são obrigatórios" },
              { status: 400 },
            );
          }

          // Valida tipo do arquivo
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (!ext || !["pdf", "png", "jpg", "jpeg"].includes(ext)) {
            return Response.json(
              { ok: false, error: "Formato inválido. Use PDF, PNG ou JPG." },
              { status: 400 },
            );
          }

          // Monta path: asos/{colaborador_id}/aso_{timestamp}.{ext}
          const timestamp = Date.now();
          const fileName = `aso_${timestamp}.${ext === "jpeg" ? "jpg" : ext}`;
          const filePath = `${colaboradorId}/${fileName}`;

          // Upload para Supabase Storage
          const buffer = await file.arrayBuffer();
          const uploadRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`,
            {
              method: "POST",
              headers: {
                apikey: SERVICE_KEY,
                Authorization: `Bearer ${SERVICE_KEY}`,
                "Content-Type": file.type || "application/octet-stream",
                "x-upsert": "true",
              },
              body: buffer,
            },
          );

          if (!uploadRes.ok) {
            const errBody = await uploadRes.text();
            console.error("[aso-upload] Storage error:", uploadRes.status, errBody);
            return Response.json(
              { ok: false, error: `Erro ao salvar arquivo: ${uploadRes.statusText}` },
              { status: 500 },
            );
          }

          // Gera URL pública
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;

          // Atualiza o exame com arquivo_url
          await prisma.exame.update({
            where: { id: exameId },
            data: { arquivo_url: publicUrl },
          });

          return Response.json({
            ok: true,
            data: {
              url: publicUrl,
              path: filePath,
              fileName,
            },
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/asos/upload] POST:", err);
          return Response.json(
            { ok: false, error: "Erro interno ao fazer upload do ASO" },
            { status: 500 },
          );
        }
      },
    },
  },
});