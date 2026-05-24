import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || '';

// Singleton para o cliente Redis
let redis: Redis | null = null;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      // Sem retentativas infinitas — falha rápido se Redis não está disponível
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      lazyConnect: false,
    });

    // CRÍTICO: sem este handler, erro de conexão mata o processo Node inteiro
    redis.on('error', (err) => {
      console.error('[Redis] Erro de conexão (silenciado):', err.message);
    });

    redis.on('connect', () => console.log('[Redis] Conectado com sucesso.'));
  } catch (error) {
    console.error('[Redis] Falha ao inicializar cliente:', error);
    redis = null;
  }
} else {
  console.warn('[Redis] REDIS_URL não configurada. Location tracking desabilitado.');
}

// ── Histórico de conversa da Bella ─────────────────────────────────────────
// Mantém as últimas MAX_HISTORY mensagens por telefone com TTL de 24h.
// Se Redis não estiver disponível, bella.ts opera no modo stateless (sem histórico).

const MAX_HISTORY = 10; // 5 trocas (user + assistant)
const HISTORY_TTL  = 86400; // 24 horas em segundos

export interface ConvMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getConversationHistory(phone: string): Promise<ConvMessage[]> {
  if (!redis) return [];
  try {
    const raw = await redis.get(`bella:conv:${phone.replace(/\D/g, '')}`);
    return raw ? (JSON.parse(raw) as ConvMessage[]) : [];
  } catch {
    return []; // Redis indisponível → stateless
  }
}

export async function appendConversationHistory(
  phone: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  if (!redis) return;
  try {
    const key = `bella:conv:${phone.replace(/\D/g, '')}`;
    const history = await getConversationHistory(phone);
    history.push({ role, content });
    const trimmed = history.slice(-MAX_HISTORY); // Janela deslizante
    await redis.set(key, JSON.stringify(trimmed), 'EX', HISTORY_TTL);
  } catch {
    // Silenciado — degradação graceful para stateless
  }
}

/**
 * Registra uma intenção de localização no Redis
 */
export async function trackLocationIntent(data: any) {
  if (!redis) return { success: false, error: 'Redis not initialized' };

  const timestamp = new Date().toISOString();
  const dateKey = timestamp.split('T')[0];
  
  const payload = {
    ...data,
    timestamp,
    userAgent: 'server', // SSR context
  };

  try {
    const pipeline = redis.pipeline();

    // 1. Append na lista de intents brutos (cap at 1000 entries, expire daily keys after 90 days)
    pipeline.lpush('location:intents', JSON.stringify(payload));
    pipeline.ltrim('location:intents', 0, 999);

    // 2. Incrementa contador geral
    pipeline.incr('location:intents:count');

    // 3. Incrementa contador do dia (expire after 90 days)
    pipeline.incr(`location:intents:${dateKey}`);
    pipeline.expire(`location:intents:${dateKey}`, 60 * 60 * 24 * 90);

    // 4. Incrementa contador por bairro se existir
    if (data.neighborhood && data.neighborhood !== 'Outro') {
      pipeline.hincrby('location:intents:neighborhoods', data.neighborhood, 1);
    }

    // 5. Incrementa contador de permissão
    if (data.permission) {
      pipeline.hincrby('location:intents:permissions', data.permission, 1);
    }

    await pipeline.exec();
    return { success: true };
  } catch (error) {
    console.error('Redis Track Error:', error);
    return { success: false, error };
  }
}
