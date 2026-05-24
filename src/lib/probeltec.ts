const AUTH_URL =
  process.env.PROBELTEC_AUTH_URL || "https://api-auth.probeltec.com/v1";
const API_URL =
  process.env.PROBELTEC_API_URL || "https://api.probeltec.com/api/v1";

const DEFAULT_ORIGIN_ID = Number(process.env.PROBELTEC_DEFAULT_ORIGIN_ID ?? 7);
const DEFAULT_ORIGIN_NAME =
  process.env.PROBELTEC_DEFAULT_ORIGIN_NAME || "Instagram WhatsApp";
const DEFAULT_FUNNEL_ID = Number(process.env.PROBELTEC_DEFAULT_FUNNEL_ID ?? 1);

// Token em memória — preparado para migrar para Redis
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export interface ProbeltecLeadParams {
  name: string;
  phone: string;
  email?: string;
  origin?: string;
  idOrigin?: number;
  idFunnel?: number;
}

async function login(): Promise<string> {
  const email = process.env.PROBELTEC_EMAIL;
  const password = process.env.PROBELTEC_PASSWORD;

  if (!email || !password) {
    throw new Error("[Probeltec] PROBELTEC_EMAIL ou PROBELTEC_PASSWORD ausentes");
  }

  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, type: "franchise" }),
  });

  if (!res.ok) {
    throw new Error(`[Probeltec] Login falhou: HTTP ${res.status}`);
  }

  const token = (await res.json()) as string;
  if (typeof token !== "string" || !token.startsWith("eyJ")) {
    throw new Error("[Probeltec] Resposta de login inesperada");
  }
  return token;
}

export async function getToken(): Promise<string> {
  // Renova com 1h de antecedência para evitar expiração em mid-request
  const ONE_HOUR = 3_600_000;
  if (cachedToken && Date.now() < tokenExpiresAt - ONE_HOUR) {
    return cachedToken;
  }

  const token = await login();
  cachedToken = token;
  // JWT expira em ~30 dias — cacheamos por 25 para ter margem
  tokenExpiresAt = Date.now() + 25 * 24 * 60 * 60 * 1000;
  return token;
}

export async function createLead(params: ProbeltecLeadParams): Promise<boolean> {
  const token = await getToken();
  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    name: params.name,
    email: params.email || "",
    phone: params.phone,
    origin: params.origin || DEFAULT_ORIGIN_NAME,
    idOrigin: params.idOrigin ?? DEFAULT_ORIGIN_ID,
    createdAt: today,
    extraInformations: [],
    idFunnel: params.idFunnel ?? DEFAULT_FUNNEL_ID,
    qualifications: {
      courses: [],
      daysOfWeek: [],
      turns: [],
      isOtherFinancialResponsible: 0,
      birthdate: "",
      workshopAttendance: 0,
      workshopPaid: 0,
    },
  };

  const res = await fetch(`${API_URL}/lead/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Probeltec] Criar lead falhou: HTTP ${res.status} — ${body}`);
  }

  return true;
}

