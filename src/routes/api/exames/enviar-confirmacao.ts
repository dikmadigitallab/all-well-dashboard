// POST /api/exames/enviar-confirmacao — envia email de confirmação de agendamento
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/prisma.server";
import { requireAuth } from "@/lib/auth.server";
import { decryptPassword } from "@/lib/email-crypto";
import { sendEmail } from "@/lib/email-smtp";

export const Route = createFileRoute("/api/exames/enviar-confirmacao")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const body = await request.json();

          if (!body.exame_id || !body.email) {
            return Response.json(
              { ok: false, error: "exame_id e email são obrigatórios" },
              { status: 400 },
            );
          }

          // Busca o exame com o colaborador
          const exame = await prisma.exame.findUnique({
            where: { id: body.exame_id },
            include: {
              colaborador: { select: { nome: true, empresa: true } },
            },
          });

          if (!exame) {
            return Response.json(
              { ok: false, error: "Exame não encontrado" },
              { status: 404 },
            );
          }

          // Busca config de email do usuário para envio
          const emailConfig = await prisma.emailConfig.findFirst({
            where: { user_id: user.sub },
          });

          if (!emailConfig?.email_password_enc) {
            return Response.json(
              { ok: false, error: "Configure o email nas Configurações de Email primeiro" },
              { status: 400 },
            );
          }

          console.log("[enviar-confirmacao] emailConfig:", {
            email_address: emailConfig.email_address,
            smtp_host: emailConfig.smtp_host,
            imap_host: emailConfig.imap_host,
            smtp_port: emailConfig.smtp_port,
            has_password: !!emailConfig.email_password_enc,
          });

          const password = decryptPassword(emailConfig.email_password_enc);

          const smtpHost =
            emailConfig.smtp_host ||
            emailConfig.imap_host.replace("imap", "smtp");

          console.log("[enviar-confirmacao] SMTP config para envio:", {
            host: smtpHost,
            port: emailConfig.smtp_port ?? 587,
            user: emailConfig.email_address,
            pass_len: password?.length ?? 0,
          });

          // Testa conexão SMTP antes de enviar
          const { createTransporter } = await import("@/lib/email-smtp");
          const testTransporter = createTransporter({
            host: smtpHost,
            port: emailConfig.smtp_port ?? 587,
            user: emailConfig.email_address,
            password,
          });
          try {
            await testTransporter.verify();
            console.log("[enviar-confirmacao] SMTP verify OK");
          } catch (verifyErr) {
            const msg = verifyErr instanceof Error ? verifyErr.message : "Erro na verificação SMTP";
            console.error("[enviar-confirmacao] SMTP verify FAILED:", msg);
            return Response.json(
              { ok: false, sent: false, error: `Falha na conexão SMTP: ${msg}` },
              { status: 502 },
            );
          }

          const dataFormatada = exame.data_agendada
            ? new Date(exame.data_agendada).toLocaleDateString("pt-BR")
            : "a definir";

          const result = await sendEmail(
            {
              host: smtpHost,
              port: emailConfig.smtp_port ?? 587,
              user: emailConfig.email_address,
              password,
            },
            body.email,
            `Confirmação de Exame ASO - ${exame.colaborador.nome}`,
            `Olá!

Exame ASO agendado com sucesso!

Colaborador: ${exame.colaborador.nome}
Empresa: ${exame.colaborador.empresa ?? "—"}
Data agendada: ${dataFormatada}
Tipo: ${exame.tipo}

Atenciosamente,
Equipe All-Well`,
            `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
    .info { background: #f8fafc; border-radius: 6px; padding: 16px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .label { color: #64748b; font-size: 13px; }
    .value { font-weight: 600; font-size: 13px; }
    .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Exame ASO Agendado</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Um exame ASO foi agendado com sucesso. Confira os detalhes:</p>
      <div class="info">
        <div class="info-row">
          <span class="label">Colaborador</span>
          <span class="value">${exame.colaborador.nome}</span>
        </div>
        <div class="info-row">
          <span class="label">Empresa</span>
          <span class="value">${exame.colaborador.empresa ?? "—"}</span>
        </div>
        <div class="info-row">
          <span class="label">Data</span>
          <span class="value">${dataFormatada}</span>
        </div>
        <div class="info-row">
          <span class="label">Tipo</span>
          <span class="value">${exame.tipo}</span>
        </div>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 14px; color: #64748b;">
        Qualquer dúvida, consulte o administrador do sistema.
      </p>
    </div>
    <div class="footer">
      Equipe All-Well &bull; Gestão de Saúde Ocupacional
    </div>
  </div>
</body>
</html>`,
          );

          return Response.json({
            ok: result.success,
            sent: result.success,
            error: result.error || null,
          });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("[api/exames/enviar-confirmacao] POST:", err);
          return Response.json(
            { ok: false, error: "Erro ao enviar confirmação" },
            { status: 500 },
          );
        }
      },
    },
  },
});
