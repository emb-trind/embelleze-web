import pg from "pg";
import { sendPurchaseEvent } from "./meta-capi";
const { Pool } = pg;

// Conexão resiliente: se não houver DATABASE_URL, o sistema não quebra
const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false, // Comum em instâncias Railway/AWS/Render
  },
  max: 10, // Limite de conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// CRÍTICO: sem este handler, erros em conexões ociosas matam o processo Node
pool.on('error', (err) => {
  console.error('[DB] Erro em cliente ocioso (silenciado):', err.message);
});

export interface LeadData {
  phone: string;
  name?: string;
  email?: string;
  origin?: string;
  course_interest?: string;
  objective?: string;
  status?: "NOVO" | "QUALIFICADO" | "INTERESSADO" | "CHECKOUT_ENVIADO" | "CHECKOUT_PAGO";
  last_message?: string;
  assigned_to?: string;
  // Atribuição de tráfego pago — first-touch, nunca sobrescreve
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/**
 * Realiza o UPSERT atômico do lead baseado no telefone (ID natural).
 * Single-statement INSERT ... ON CONFLICT elimina race condition de concorrência.
 * Lógica de status: INTERESSADO nunca regride para QUALIFICADO.
 */
export async function upsertLead(data: LeadData) {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn("[DB] DATABASE_URL não configurada. Lead não registrado no Postgres.");
    return null;
  }

  const cleanPhone = data.phone.replace(/\D/g, "");
  if (!cleanPhone) return null;

  let client;
  try {
    client = await pool.connect();
    await ensureUtmColumns(client);

    const res = await client.query(
      `INSERT INTO leads (phone, name, email, origin, course_interest, objective, status, last_message,
                          utm_source, utm_medium, utm_campaign, utm_content, utm_term)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (phone) DO UPDATE SET
         name             = COALESCE(EXCLUDED.name,            leads.name),
         email            = COALESCE(EXCLUDED.email,           leads.email),
         origin           = COALESCE(EXCLUDED.origin,          leads.origin),
         course_interest  = COALESCE(EXCLUDED.course_interest, leads.course_interest),
         objective        = COALESCE(EXCLUDED.objective,       leads.objective),
         status           = CASE
                              -- Máquina de estados: nunca retrocede
                              -- CHECKOUT_PAGO > CHECKOUT_ENVIADO > INTERESSADO > QUALIFICADO > NOVO
                              WHEN leads.status = 'CHECKOUT_PAGO'   THEN 'CHECKOUT_PAGO'
                              WHEN leads.status = 'CHECKOUT_ENVIADO' AND EXCLUDED.status != 'CHECKOUT_PAGO' THEN 'CHECKOUT_ENVIADO'
                              WHEN leads.status = 'INTERESSADO' AND EXCLUDED.status IN ('NOVO','QUALIFICADO') THEN 'INTERESSADO'
                              ELSE COALESCE(EXCLUDED.status, leads.status)
                            END,
         last_message     = COALESCE(EXCLUDED.last_message,    leads.last_message),
         -- UTM: first-touch — canal que trouxe o lead nunca é sobrescrito
         utm_source       = COALESCE(leads.utm_source,   EXCLUDED.utm_source),
         utm_medium       = COALESCE(leads.utm_medium,   EXCLUDED.utm_medium),
         utm_campaign     = COALESCE(leads.utm_campaign, EXCLUDED.utm_campaign),
         utm_content      = COALESCE(leads.utm_content,  EXCLUDED.utm_content),
         utm_term         = COALESCE(leads.utm_term,    EXCLUDED.utm_term),
         updated_at       = NOW()
       RETURNING id`,
      [
        cleanPhone,
        data.name || null,
        data.email || null,
        data.origin || null,
        data.course_interest || null,
        data.objective || null,
        data.status || "NOVO",
        data.last_message || null,
        data.utm_source   || null,
        data.utm_medium   || null,
        data.utm_campaign || null,
        data.utm_content  || null,
        data.utm_term     || null,
      ],
    );

    const leadId = res.rows[0].id as string;

    // Disparo Assíncrono do CAPI
    if (data.status === "CHECKOUT_PAGO") {
      claimAndSendMetaCAPI(cleanPhone, data).catch(err => 
        console.error("[DB] Falha não bloqueante no CAPI async:", err)
      );
    }

    return leadId;
  } catch (err) {
    console.error("[DB] Erro ao salvar lead:", err);
    return null;
  } finally {
    if (client) client.release();
  }
}

// Evita DDL no hot path — executado uma única vez por processo
let schemaReady = false;

