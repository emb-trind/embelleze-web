import type { APIRoute } from "astro";
import { generateBellaReply } from "../../../lib/bella";
import { upsertLead, claimProbeltecSync } from "../../../lib/db";
import { createLead } from "../../../lib/probeltec";
import { maskPhone } from "../../../lib/zapi";

// Payload enviado pelo neo-whatsapp-connect (Baileys) via POST WEBHOOK_URL
interface InboundPayload {
  event: string;           // "message.inbound"
  gatewaySessionId: string;
  phone: string;           // E.164 com +: "+5562999999999"
  name: string;
  message: string;
  messageId: string;
  messageType: string;
  isGroup: boolean;
  jid: string;
  receivedAt: string;
  timestamp: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // 1. Validar auth — Bearer WHATSAPP_WEBHOOK_SECRET
    const authHeader = request.headers.get("Authorization");
    const expectedSecret =
      process.env.WHATSAPP_WEBHOOK_SECRET || import.meta.env.WHATSAPP_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      console.warn("[WhatsApp Webhook] Tentativa de acesso não autorizada.");
      return new Response(JSON.stringify({ status: "unauthorized" }), { status: 401 });
    }

    const payload = (await request.json()) as InboundPayload;

    if (!isProd) {
      console.log("[WhatsApp Webhook] Payload:", JSON.stringify(payload));
    }

    // 2. Ignorar grupos e eventos que não sejam mensagens inbound
    if (payload.isGroup) {
      return new Response(JSON.stringify({ status: "ignored", reason: "group message" }), { status: 200 });
    }
    if (payload.event !== "message.inbound") {
      return new Response(JSON.stringify({ status: "ignored", reason: "not inbound" }), { status: 200 });
    }

    // 3. Normalizar phone
    // Gateway envia E.164 com +: "+5562999999999"
    // upsertLead / generateBellaReply esperam dígitos puros: "5562999999999"
    const phone = payload.phone.replace(/^\+/, "");
    const senderName = payload.name || "Cliente";
    const message = payload.message;
    const maskedPhone = maskPhone(phone);

    console.log(`[WhatsApp Webhook] Mensagem recebida de ${maskedPhone}`);

    // 4. Salvar / atualizar lead no Postgres
    // Regra: falha no DB não quebra a resposta via WhatsApp
    let leadId: string | number | null = null;
    try {
      if (phone) {
        leadId = await upsertLead({
          phone,
          name: senderName,
          last_message: message,
          status: "NOVO",
          origin: "whatsapp_baileys",
        });
        if (!leadId) {
          console.error(`[WhatsApp Webhook] upsertLead retornou null — lead ${maskedPhone} não registrado no DB.`);
        }
      }
    } catch (dbError) {
      console.error("[WhatsApp Webhook] Erro ao salvar no DB (silenciado):", dbError);
    }

    // 4b. Sync com Probeltec CRM — só uma vez por número, só se tiver nome real
    const hasRealName = senderName && senderName !== "Cliente";
    if (phone && hasRealName && leadId) {
      try {
        const claimed = await claimProbeltecSync(phone);
        if (claimed) {
          await createLead({ name: senderName, phone });
          console.log(`[Probeltec] Lead criado no CRM: ${maskedPhone}`);
        }
      } catch (crmError) {
        console.error("[Probeltec] Erro ao sincronizar lead (silenciado):", (crmError as Error).message);
      }
    }

    // 5. Gerar resposta da Bella
    // generateBellaReply espera formato Z-API: { phone, text: { message }, senderName }
    const bellaPayload = { phone, text: { message }, senderName };
    let reply: string;

    try {
      reply = await generateBellaReply(bellaPayload);
      console.log(`[WhatsApp Webhook] Bella respondeu para ${maskedPhone}`);
    } catch (bellaError) {
      console.error("[WhatsApp Webhook] Erro ao gerar resposta Bella:", bellaError);
      reply = `Olá ${senderName}! Tivemos um probleminha técnico em nosso sistema. Um consultor já vai te atender em breve.`;
    }

    // 5b. Registrar status PIX_GERADO quando Bella enviar link de checkout
    // Confirmação de pagamento é feita via Google Apps Script que ouve o Gmail
    // do vendedor e chama /api/payment/flowpay/webhook ao receber email da FlowPay.
    if (phone && reply.includes("flowpay.cash/checkout/")) {
      try {
        await upsertLead({ phone, status: "PIX_GERADO", last_message: "Link de reserva enviado pela Bella" });
        console.log(`[WhatsApp Webhook] Status PIX_GERADO registrado para ${maskedPhone}`);
      } catch (pixError) {
        console.error("[WhatsApp Webhook] Erro ao registrar PIX_GERADO (silenciado):", pixError);
      }
    }

    // 6. Enviar resposta via gateway (neo-whatsapp-connect /send)
    const gatewayUrl =
      process.env.WHATSAPP_GATEWAY_URL || import.meta.env.WHATSAPP_GATEWAY_URL;
    const gatewaySecret =
      process.env.WHATSAPP_GATEWAY_SECRET || import.meta.env.WHATSAPP_GATEWAY_SECRET;

    if (!gatewayUrl || !gatewaySecret) {
      console.error("[WhatsApp Webhook] WHATSAPP_GATEWAY_URL ou WHATSAPP_GATEWAY_SECRET não configurados — resposta não enviada.");
      return new Response(JSON.stringify({ status: "ok", sent: false, reason: "gateway not configured" }), { status: 200 });
    }

    try {
      const sendRes = await fetch(`${gatewayUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gatewaySecret}`,
        },
        // Enviar de volta no formato E.164 que o gateway espera
        body: JSON.stringify({ to: payload.phone, message: reply }),
      });
      console.log(`[WhatsApp Webhook] /send → HTTP ${sendRes.status} para ${maskedPhone}`);
    } catch (sendError) {
      console.error("[WhatsApp Webhook] Erro ao chamar /send no gateway:", sendError);
    }

    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });

  } catch (error) {
    console.error("[WhatsApp Webhook] Erro não tratado:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Internal Server Error" }),
      { status: 500 },
    );
  }
};
