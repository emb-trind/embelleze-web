import { createHash } from 'crypto';

const PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = import.meta.env.CAPI_ACCESS_TOKEN;
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export interface CapiPageViewData {
  eventId: string;
  eventSourceUrl: string;
  ip?: string;
  userAgent?: string;
}

export async function sendCapiPageView(data: CapiPageViewData): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const userData: Record<string, unknown> = {};
  if (data.ip) userData['client_ip_address'] = data.ip;
  if (data.userAgent) userData['client_user_agent'] = data.userAgent;

  const payload = {
    data: [{
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      action_source: 'website',
      event_source_url: data.eventSourceUrl,
      user_data: userData,
    }],
    access_token: ACCESS_TOKEN,
  };

  try {
    const res = await fetch(CAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[CAPI] PageView error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[CAPI] PageView fetch failed:', err);
  }
}

export interface CapiLeadData {
  eventId: string;
  eventSourceUrl: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
}

export async function sendCapiLead(data: CapiLeadData): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const userData: Record<string, unknown> = {};
  if (data.phone) userData['ph'] = [sha256(data.phone)];
  if (data.ip) userData['client_ip_address'] = data.ip;
  if (data.userAgent) userData['client_user_agent'] = data.userAgent;

  const payload = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      action_source: 'website',
      event_source_url: data.eventSourceUrl,
      user_data: userData,
      ...(data.customData ? { custom_data: data.customData } : {}),
    }],
    access_token: ACCESS_TOKEN,
  };

  try {
    const res = await fetch(CAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[CAPI] Error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[CAPI] Fetch failed:', err);
  }
}
