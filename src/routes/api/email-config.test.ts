// POST /api/email-config/test — testa conexão IMAP e busca emails
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth.server";
import { searchEmails } from "@/lib/email-service";

export const Route = createFileRoute("/api/email-config/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAuth(request);
          const body = await request.json();

          if (!body.email || !body.password || !body.host) {
            return Response.json(
              { ok: false, error: "email, password e host são obrigatórios" },
              { status: 400 },
            );
          }

          const result = await searchEmails({
            host: body.host,
            port: body.port ?? 993,
            email: body.email,
            password: body.password,
            folder: body.folder ?? "INBOX",
            searchTerm: body.search_term || null,
            senderFilter: body.sender_filter || null,
          });

          return Response.json({
            ok: result.success,
            emails_count: result.emails.length,
            emails: result.emails.slice(0, 5),
            error: result.error || null,
            debug: result.debug || null,
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/email-config/test] POST:", err);
          return Response.json(
            { ok: false, error: "Erro ao testar conexão" },
            { status: 500 },
          );
        }
      },
    },
  },
});
