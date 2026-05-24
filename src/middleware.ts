import type { MiddlewareHandler } from "astro";

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",

    // 'strict-dynamic': permite que scripts carregados por um script com nonce válido
    // também executem — necessário para GTM e Meta Pixel injetarem seus sub-scripts.
    // Em browsers modernos: nonce + strict-dynamic são usados; 'unsafe-inline' e URLs
    // são ignorados. Em browsers antigos: cai para 'unsafe-inline' + URL allowlist.
    `script-src 'strict-dynamic' 'nonce-${nonce}' 'unsafe-inline'`
      + " https://www.googletagmanager.com"
      + " https://www.googleadservices.com"
      + " https://googleads.g.doubleclick.net"
      + " https://connect.facebook.net",

    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",

    "img-src 'self' data:"
      + " https://www.google.com"
      + " https://www.googleadservices.com"
      + " https://googleads.g.doubleclick.net"
      + " https://www.googletagmanager.com"
      + " https://www.facebook.com",

    // Nota: o Meta Pixel também conecta em *.ecs.us-east-2.on.aws (infra AWS da Meta).
    // CSP wildcards cobrem apenas um nível de subdomínio, então esse endpoint de múltiplos
    // níveis não pode ser allowlistado de forma precisa — é uma limitação conhecida do Pixel.
    "connect-src 'self'"
      + " https://www.google-analytics.com"
      + " https://analytics.google.com"
      + " https://stats.g.doubleclick.net"
      + " https://region1.google-analytics.com"
      + " https://www.googletagmanager.com"
      + " https://www.facebook.com"
      + " https://graph.facebook.com"
      + " https://connect.facebook.net"
      + " https://api-auth.probeltec.com"
      + " https://api.probeltec.com",

    "frame-src 'self' https://www.google.com https://www.facebook.com https://td.doubleclick.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Nonce gerado por request — 128 bits de entropia, base64
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16))
  ).toString("base64");

  // Disponibiliza para todos os .astro via Astro.locals.cspNonce
  context.locals.cspNonce = nonce;

  const response = await next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  );
  response.headers.set("Content-Security-Policy", buildCSP(nonce));

  return response;
};
