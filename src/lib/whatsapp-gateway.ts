import { isValidBrazilPhone, maskPhone, normalizePhone } from "./phone";

export async function sendGatewayMessage(rawPhone: string, message: string) {
  const gatewayUrl =
    process.env.WHATSAPP_GATEWAY_URL || import.meta.env.WHATSAPP_GATEWAY_URL;
  const gatewaySecret =
    process.env.WHATSAPP_GATEWAY_SECRET || import.meta.env.WHATSAPP_GATEWAY_SECRET;

  if (!gatewayUrl || !gatewaySecret) {
    throw new Error("WhatsApp gateway credentials missing");
  }

  if (!message) {
    throw new Error("Mensagem vazia");
  }

  if (!isValidBrazilPhone(rawPhone)) {
    throw new Error(`Telefone inválido: ${maskPhone(rawPhone)}`);
  }

  const phone = normalizePhone(rawPhone);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${gatewayUrl.replace(/\/$/, "")}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gatewaySecret}`,
      },
      body: JSON.stringify({ to: `+${phone}`, message }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gateway HTTP ${response.status}`);
    }

    console.log(`[WhatsApp Gateway] Mensagem enviada para ${maskPhone(phone)}`);
    return await response.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Timeout na requisição para WhatsApp gateway");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
