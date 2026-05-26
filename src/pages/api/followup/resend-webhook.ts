import type { APIRoute } from 'astro';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { enforceRateLimit } from '../../../lib/rate-limit';

type FollowupEventLog = {
  ts: string;
  lead_id: string;
  event_type: string;
  result: string;
  provider: 'resend';
  provider_message_id?: string | null;
  notes?: string;
};

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

function getEventsPath(): string {
  return process.env.FOLLOWUP_EVENTS_PATH || path.join(process.cwd(), 'data', 'followup-events.jsonl');
}

async function appendEvent(event: FollowupEventLog): Promise<void> {
  const filePath = getEventsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(event)}\n`, 'utf-8');
}

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

async function findLeadIdByProviderMessageId(providerMessageId: string): Promise<string | null> {
  try {
    const raw = await readFile(getEventsPath(), 'utf-8');
    const lines = raw.split('\n').filter(Boolean);

    for (let i = lines.length - 1; i >= 0; i -= 1) {
      try {
        const event = JSON.parse(lines[i]) as FollowupEventLog;
        if (
          event.provider === 'resend'
          && event.provider_message_id === providerMessageId
          && typeof event.lead_id === 'string'
          && event.lead_id
        ) {
          return event.lead_id;
        }
      } catch {
        // ignore malformed line
      }
    }
    return null;
  } catch {
    return null;
  }
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

    await appendEvent({
      ts: event.created_at || new Date().toISOString(),
      lead_id: leadId,
      event_type: mappedType,
      result: mappedType.replace('email.', ''),
      provider: 'resend',
      provider_message_id: providerMessageId,
      notes: `resend_type=${resendType}`,
    });

    accepted += 1;
  }

  return new Response(JSON.stringify({ accepted, skipped, received: incoming.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
