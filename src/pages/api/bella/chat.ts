import type { APIRoute } from 'astro';
import { enforceRateLimit } from '../../../lib/rate-limit';
import systemPrompt from '../../../content/vitoria.web.md?raw';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ALLOWED_ORIGINS = [
  'https://embelleze-bella.online',
  'https://lp.embelleze-bella.online',
  'http://localhost:4321',
  'http://localhost:4323',
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const OPTIONS: APIRoute = ({ request }) => {
  const origin = request.headers.get('origin');
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
};

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin) };

  const rateLimited = enforceRateLimit(request, 'bella-chat', 20, 60_000);
  if (rateLimited) return rateLimited;

  if (Number(request.headers.get('content-length') ?? '0') > 8192) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers });
  }

  let body: { message?: string; history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'message_required' }), { status: 400, headers });
  }

  if (message.length > 1000 || history.length > 10) {
    return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers });
  }

  const endpoint = import.meta.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
  const apiVersion = import.meta.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

  if (!endpoint || !apiKey) {
    return new Response(
      JSON.stringify({
        reply: 'Oie! Sou a Vitória, do Instituto Embelleze Trindade. Como posso te ajudar?',
      }),
      { headers }
    );
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10),
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 350,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error('[BellaChat] Azure HTTP', res.status, await res.text());
      return new Response(JSON.stringify({ error: 'ai_unavailable' }), { status: 502, headers });
    }

    const data = (await res.json()) as any;
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('empty reply from Azure');

    // Strip all emoji characters — tone must come from words, not icons
    const reply = raw.replace(/\p{Emoji_Presentation}/gu, '').replace(/\s{2,}/g, ' ').trim();

    return new Response(JSON.stringify({ reply }), { headers });
  } catch (err) {
    console.error('[BellaChat]', err);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers });
  }
};
