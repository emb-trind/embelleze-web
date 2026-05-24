import type { APIRoute } from 'astro';
import { trackLocationIntent } from '../../lib/redis';
import { INSTITUTE_ADDRESS } from '../../lib/constants';
import { LocationIntentSchema } from '../../lib/schemas';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (Number(request.headers.get('content-length') ?? '0') > 4096) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const parsed = LocationIntentSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const result = await trackLocationIntent({
      ...parsed.data,
      source: 'landing_location_section',
      page: '/',
      destination: 'Instituto Embelleze Trindade',
      destinationAddress: INSTITUTE_ADDRESS,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
