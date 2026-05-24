import type { MiddlewareHandler } from "astro";

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",

    // 'nonce-{value}': browsers modernos ignoram 'unsafe-inline' quando nonce presente —
    // scripts inline sem o nonce são bloqueados (XSS mitigation).
    // 'unsafe-inline' fica como fallback para browsers sem suporte a nonce.
    // 'self' cobre os bundles Astro servidos em /_astro/*.js.
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline'`
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

    "connect-src 'self'"
      + " https://www.google-analytics.com"
      + " https://analytics.google.com"
      + " https://stats.g.doubleclick.net"
      + " https://region1.google-analytics.com"
      + " https://www.googletagmanager.com"
      + " https://www.facebook.com"
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
