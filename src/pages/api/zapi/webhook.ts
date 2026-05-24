import type { APIRoute } from "astro";
import { generateBellaReply } from "../../../lib/bella";
import { claimProbeltecSync, upsertLead } from "../../../lib/db";
import { createLead } from "../../../lib/probeltec";
import { maskPhone, sendTextMessage } from "../../../lib/zapi";

export const POST: APIRoute = async ({ request }) => {
  try {
    const isProd = process.env.NODE_ENV === "production";

    // 7. Webhook security: validar secret/token da Z-API
    const clientTokenHeader = request.headers.get("Client-Token");
    const clientToken =
      process.env.ZAPI_CLIENT_TOKEN || import.meta.env.ZAPI_CLIENT_TOKEN;

    if (!clientToken || clientTokenHeader !== clientToken) {
      console.warn("[ZAPI Webhook] Tentativa de acesso não autorizada.");
      return new Response(JSON.stringify({ status: "unauthorized" }), {
        status: 401,
      });
    }

    const rawPayload = await request.json();

    // 8. Logs: não logar payload completo em produção
    if (!isProd) {
      console.log(
        "[ZAPI Webhook] Raw Payload:",
        JSON.stringify(rawPayload, null, 2),
      );
    }

    // 3. Normalizar dados
    const phone = rawPayload.phone || rawPayload.chatId?.replace("@c.us", "");
    const message = rawPayload.text?.message || rawPayload.text || "";
    const senderName = rawPayload.senderName || "Cliente";
    const fromMe = rawPayload.fromMe !== undefined ? rawPayload.fromMe : false;

    const maskedPhone = phone ? maskPhone(phone) : "N/A";
    console.log(`[ZAPI Webhook] Mensagem recebida de ${maskedPhone}`);

    // 4. Ignorar mensagens fromMe (enviadas pelo próprio bot)
    if (fromMe) {
      return new Response(
        JSON.stringify({ status: "ignored", reason: "message from me" }),
        { status: 200 },
      );
    }

    // 5. Salvar/atualizar lead no Postgres
    // Regra: falha no DB não quebra resposta WhatsApp
    let leadSaved = false;
    try {
      if (phone) {
        const leadId = await upsertLead({
          phone,
          name: senderName,
          last_message: message,
          status: "NOVO",
          origin: "whatsapp_zapi",
        });
        leadSaved = leadId !== null;
        if (!leadSaved) {
          console.error(`[ZAPI Webhook] upsertLead retornou null — lead ${maskedPhone} não registrado no DB.`);
        }
      }
    } catch (dbError) {
      console.error("[ZAPI Webhook] Erro ao salvar no DB (Silenciado):", dbError);
    }

    // 5b. Sync com Probeltec CRM — só se o lead foi salvo no DB e tem nome real.
    // claimProbeltecSync() é atômico: ganha o slot ou devolve false se já sincronizado.
    const hasRealName = senderName && senderName !== "Cliente";
    if (phone && hasRealName) {
      if (!leadSaved) {
        console.warn(`[Probeltec] Sync ignorado para ${maskedPhone} — lead não salvo no DB.`);
      } else {
        try {
          const claimed = await claimProbeltecSync(phone);
          if (claimed) {
            await createLead({ name: senderName, phone });
            console.log(`[Probeltec] Lead criado no CRM: ${maskedPhone}`);
          }
        } catch (crmError) {
          console.error(
            "[Probeltec] Erro ao sincronizar lead (Silenciado):",
            (crmError as Error).message,
          );
        }
      }
    }

    // 2. Gerar resposta da Bella e enviar — fallback humano se qualquer etapa falhar
    try {
      const replyMessage = await generateBellaReply(rawPayload);

      // 2b. Injetar phone no link FlowPay antes de enviar.
      // O link estático não carrega identidade — sem isso o webhook do FlowPay
      // não sabe qual lead pagou. Injetamos como query param; o FlowPay repassa
      // no metadata do callback: metadata.phone.
      let replyToSend = replyMessage;
      if (phone && replyMessage.includes("flowpay.cash/checkout/")) {
        const cleanPhone = phone.replace(/\D/g, "");
        replyToSend = replyMessage.replace(
          /https:\/\/app\.flowpay\.cash\/checkout\/[a-zA-Z0-9]+/g,
          (url) => `${url}?phone=${encodeURIComponent(cleanPhone)}`,
        );
        try {
          await upsertLead({ phone, status: "PIX_GERADO", last_message: "Link de reserva enviado pela Bella" });
          console.log(`[ZAPI Webhook] Status PIX_GERADO registrado para ${maskedPhone}`);
        } catch (pixStatusError) {
          console.error("[ZAPI Webhook] Erro ao registrar PIX_GERADO (silenciado):", pixStatusError);
        }
      }

      await sendTextMessage(phone, replyToSend);
    } catch (bellaOrSendError) {
      console.error("[ZAPI Webhook] Erro ao gerar/enviar resposta Bella:", bellaOrSendError);

      // Fallback humano — dispara tanto em falha Azure quanto em falha de envio
      const fallbackMessage = `Olá ${senderName}! Tivemos um probleminha técnico em nosso sistema de IA, mas um de nossos consultores humanos já vai te atender.`;
      try {
        await sendTextMessage(phone, fallbackMessage);
      } catch (fallbackError) {
        console.error("[ZAPI Webhook] Erro no fallback humano:", fallbackError);
      }
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    console.error("[ZAPI Webhook] Erro ao processar webhook:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Internal Server Error" }),
      { status: 500 },
    );
  }
};
