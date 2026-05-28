import type { APIRoute } from 'astro';
import { upsertLead } from '../../../lib/db';

// Mapeamento de status da planilha → status interno do Postgres
const STATUS_MAP: Record<string, string> = {
  'novo':         'NOVO',
  'contato':      'QUALIFICADO',
  'qualificado':  'QUALIFICADO',
  'interessado':  'INTERESSADO',
  'matrícula':    'PIX_PAGO',
  'matricula':    'PIX_PAGO',
  'pix pago':     'PIX_PAGO',
  'pix gerado':   'PIX_GERADO',
  'perdido':      'NOVO',
  'pausado':      'NOVO',
};

// Colunas da planilha (índice 0-based, conforme header da TABELA CAMPANHA):
// 0:Column1  1:Nome  2:Email  3:Telefone  4:Origem  5:Mídia
// 6:UTM Source  7:UTM Campaign  8:Status  9:UTM Term  10:UTM Medium
// 11:Entrou em  12:Cursos  13:Consultor  14...:outros
const COL = {
  nome:         1,
  email:        2,
  telefone:     3,
  origem:       4,
  midia:        5,
  utm_source:   6,
  utm_campaign: 7,
  status:       8,
  utm_term:     9,
  utm_medium:   10,
  cursos:       12,
  consultor:    13,
};

interface SheetRow {
  values: string[];
}

export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.SHEETS_WEBHOOK_SECRET;
  const header = request.headers.get('x-sheets-secret');

  if (secret && header !== secret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  let rows: SheetRow[];
  try {
    rows = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
  }

  if (!Array.isArray(rows)) {
    return new Response(JSON.stringify({ error: 'esperado array de rows' }), { status: 400 });
  }

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const v = row.values ?? [];
    const phone = String(v[COL.telefone] ?? '').replace(/\D/g, '');

    if (!phone || phone.length < 8) {
      skipped++;
      continue;
    }

    const rawStatus = String(v[COL.status] ?? '').toLowerCase().trim();
    const mappedStatus = STATUS_MAP[rawStatus];

    try {
      await upsertLead({
        phone,
        name:         v[COL.nome]         || undefined,
        email:        v[COL.email]         || undefined,
        origin:       v[COL.origem]        || undefined,
        course_interest: v[COL.cursos]    || undefined,
        assigned_to:  v[COL.consultor]     || undefined,
        utm_source:   v[COL.utm_source]    || undefined,
        utm_medium:   v[COL.utm_medium] || v[COL.midia] || undefined,
        utm_campaign: v[COL.utm_campaign]  || undefined,
        utm_term:     v[COL.utm_term]      || undefined,
        ...(mappedStatus ? { status: mappedStatus as any } : {}),
      });
      processed++;
    } catch (err: any) {
      errors.push(`${phone}: ${err.message}`);
    }
  }

  console.log(`[SHEETS-WEBHOOK] processed=${processed} skipped=${skipped} errors=${errors.length}`);

  return new Response(JSON.stringify({ processed, skipped, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
