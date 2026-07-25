// POST /api/email-config/test — testa conexão IMAP e busca emails
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";
import { decryptPassword } from "@/lib/email-crypto";
import { searchEmails } from "@/lib/email-service";

export const Route = createFileRoute("/api/email-config/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const body = await request.json();

          if (!body.email || !body.host) {
            return Response.json(
              { ok: false, error: "email e host são obrigatórios" },
              { status: 400 },
            );
          }

          // Resolve a senha: se veio "usar_salva", busca a config no banco
          let password = body.password;
          if (password === "usar_salva") {
            const config = await prisma.emailConfig.findFirst({
              where: { user_id: user.sub },
            });
            if (!config?.email_password_enc) {
              return Response.json(
                { ok: false, error: "Nenhuma senha salva. Digite a senha para buscar." },
                { status: 400 },
              );
            }
            password = decryptPassword(config.email_password_enc);
          }

          if (!password) {
            return Response.json(
              { ok: false, error: "Senha é obrigatória" },
              { status: 400 },
            );
          }

          const result = await searchEmails({
            host: body.host,
            port: body.port ?? 993,
            email: body.email,
            password,
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
