// GET /api/email-config — busca config do usuário logado
// PUT /api/email-config — cria ou atualiza config do usuário logado
// POST /api/email-config/test — testa conexão IMAP com os dados fornecidos
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";
import { encryptPassword } from "@/lib/email-crypto";
import { sendConfirmationEmail } from "@/lib/email-smtp";

export const Route = createFileRoute("/api/email-config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuth(request);

          const config = await prisma.emailConfig.findFirst({
            where: { user_id: user.sub },
          });

          if (!config) {
            return Response.json({ ok: true, data: null });
          }

          return Response.json({
            ok: true,
            data: {
              id: config.id,
              email_address: config.email_address,
              imap_host: config.imap_host,
              imap_port: config.imap_port,
              smtp_host: config.smtp_host,
              smtp_port: config.smtp_port,
              search_term: config.search_term,
              sender_filter: config.sender_filter,
              folder: config.folder,
              ativo: config.ativo,
              created_at: config.created_at,
              updated_at: config.updated_at,
              has_password: !!config.email_password_enc,
            },
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/email-config] GET:", err);
          return Response.json(
            { ok: false, error: "Erro ao buscar configuração" },
            { status: 500 },
          );
        }
      },

      PUT: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const body = await request.json();

          if (!body.email_address || !body.imap_host) {
            return Response.json(
              { ok: false, error: "email_address e imap_host são obrigatórios" },
              { status: 400 },
            );
          }

          // Prepara dados
          const data: Record<string, unknown> = {
            email_address: body.email_address,
            imap_host: body.imap_host,
            imap_port: body.imap_port ?? 993,
            smtp_host: body.smtp_host || null,
            smtp_port: body.smtp_port ?? 587,
            search_term: body.search_term ?? null,
            sender_filter: body.sender_filter ?? null,
            folder: body.folder ?? "INBOX",
            ativo: body.ativo !== undefined ? body.ativo : true,
          };

          // Criptografa a senha se fornecida
          let passwordProvided = false;
          if (body.email_password) {
            data.email_password_enc = encryptPassword(body.email_password);
            passwordProvided = true;
          }

          // Busca config existente do usuário
          const existing = await prisma.emailConfig.findFirst({
            where: { user_id: user.sub },
          });

          let config;
          if (existing) {
            config = await prisma.emailConfig.update({
              where: { id: existing.id },
              data: data as any,
            });
          } else {
            config = await prisma.emailConfig.create({
              data: { user_id: user.sub, ...data } as any,
            });
            passwordProvided = true; // nova config, sempre envia email
          }

          // Tenta enviar email de confirmação se senha foi fornecida
          let confirmationSent = false;
          let confirmationError: string | null = null;

          if (passwordProvided && config.email_password_enc) {
            const result = await sendConfirmationEmail({
              email_address: config.email_address,
              email_password_enc: config.email_password_enc,
              smtp_host: config.smtp_host,
              smtp_port: config.smtp_port,
              imap_host: config.imap_host,
            });

            confirmationSent = result.success;
            if (!result.success) {
              confirmationError = result.error || null;
            }
          }

          return Response.json({
            ok: true,
            data: {
              id: config.id,
              email_address: config.email_address,
              imap_host: config.imap_host,
              imap_port: config.imap_port,
              smtp_host: config.smtp_host,
              smtp_port: config.smtp_port,
              search_term: config.search_term,
              sender_filter: config.sender_filter,
              folder: config.folder,
              ativo: config.ativo,
              has_password: !!config.email_password_enc,
            },
            confirmation: {
              sent: confirmationSent,
              error: confirmationError,
            },
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/email-config] PUT:", err);
          return Response.json(
            { ok: false, error: "Erro ao salvar configuração" },
            { status: 500 },
          );
        }
      },
    },
  },
});
