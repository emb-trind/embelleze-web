import type { APIRoute } from 'astro';
import { upsertLead } from '../../lib/db';
import { LeadSchema } from '../../lib/schemas';

export const POST: APIRoute = async ({ request }) => {
  try {
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

    return new Response(JSON.stringify({ success: true, id: leadId }), {
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
