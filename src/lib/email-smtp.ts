/**
 * Serviço de envio de emails via SMTP.
 * Server-side apenas.
 */
import nodemailer from "nodemailer";
import { decryptPassword } from "./email-crypto";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Cria um transporter nodemailer a partir da config SMTP.
 */
export function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
    connectionTimeout: 10000,
  });
}

/**
 * Envia um email de confirmação de que a plataforma foi configurada.
 * Retorna { success: true } ou { success: false, error: "..." }.
 */
export async function sendConfirmationEmail(config: {
  email_address: string;
  email_password_enc: string;
  smtp_host: string | null;
  smtp_port: number | null;
  imap_host: string;
}): Promise<SendEmailResult> {
  try {
    const password = decryptPassword(config.email_password_enc);

    const smtpHost = config.smtp_host || config.imap_host.replace("imap", "smtp");
    const smtpPort = config.smtp_port || 587;

    const transporter = createTransporter({
      host: smtpHost,
      port: smtpPort,
      user: config.email_address,
      password,
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"All-Well ASO" <${config.email_address}>`,
      to: config.email_address,
      subject: "✅ Plataforma ASO configurada com sucesso",
      text: `Olá!

Sua conta de email foi configurada com sucesso na plataforma All-Well ASO.

A partir de agora, o sistema poderá buscar emails não lidos na sua caixa de entrada
e executar as rotinas configuradas.

Qualquer dúvida, consulte o administrador do sistema.

Atenciosamente,
Equipe All-Well`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
    .check { color: #059669; font-size: 24px; }
    .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Configuração realizada com sucesso!</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Sua conta de email foi configurada com sucesso na <strong>plataforma All-Well ASO</strong>.</p>
      <p>A partir de agora, o sistema poderá buscar emails não lidos na sua caixa de entrada
      e executar as rotinas configuradas.</p>
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
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar email";
    console.error("[email-smtp] sendConfirmationEmail error:", message);
    return { success: false, error: message };
  }
}

/**
 * Envia um email genérico.
 */
export async function sendEmail(
  smtpConfig: SmtpConfig,
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<SendEmailResult> {
  try {
    const transporter = createTransporter(smtpConfig);

    const info = await transporter.sendMail({
      from: `"All-Well ASO" <${smtpConfig.user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("[email-smtp] sendMail info:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response?.substring(0, 200),
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar email";
    console.error("[email-smtp] sendEmail error:", message);
    return { success: false, error: message };
  }
}
