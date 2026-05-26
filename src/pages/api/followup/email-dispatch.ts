import type { APIRoute } from 'astro';
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { sendFollowupEmail } from '../../../lib/resend';
import { enforceRateLimit } from '../../../lib/rate-limit';

type QueueItem = {
  lead_id: string;
  email: string;
  name: string | null;
  status_canon: string;
  source_canon: string;
  utm_campaign: string | null;
  owner: string;
  email_state: string;
  priority: number;
  template_key: string;
  context?: {
    phone_e164?: string;
    media_canon?: string;
    utm_source?: string;
  };
};

type EventLog = {
  ts: string;
  lead_id: string;
  event_type: string;
  result: string;
  provider: 'resend';
  provider_message_id?: string | null;
  notes?: string;
};

function getQueuePath(): string {
  return process.env.EMAIL_DISPATCH_QUEUE_PATH
    || path.join(process.cwd(), 'data', 'email-dispatch-queue.json');
}

function getEventsPath(): string {
  return process.env.FOLLOWUP_EVENTS_PATH
    || path.join(process.cwd(), 'data', 'followup-events.jsonl');
}

async function appendEvent(event: EventLog): Promise<void> {
  await appendFile(getEventsPath(), `${JSON.stringify(event)}\n`, 'utf-8');
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    lp_transforme: 'LP Transforme',
    whatsapp_form: 'Form WhatsApp',
    lead_cadastro_manual: 'Cadastro manual',
    site_footer_form: 'Rodapé do site',
    unknown_origem: 'Origem desconhecida',
  };
  return map[source] || source;
}

export const POST: APIRoute = async ({ request }) => {
  const rateLimited = enforceRateLimit(request, 'followup-email-dispatch', 10, 60_000);
  if (rateLimited) return rateLimited;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const expectedToken = process.env.FOLLOWUP_DISPATCH_SECRET;

  if (!expectedToken) {
    return new Response(JSON.stringify({ error: 'misconfigured_dispatch_secret' }), {
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

  const body = await request.json().catch(() => ({} as { limit?: number; dryRun?: boolean }));
  const limit = Math.min(Math.max(Number(body?.limit ?? 25), 1), 100);
  const dryRun = Boolean(body?.dryRun);

  let queue: QueueItem[] = [];
  try {
    const raw = await readFile(getQueuePath(), 'utf-8');
    const parsed = JSON.parse(raw) as QueueItem[];
    queue = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Followup Dispatch] queue_read_error', err);
    return new Response(JSON.stringify({ error: 'queue_read_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const selected = queue.slice(0, limit);
  if (dryRun) {
    return new Response(JSON.stringify({ selected: selected.length, dryRun: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sent: string[] = [];
  const failed: Array<{ lead_id: string; reason: string }> = [];

  for (const item of selected) {
    await appendEvent({
      ts: new Date().toISOString(),
      lead_id: item.lead_id,
      event_type: 'email.queued',
      result: 'queued',
      provider: 'resend',
      notes: `template=${item.template_key}`,
    });

    const result = await sendFollowupEmail({
      to: item.email,
      name: item.name,
      templateKey: item.template_key,
      sourceLabel: sourceLabel(item.source_canon),
    });

    if (result.messageId) {
      sent.push(item.lead_id);
      await appendEvent({
        ts: new Date().toISOString(),
        lead_id: item.lead_id,
        event_type: 'email.sent',
        result: 'sent',
        provider: 'resend',
        provider_message_id: result.messageId,
      });
    } else {
      failed.push({ lead_id: item.lead_id, reason: 'send_failed' });
      await appendEvent({
        ts: new Date().toISOString(),
        lead_id: item.lead_id,
        event_type: 'email.failed',
        result: 'send_failed',
        provider: 'resend',
      });
    }
  }

  return new Response(JSON.stringify({ processed: selected.length, sent: sent.length, failed: failed.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
