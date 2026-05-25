<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# TRACKING EVENTS

```text
========================================
   EMBELLEZE WEB · TRACKING EVENTS
========================================
```

## ⟠ Eventos Implementados

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ EVENTO                    ONDE               TOOL
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ PAGE_VIEW                 Todas as páginas   Meta
┃ CLICK_WHATSAPP            Botões WhatsApp    Meta
┃ CLICK_COURSE              CourseCard         Meta
┃ GENERATE_DISCOUNT_TICKET  DiscountTicket     Meta
┃ START_FUTURE_SIMULATOR    FutureSimulator    Meta
┃ COMPLETE_FUTURE_SIMULATOR FutureSimulator    Meta
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> Google Ads / GA4 removidos. Tracking ativo somente via Meta Pixel (fbq).
> Env: `PUBLIC_META_PIXEL_ID` no Railway.

────────────────────────────────────────

## ⧉ Referência de Código

```text
▓▓▓ ARQUIVOS
────────────────────────────────────────
└─ src/lib/tracking.ts      enum Events + fn track()
└─ src/scripts/events.client.ts
   PAGE_VIEW e CLICK automáticos por elemento
└─ src/components/TrackingPixel.astro
   Injeção do Meta Pixel (condicional via PUBLIC_META_PIXEL_ID)
```