async function ensureSchema(client: pg.PoolClient): Promise<void> {
  if (schemaReady) return;

  // Tabela principal de leads — cria se não existir
  await client.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone            TEXT UNIQUE NOT NULL,
      name             TEXT,
      email            TEXT,
      origin           TEXT,
      course_interest  TEXT,
      objective        TEXT,
      status           TEXT NOT NULL DEFAULT 'NOVO',
      last_message     TEXT,
      utm_source       TEXT,
      utm_medium       TEXT,
      utm_campaign     TEXT,
      utm_content      TEXT,
      utm_term         TEXT,
      probeltec_synced_at TIMESTAMPTZ,
      meta_capi_purchase_sent_at TIMESTAMPTZ,
      probeltec_id     TEXT,
      probeltec_status TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Colunas adicionadas em versões posteriores — idempotente
  await client.query(`
    ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS utm_source         TEXT,
      ADD COLUMN IF NOT EXISTS utm_medium         TEXT,
      ADD COLUMN IF NOT EXISTS utm_campaign       TEXT,
      ADD COLUMN IF NOT EXISTS utm_content        TEXT,
      ADD COLUMN IF NOT EXISTS utm_term           TEXT,
      ADD COLUMN IF NOT EXISTS probeltec_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS meta_capi_purchase_sent_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS probeltec_id       TEXT,
      ADD COLUMN IF NOT EXISTS probeltec_status   TEXT,
      ADD COLUMN IF NOT EXISTS email              TEXT
  `);

  schemaReady = true;
}

// Mantido por compatibilidade — delega ao ensureSchema
let utmColumnsReady = false;

async function ensureUtmColumns(client: pg.PoolClient): Promise<void> {
  if (utmColumnsReady) return;
  await ensureSchema(client);
  utmColumnsReady = true;
}

let probeltecColumnReady = false;

async function ensureProbeltecColumn(client: pg.PoolClient): Promise<void> {
  if (probeltecColumnReady) return;
  await ensureSchema(client);
  probeltecColumnReady = true;
}

/**
 * Operação atômica: tenta reservar o slot de sync para o telefone dado.
 * Retorna true se esta chamada ganhou o slot (deve criar no CRM).
 * Retorna false se já estava sincronizado (outra instância ou chamada anterior).
 *
 * UPDATE ... WHERE probeltec_synced_at IS NULL é atômico no Postgres —
 * elimina race condition entre múltiplas instâncias do app.
 */
export async function claimProbeltecSync(phone: string): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return false;

  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return false;

  let client;
  try {
    client = await pool.connect();
    await ensureProbeltecColumn(client);

    const res = await client.query(
      `UPDATE leads
       SET probeltec_synced_at = NOW()
       WHERE phone = $1 AND probeltec_synced_at IS NULL
       RETURNING phone`,
      [cleanPhone],
    );

    // rowCount > 0 → esta chamada ganhou o slot, deve criar no CRM
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[DB] Erro ao reservar sync Probeltec:", err);
    return false;
  } finally {
    if (client) client.release();
  }
}

export async function updateProbeltecId(phone: string, probeltecId: string | number): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return;

  let client;
  try {
    client = await pool.connect();
    await ensureProbeltecColumn(client);
    await client.query(
      `UPDATE leads SET probeltec_id = $1 WHERE phone = $2`,
      [String(probeltecId), phone]
    );
  } catch (err) {
    console.error("[DB] Erro ao salvar probeltec_id:", err);
  } finally {
    if (client) client.release();
  }
}

export async function getLeadsWithProbeltecId(): Promise<{phone: string, probeltec_id: string}[]> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return [];

  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
    const res = await client.query(`SELECT phone, probeltec_id FROM leads WHERE probeltec_id IS NOT NULL`);
    return res.rows;
  } catch (err) {
    console.error("[DB] Erro ao buscar leads com probeltec_id:", err);
    return [];
  } finally {
    if (client) client.release();
  }
}

export async function updateProbeltecStatus(phone: string, status: string): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return;

  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);
    await client.query(
      `UPDATE leads SET probeltec_status = $1, updated_at = NOW() WHERE phone = $2`,
      [status, phone]
    );
  } catch (err) {
    console.error("[DB] Erro ao atualizar probeltec_status:", err);
  } finally {
    if (client) client.release();
  }
}

/**
 * Operação atômica para disparo único do CAPI.
 */
