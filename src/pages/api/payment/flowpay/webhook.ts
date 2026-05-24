import type { APIRoute } from "astro";
import { upsertLead, appendLeadEvent, getLeadByPhone } from "../../../../lib/db";
import { maskPhone } from "../../../../lib/phone";
import { sendGatewayMessage } from "../../../../lib/whatsapp-gateway";
import {
  sendPaymentConfirmationToLead,
  sendPaymentNotificationToTeam,
} from "../../../../lib/resend";

/**
 * POST /api/payment/flowpay/webhook
 *
 * Recebe callbacks de pagamento do FlowPay e avança o lead para PIX_PAGO.
 * Também dispara mensagem de confirmação via gateway WhatsApp e registra o evento no DB.
 *
 * Segurança: Bearer token estático via FLOWPAY_WEBHOOK_SECRET.
 * A variável é obrigatória; sem ela o endpoint retorna 503.
 *
 * Payload esperado do FlowPay:
 * {
 *   status: "APPROVED" | "PAID" | "PENDING" | "FAILED" | ...,
 *   transaction_id: string,
 *   metadata: { phone: string }   ← injetado pela Bella ao gerar o link FlowPay
 * }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (Number(request.headers.get("content-length") ?? "0") > 16_384) {
      return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413 });
    }

    // ── Segurança: Bearer token ──────────────────────────────────────────────
    const webhookSecret =
      process.env.FLOWPAY_WEBHOOK_SECRET || import.meta.env.FLOWPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const authHeader = request.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "").trim();
      if (token !== webhookSecret) {
        console.warn("[FlowPay Webhook] Acesso não autorizado.");
        return new Response(JSON.stringify({ status: "unauthorized" }), { status: 401 });
      }
    } else {
      console.error("[FlowPay Webhook] FLOWPAY_WEBHOOK_SECRET não configurado.");
      return new Response(JSON.stringify({ status: "misconfigured" }), { status: 503 });
    }

    const payload = await request.json();
    const { status, transaction_id, metadata } = payload as {
      status?: string;
      transaction_id?: string;
      metadata?: { phone?: string };
    };

    // ── Filtro de ruído: ignorar eventos que não são pagamento confirmado ────
    // Retorna 200 para o FlowPay não fazer retry de eventos irrelevantes.
    const isPaid = status === "APPROVED" || status === "PAID";
    if (!isPaid) {
      console.log(`[FlowPay Webhook] Evento ignorado: status="${status}" tx="${transaction_id}"`);
      return new Response(
        JSON.stringify({ received: true, action: "ignored" }),
        { status: 200 },
      );
    }

    // ── Identificação do lead ────────────────────────────────────────────────
    const leadPhone = metadata?.phone;
    if (!leadPhone) {
      console.warn(`[FlowPay Webhook] metadata.phone ausente no payload. tx="${transaction_id}"`);
      // 400 → FlowPay não vai tentar retry (dado estruturalmente inválido)
      return new Response(
        JSON.stringify({ error: "phone not found in metadata" }),
        { status: 400 },
      );
    }

    const maskedPhone = maskPhone(leadPhone);

    // ── Mutação de estado: NOVO/QUALIFICADO/INTERESSADO/PIX_GERADO → PIX_PAGO ─
    await upsertLead({
      phone: leadPhone,
      status: "PIX_PAGO",
      last_message: `Pagamento confirmado via FlowPay — tx: ${transaction_id ?? "N/A"}`,
    });

    // ── Auditoria: evento no lead_events com transaction_id ──────────────────
    await appendLeadEvent(leadPhone, "PIX_PAGO", {
      transaction_id: transaction_id ?? null,
      source: "flowpay_webhook",
    });

    console.log(`[FlowPay Webhook] PIX_PAGO confirmado para ${maskedPhone} — tx: ${transaction_id}`);

    // ── Confirmação automática via WhatsApp ──────────────────────────────────
    // Falha silenciada: o estado do lead já foi atualizado, o handoff ocorre
    // mesmo que a mensagem de confirmação não chegue.
    try {
      const confirmMessage =
        `Pagamento confirmado! 🎉 Sua vaga está pré-reservada.\n\n` +
        `Vou passar seu contato para nossa consultora finalizar sua matrícula. ` +
        `Ela vai te chamar do número (62) 99481-3565. 😊`;
      await sendGatewayMessage(leadPhone, confirmMessage);
    } catch (sendError) {
      console.error("[FlowPay Webhook] Erro ao enviar confirmação WhatsApp (silenciado):", sendError);
    }

    // ── Emails via Resend ────────────────────────────────────────────────────
    // Busca dados do lead para enriquecer os emails. Falhas silenciadas.
    try {
      const lead = await getLeadByPhone(leadPhone);
      const txId = transaction_id ?? "N/A";

      // Email de confirmação para o aluno (só se tiver email cadastrado)
      if (lead?.email) {
        await sendPaymentConfirmationToLead({
          to: lead.email,
          name: lead.name,
          course: lead.course_interest,
          transactionId: txId,
        });
      } else {
        console.log(`[FlowPay Webhook] Lead ${maskedPhone} sem email — confirmação Resend ignorada.`);
      }

      // Notificação interna para a equipe (sempre dispara)
      await sendPaymentNotificationToTeam({
        phone: maskedPhone,
        name: lead?.name ?? null,
        course: lead?.course_interest ?? null,
        transactionId: txId,
      });
    } catch (emailError) {
      console.error("[FlowPay Webhook] Erro nos emails Resend (silenciado):", emailError);
    }

    // ── [FUTURO] Ponto de injeção para Conversions API (Meta/Google offline) ─
    // Quando implementado: disparar server-side conversion event aqui,
    // usando transaction_id como deduplication key.

    return new Response(
      JSON.stringify({ success: true, message: "Lead escalado para fechamento." }),
      { status: 200 },
    );
  } catch (error) {
    console.error("[FlowPay Webhook] Erro crítico:", error);
    // 500 → FlowPay faz retry — correto para falhas transitórias de DB
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 },
    );
  }
};
