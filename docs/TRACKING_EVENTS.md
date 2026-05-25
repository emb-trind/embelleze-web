<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# TRACKING EVENTS

```text
========================================
   EMBELLEZE WEB · TRACKING EVENTS
========================================
```

## ⟠ Eventos Implementados

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ EVENTO                    ONDE               PIXEL   CAPI   DEDUP
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ PageView                  Todas as páginas   ✅      ✅     pageViewEventId
┃ Lead                      Simulador          ✅      ✅     event_id (api/leads)
┃ PAGE_VIEW (custom)        Todas as páginas   ✅      —      —
┃ CLICK_WHATSAPP            Botões WhatsApp    ✅      —      —
┃ CLICK_COURSE              CourseCard         ✅      —      —
┃ OPEN_MAP                  MapPreview         ✅      —      —
┃ START_FUTURE_SIMULATOR    1º clique quiz     ✅      —      —
┃ COMPLETE_FUTURE_SIMULATOR Conclusão quiz     ✅      —      —
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> Google Ads / GA4 removidos. Tracking via Meta Pixel + CAPI.
> Envs: `PUBLIC_META_PIXEL_ID` e `CAPI_ACCESS_TOKEN` no Railway.

────────────────────────────────────────

## ⍟ Eventos para Otimização de Campanha META

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ OBJETIVO NO ADS MANAGER   EVENTO A USAR        ONDE CONFIGURAR
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Otimizar por leads         Lead                 Pixel E Trind Web
┃ Otimizar por alcance       PageView             Pixel E Trind Web
┃ Awareness / tráfego        PageView             Pixel E Trind Web
┃ Retargeting simulador      START_FUTURE_SIMULATOR  Evento customizado
┃ Retargeting fundo funil    CLICK_WHATSAPP          Evento customizado
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Conversão principal: Lead (QUALIFICADO via simulador)
→ Use como evento de otimização em campanhas de conversão
→ Cobertura CAPI ativa — Meta recebe o sinal mesmo com bloqueador de ads

Evento de conversão futura (pendente CAPI):
→ Purchase — disparar após PIX_PAGO confirmado via FlowPay webhook
   implementar em: src/pages/api/payment/flowpay/webhook.ts
```

────────────────────────────────────────

## ⧉ Referência de Código

```text
▓▓▓ BROWSER — Meta Pixel
────────────────────────────────────────
└─ src/lib/tracking.ts           enum Events + fn track() + trackMeta()
└─ src/components/TrackingPixel.astro
   init + PageView com eventID para dedup CAPI

▓▓▓ SERVER — Conversions API
────────────────────────────────────────
└─ src/lib/capi.ts               sendCapiPageView() + sendCapiLead()
└─ src/middleware.ts             dispara PageView CAPI (fire-and-forget)
                                 gera pageViewEventId → Astro.locals
└─ src/pages/api/leads.ts        dispara Lead CAPI (status QUALIFICADO)
                                 retorna event_id para dedup no browser
```
