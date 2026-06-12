import crypto from 'node:crypto';

export interface CAPILeadData {
  phone: string;
  name?: string | null;
  email?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  client_user_agent?: string | null;
  client_ip_address?: string | null;
}

function hashData(data: string | undefined | null): string | undefined {
  if (!data) return undefined;
  const clean = data.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export async function sendPurchaseEvent(lead: CAPILeadData): Promise<boolean> {
  const token = process.env.CAPI_ACCESS_TOKEN?.trim();
  const pixelId = process.env.PUBLIC_META_PIXEL_ID?.trim();

  if (!token || !pixelId) {
    console.warn('[META-CAPI] Token ou Pixel ID ausentes. Abortando envio de Purchase.');
    return false;
  }

  // Apenas envia se houver um telefone (para ter um event_id seguro)
  if (!lead.phone) return false;

  const event_id = `purchase_${lead.phone.replace(/\D/g, '')}`;

  const userData: any = {
    ph: [hashData(lead.phone.replace(/\D/g, ''))].filter(Boolean),
  };

  if (lead.email) {
    const he = hashData(lead.email);
    if (he) userData.em = [he];
  }

  if (lead.name) {
    // Para 'fn', a Meta pede apenas o primeiro nome (opcional, vamos mandar completo)
    const hn = hashData(lead.name);
    if (hn) userData.fn = [hn];
  }

  if (lead.client_ip_address) userData.client_ip_address = lead.client_ip_address;
  if (lead.client_user_agent) userData.client_user_agent = lead.client_user_agent;
  if (lead.fbc) userData.fbc = lead.fbc;
  if (lead.fbp) userData.fbp = lead.fbp;

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id,
        user_data: userData,
        custom_data: {
          currency: 'BRL',
          value: 1500.00, // Valor padrão ilustrativo da compra
        }
      }
    ]
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`[META-CAPI] Evento Purchase enviado com sucesso: ${event_id}`);
      return true;
    } else {
      console.error(`[META-CAPI] Erro ao enviar Purchase:`, result);
      return false;
    }
  } catch (error) {
    console.error(`[META-CAPI] Exceção ao enviar Purchase:`, error);
    return false;
  }
}
