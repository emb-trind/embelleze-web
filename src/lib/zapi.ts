/** Normaliza para dígitos puros com código de país 55. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

/** Mascara o número para logs — nunca expõe mais do que os últimos 4 dígitos. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `****${digits.slice(-4)}` : "****";
}

function validatePhone(digits: string): boolean {
  // 55 (país) + 2 (DDD) + 8 ou 9 (número) = 12 ou 13 dígitos
  return digits.length >= 12 && digits.length <= 13;
}

export async function sendTextMessage(rawPhone: string, message: string) {
  const instanceId = process.env.ZAPI_INSTANCE_ID || import.meta.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN || import.meta.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN || import.meta.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token) {
    throw new Error("Z-API credentials missing (ZAPI_INSTANCE_ID or ZAPI_TOKEN)");
  }

  if (!message) {
    throw new Error("Mensagem vazia");
  }

  const phone = normalizePhone(rawPhone);

  if (!validatePhone(phone)) {
    throw new Error(`Telefone inválido: ${maskPhone(phone)}`);
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-messages`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": clientToken || "",
      },
      body: JSON.stringify({ phone, message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na Z-API: ${response.status} - ${errorText}`);
    }

    console.log(`[ZAPI] Mensagem enviada para ${maskPhone(phone)}`);
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Timeout na requisição para Z-API");
    }
    throw error;
  }
}
