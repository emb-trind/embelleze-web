import type { APIRoute } from 'astro';
import systemPrompt from '../../../content/bella.web.md?raw';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

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
