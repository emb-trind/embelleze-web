import type { APIRoute } from 'astro';
import { enforceRateLimit } from '../../../lib/rate-limit';
import { appendFollowupEvent, findLeadIdByProviderMessageId } from '../../../lib/db';

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

function mapResendTypeToFollowup(type: string): string | null {
  const normalized = type.toLowerCase();
  if (normalized === 'email.delivered') return 'email.delivered';
  if (normalized === 'email.opened') return 'email.opened';
  if (normalized === 'email.clicked') return 'email.clicked';
  if (normalized === 'email.bounced') return 'email.failed';
  if (normalized === 'email.complained') return 'email.failed';
  if (normalized === 'email.failed') return 'email.failed';
  return null;
}

function getProviderMessageId(payload: ResendWebhookEvent): string | null {
  const data = payload.data || {};
  const candidates = [
    data['email_id'],
    data['id'],
    data['message_id'],
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  const rateLimited = enforceRateLimit(request, 'followup-resend-webhook', 60, 60_000);
  if (rateLimited) return rateLimited;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const expectedToken = process.env.RESEND_WEBHOOK_SECRET;

  if (!expectedToken) {
    return new Response(JSON.stringify({ error: 'misconfigured_resend_webhook_secret' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (token !== expectedToken) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payloadRaw = await request.json().catch(() => null);
  if (!payloadRaw) {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incoming = Array.isArray(payloadRaw) ? payloadRaw : [payloadRaw];
  let accepted = 0;
  let skipped = 0;

  for (const item of incoming) {
    const event = item as ResendWebhookEvent;
    const resendType = event.type || '';
    const mappedType = mapResendTypeToFollowup(resendType);
    const providerMessageId = getProviderMessageId(event);

    if (!mappedType || !providerMessageId) {
      skipped += 1;
      continue;
    }

    const leadId = await findLeadIdByProviderMessageId(providerMessageId);
    if (!leadId) {
      skipped += 1;
      continue;
    }

    await appendFollowupEvent({
      lead_id: leadId,
      event_type: mappedType,
      result: mappedType.replace('email.', ''),
      provider: 'resend',
      provider_message_id: providerMessageId,
      notes: `resend_type=${resendType}`,
      created_at: event.created_at,
    });

    accepted += 1;
  }

  return new Response(JSON.stringify({ accepted, skipped, received: incoming.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
