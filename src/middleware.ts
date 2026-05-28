import type { MiddlewareHandler } from "astro";
import { sendCapiPageView } from "./lib/capi";

const buildCSP = (nonce: string): string => {
  return [
    "default-src 'self'",

    // 'self' cobre os bundles Astro servidos em /_astro/*.js.
    // O middleware injeta o nonce em todos os <script> inline do HTML renderizado,
    // incluindo os gerados pelo Astro (type="module" inline). Sem 'unsafe-inline'.
    `script-src 'self' 'nonce-${nonce}'`
      + " https://connect.facebook.net",

    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",

    "img-src 'self' data:"
      + " https://www.google.com"
      + " https://www.facebook.com",

    "connect-src 'self'"
      + " https://www.facebook.com"
      + " https://graph.facebook.com"
      + " https://connect.facebook.net"
      + " https://*.ecs.us-east-2.on.aws"
      + " https://api-auth.probeltec.com"
      + " https://api.probeltec.com",

    "frame-src 'self' https://www.google.com https://www.facebook.com https://m.facebook.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
};

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Nonce gerado por request — 128 bits de entropia, base64
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16))
  ).toString("base64");

  const pageViewEventId = crypto.randomUUID();

  context.locals.cspNonce = nonce;
  context.locals.pageViewEventId = pageViewEventId;

  const response = await next();

  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  );
  headers.set("Content-Security-Policy", buildCSP(nonce));

  // Injeta nonce em todos os <script> inline gerados pelo Astro (e os nossos).
  // Necessário porque o Astro gera <script type="module"> inline sem nonce.
  const contentType = headers.get("content-type") ?? "";
  const isPage = contentType.includes("text/html")
    && !context.url.pathname.startsWith("/api");

  if (isPage) {
    const ip = context.request.headers.get("x-forwarded-for")?.split(",")[0].trim()
      ?? context.request.headers.get("cf-connecting-ip")
      ?? undefined;
    const userAgent = context.request.headers.get("user-agent") ?? undefined;

    const cookieHeader = context.request.headers.get("cookie") ?? "";
    const parseCookie = (name: string) =>
      cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))?.[1];

    const fbc = parseCookie("_fbc")
      ?? (context.url.searchParams.get("fbclid")
        ? `fb.1.${Date.now()}.${context.url.searchParams.get("fbclid")}`
        : undefined);
    const fbp = parseCookie("_fbp");

    void sendCapiPageView({
      eventId: pageViewEventId,
      eventSourceUrl: context.url.href,
      ip,
      userAgent,
      fbc,
      fbp,
    });

    const html = await response.text();
    const noncedHtml = html.replace(
      /<script(?![^>]*\bnonce=)(?=[^>]*>)/gi,
      `<script nonce="${nonce}"`,
    );
    return new Response(noncedHtml, { status: response.status, headers });
  }

  return new Response(response.body, { status: response.status, headers });
};