async function claimAndSendMetaCAPI(phone: string, data: LeadData): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return;

  let client;
  try {
    client = await pool.connect();
    await ensureSchema(client);

    const res = await client.query(
      `UPDATE leads
       SET meta_capi_purchase_sent_at = NOW()
       WHERE phone = $1 AND meta_capi_purchase_sent_at IS NULL
       RETURNING phone`,
      [phone]
    );

    if ((res.rowCount ?? 0) > 0) {
      await sendPurchaseEvent({
        phone,
        name: data.name,
        email: data.email
      });
    }
  } catch (err) {
    console.error("[DB] Erro ao claimar/enviar Meta CAPI:", err);
  } finally {
    if (client) client.release();
  }
}

let leadEventsTableReady = false;
let followupEventsTableReady = false;

async function ensureLeadEventsTable(client: pg.PoolClient): Promise<void> {
  if (leadEventsTableReady) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS lead_events (
      id          SERIAL PRIMARY KEY,
      phone       TEXT NOT NULL,
      event_type  TEXT NOT NULL,
      metadata    JSONB,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  leadEventsTableReady = true;
}

async function ensureFollowupEventsTable(client: pg.PoolClient): Promise<void> {
  if (followupEventsTableReady) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS followup_events (
      id                   SERIAL PRIMARY KEY,
      lead_id              TEXT NOT NULL,
      event_type           TEXT NOT NULL,
      result               TEXT NOT NULL,
      provider             TEXT NOT NULL,
      provider_message_id  TEXT,
      notes                TEXT,
      created_at           TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_followup_events_lead_id_created_at
      ON followup_events (lead_id, created_at DESC)
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_followup_events_provider_message_id
      ON followup_events (provider_message_id)
  `);
  followupEventsTableReady = true;
}

/**
 * Retorna os dados básicos de um lead pelo telefone.
 * Usado no webhook de pagamento para enriquecer o email de confirmação.
 */
export async function getLeadByPhone(
  phone: string,
): Promise<{ name: string | null; email: string | null; course_interest: string | null } | null> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return null;

  let client;
  try {
    client = await pool.connect();
    const res = await client.query(
      `SELECT name, email, course_interest FROM leads WHERE phone = $1 LIMIT 1`,
      [cleanPhone],
    );
    return res.rows[0] ?? null;
  } catch (err) {
    console.error("[DB] Erro ao buscar lead:", err);
    return null;
  } finally {
    if (client) client.release();
  }
}

export async function appendLeadEvent(
  phone: string,
  eventType: string,
  metadata: any = {},
): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl) return;

  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return;

  let client;
  try {
    client = await pool.connect();
    await ensureLeadEventsTable(client);
    await client.query(
      `INSERT INTO lead_events (phone, event_type, metadata) VALUES ($1, $2, $3)`,
      [cleanPhone, eventType, JSON.stringify(metadata)],
    );
  } catch (err) {
    console.error(`[DB-EVENT] Erro ao registrar evento ${eventType}:`, err);
  } finally {
    if (client) client.release();
  }
}

export async function appendFollowupEvent(params: {
  lead_id: string;
  event_type: string;
  result: string;
  provider: string;
  provider_message_id?: string | null;
  notes?: string;
  created_at?: string;
}): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl || !params.lead_id || !params.event_type) return;

  let client;
  try {
    client = await pool.connect();
    await ensureFollowupEventsTable(client);
    await client.query(
      `INSERT INTO followup_events
        (lead_id, event_type, result, provider, provider_message_id, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()))`,
      [
        params.lead_id,
        params.event_type,
        params.result,
        params.provider,
        params.provider_message_id ?? null,
        params.notes ?? null,
        params.created_at ?? null,
      ],
    );
  } catch (err) {
    console.error(`[DB-FOLLOWUP] Erro ao registrar evento ${params.event_type}:`, err);
  } finally {
    if (client) client.release();
  }
}

export async function findLeadIdByProviderMessageId(providerMessageId: string): Promise<string | null> {
  const dbUrl = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!dbUrl || !providerMessageId) return null;

  let client;
  try {
    client = await pool.connect();
    await ensureFollowupEventsTable(client);
    const res = await client.query<{ lead_id: string }>(
      `SELECT lead_id
       FROM followup_events
       WHERE provider = 'resend'
         AND provider_message_id = $1
         AND event_type = 'email.sent'
       ORDER BY created_at DESC
       LIMIT 1`,
      [providerMessageId],
    );
    return res.rows[0]?.lead_id ?? null;
  } catch (err) {
    console.error('[DB-FOLLOWUP] Erro ao buscar lead por provider_message_id:', err);
    return null;
  } finally {
    if (client) client.release();
  }
}
