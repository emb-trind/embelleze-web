<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# TRACKING EVENTS

```text
========================================
   EMBELLEZE WEB · TRACKING EVENTS
========================================
```

## ⟠ Eventos Implementados

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ EVENTO                    ONDE               TOOL
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ PAGE_VIEW                 Todas as páginas   GA4, Meta
┃ CLICK_WHATSAPP            Botões WhatsApp    GA4, Meta
┃ CLICK_COURSE              CourseCard         GA4
┃ GENERATE_DISCOUNT_TICKET  DiscountTicket     GA4
┃ OPEN_MAP                  MapPreview         GA4
┃ START_FUTURE_SIMULATOR    FutureSimulator    GA4
┃ COMPLETE_FUTURE_SIMULATOR FutureSimulator    GA4
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⨷ IDs Pendentes

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ VARIÁVEL               STATUS
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ PUBLIC_GTM_ID          aguardando cliente
┃ PUBLIC_META_PIXEL_ID   aguardando cliente
┃ PUBLIC_GA_MEASUREMENT  aguardando cliente
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> Sem os IDs, GTM e Meta Pixel não são injetados.
> O build não quebra.

────────────────────────────────────────

## ⧉ Referência de Código

```text
▓▓▓ ARQUIVOS
────────────────────────────────────────
└─ src/lib/tracking.ts      enum Events + fn track()
└─ src/scripts/events.client.ts
   PAGE_VIEW e CLICK automáticos por elemento
└─ src/components/TrackingPixel.astro
   Injeção de GTM e Meta Pixel
```
