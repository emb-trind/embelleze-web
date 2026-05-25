import type { APIRoute } from 'astro';
import { upsertLead } from '../../lib/db';
import { enforceRateLimit } from '../../lib/rate-limit';
import { LeadSchema } from '../../lib/schemas';
import { sendCapiLead } from '../../lib/capi';

export const POST: APIRoute = async ({ request }) => {
  try {
    const rateLimited = enforceRateLimit(request, 'leads', 30, 60_000);
    if (rateLimited) return rateLimited;

    if (Number(request.headers.get('content-length') ?? '0') > 8192) {
return new Response(JSON.stringify({ error: 'Payload too large' }), {
status: 413,
headers: { 'Content-Type': 'application/json' },
});
}

const body = await request.json();
const parsed = LeadSchema.safeParse(body);

if (!parsed.success) {
return new Response(
JSON.stringify({ error: 'Dados inválidos', details: parsed.error.issues }),
{ status: 400, headers: { 'Content-Type': 'application/json' } },
);
}

const leadId = await upsertLead({
...parsed.data,
origin: parsed.data.origin || 'landing',
});

if (!leadId) {
return new Response(JSON.stringify({ error: 'Persistence failed' }), {
status: 503,
headers: { 'Content-Type': 'application/json' }
});
}

const eventId = crypto.randomUUID();

if (parsed.data.status === 'QUALIFICADO') {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? request.headers.get('cf-connecting-ip')
    ?? undefined;
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const origin = request.headers.get('origin') ?? 'https://embelleze-bella.online';

  sendCapiLead({
    eventId,
    eventSourceUrl: `${origin}/`,
    phone: parsed.data.phone,
    ip,
    userAgent,
    customData: {
      content_name: parsed.data.course_interest ?? 'Curso Profissional',
      content_category: 'education',
    },
  });
}

return new Response(JSON.stringify({ success: true, id: leadId, event_id: eventId }), {
status: 201,
headers: { 'Content-Type': 'application/json' }
});

} catch (err) {
console.error('[API-LEADS] Erro:', err);

// Sempre retorna 200 ou 500 controlado para não assustar o frontend
return new Response(JSON.stringify({ error: 'Falha ao processar requisição' }), { 
status: 500,
headers: { 'Content-Type': 'application/json' }
});
}
};
