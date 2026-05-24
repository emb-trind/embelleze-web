import { Resend } from "resend";

const FROM = "Andreia · Instituto Embelleze <andreia@embelleze-bella.online>";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY não configurada — emails desativados.");
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Email de confirmação de pagamento para o aluno.
 * Silenciado se não houver email cadastrado ou API key ausente.
 */
export async function sendPaymentConfirmationToLead(params: {
  to: string;
  name: string | null;
  course: string | null;
  transactionId: string;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  const firstName = params.name?.split(" ")[0] || "Aluna";
  const course = params.course || "Formação Profissional";

  try {
    await client.emails.send({
      from: FROM,
      to: params.to,
      subject: `Sua vaga está pré-reservada! 🎉 Instituto Embelleze Trindade`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#171018;">
          <div style="background:#5f3080;padding:32px 24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Instituto Embelleze Trindade</h1>
          </div>
          <div style="background:#fff;padding:32px 24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
            <p style="font-size:18px;font-weight:700;margin-top:0;">Olá, ${firstName}! 🎉</p>
            <p>Seu pagamento foi <strong style="color:#de583d;">confirmado</strong> e sua vaga no curso
            <strong>${course}</strong> está pré-reservada.</p>
            <p>Nossa consultora vai entrar em contato pelo WhatsApp no número
            <strong>(62) 99481-3565</strong> para finalizar sua matrícula.</p>
            <div style="background:#f9f4ff;border-left:4px solid #5f3080;padding:12px 16px;border-radius:4px;margin:24px 0;">
              <p style="margin:0;font-size:13px;color:#5f3080;">
                <strong>ID da transação:</strong> ${params.transactionId}
              </p>
            </div>
            <p style="font-size:13px;color:#888;margin-bottom:0;">
              Qualquer dúvida, é só responder este e-mail ou chamar no WhatsApp. 💜
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Resend] Confirmação enviada para ${params.to}`);
  } catch (err) {
    console.error("[Resend] Erro ao enviar confirmação ao aluno (silenciado):", err);
  }
}

/**
 * Notificação interna para a equipe quando um pagamento é confirmado.
 */
export async function sendPaymentNotificationToTeam(params: {
  phone: string;
  name: string | null;
  course: string | null;
  transactionId: string;
}): Promise<void> {
  const client = getClient();
  if (!client) return;

  const notifyEmail =
    process.env.NOTIFY_EMAIL || import.meta.env.NOTIFY_EMAIL;
  if (!notifyEmail) {
    console.warn("[Resend] NOTIFY_EMAIL não configurado — notificação interna ignorada.");
    return;
  }

  const name = params.name || "Não informado";
  const course = params.course || "Não informado";

  try {
    await client.emails.send({
      from: FROM,
      to: notifyEmail,
      subject: `💰 Pagamento confirmado — ${params.phone}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#171018;">
          <div style="background:#de583d;padding:20px 24px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:18px;">Novo pagamento confirmado</h2>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">Telefone</td><td><strong>${params.phone}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#888;">Nome</td><td>${name}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Curso</td><td>${course}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Transação</td><td style="font-size:13px;color:#5f3080;">${params.transactionId}</td></tr>
            </table>
            <p style="font-size:13px;color:#888;margin-top:20px;margin-bottom:0;">
              Entre em contato via WhatsApp para finalizar a matrícula.
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Resend] Notificação interna enviada para ${notifyEmail}`);
  } catch (err) {
    console.error("[Resend] Erro ao enviar notificação interna (silenciado):", err);
  }
}
