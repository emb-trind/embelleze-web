export const WHATSAPP_NUMBER = '5562994813565';
export const WHATSAPP_DISPLAY = '(62) 99481-3565';

// ─── SEO / Canonical URLs ───────────────────────────────────────────────────
// Single source of truth for public domain + social preview assets.
export const SITE_URL = 'https://embelleze-bella.online';
export const CANONICAL_BASE_URL = new URL('/', SITE_URL).href;
export const OG_IMAGE_VERSION = '2';
export const OG_IMAGE_URL = new URL(
  `/og-image.png?v=${OG_IMAGE_VERSION}`,
  CANONICAL_BASE_URL,
).href;
export const BRAND_LOGO_URL = new URL(
  '/brand/logo-embelleze.png',
  CANONICAL_BASE_URL,
).href;

export const INSTITUTE_NAME = 'Instituto Embelleze Trindade';
export const INSTITUTE_ADDRESS = 'Av. Manoel Monteiro, 1691 — Vila Padre Eterno, Trindade/GO';
export const INSTITUTE_EMAIL = 'cursos@embelleze-bella.online';
export const INSTITUTE_INSTAGRAM = '@institutoembellezetrindadego';
export const INSTITUTE_INSTAGRAM_URL = 'https://www.instagram.com/institutoembellezetrindadego/';

// ─── UTM / Rastreamento de Tráfego ──────────────────────────────────────────
//
// CAMPANHA ATIVA: ativacao-mai26
// Canais: Meta Ads · Google Ads · TikTok Ads · Orgânico
//
// Convenção de nomenclatura:
//   utm_source   → canal de origem (meta, google, tiktok, instagram, site)
//   utm_medium   → tipo de mídia (paid_social, cpc, organic_social, cta)
//   utm_campaign → slug da campanha — NÃO mudar mid-flight (quebra comparação)
//   utm_content  → criativo ou elemento específico clicado
//   utm_term     → palavra-chave (Google Ads) ou segmento de público (Meta/TikTok)
//
// Cada plataforma também injeta seu próprio parâmetro de clique:
//   Meta    → fbclid  (auto, não remover)
//   Google  → gclid   (auto, ativar auto-tagging no Google Ads)
//   TikTok  → ttclid  (auto, ativar TikTok Pixel no Ads Manager)

export const CAMPAIGN_SLUG = 'ativacao-mai26';

// Links que saem do site para redes sociais (botões internos da landing)
export const UTM_SOURCE_SITE = 'site-embelleze-trindade';

// UTMs por canal de entrada (usados nas URLs dos anúncios que apontam para cá)
export const UTM = {
  meta: {
    source: 'meta',
    medium: 'paid_social',
    campaign: CAMPAIGN_SLUG,
    // utm_content e utm_term variam por criativo — definir no Ads Manager
  },
  google: {
    source: 'google',
    medium: 'cpc',
    campaign: CAMPAIGN_SLUG,
    // utm_term = palavra-chave, utm_content = ad group
  },
  tiktok: {
    source: 'tiktok',
    medium: 'paid_social',
    campaign: CAMPAIGN_SLUG,
  },
  organic: {
    source: 'instagram',
    medium: 'organic_social',
    campaign: CAMPAIGN_SLUG,
  },
} as const;

// Helper — monta URL com UTMs para links de saída do site
export function buildUtmUrl(
  baseUrl: string,
  medium: string,
  content: string,
): string {
  const params = new URLSearchParams({
    utm_source: UTM_SOURCE_SITE,
    utm_medium: medium,
    utm_campaign: CAMPAIGN_SLUG,
    utm_content: content,
  });
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}${params.toString()}`;
}

export const COURSE_STANDARD_FEATURES = [
  'Formação profissionalizante',
  'Foco em prática real',
  'Situações de atendimento real',
  'Uso de equipamentos e modelos',
  'Possibilidade de atuar como autônomo',
] as const;

export const COLORS = {
  orange: '#de583d',
  purple: '#5f3080',
  white: '#ffffff',
  black: '#171018',
} as const;
