<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# TRÁFEGO PAGO

```text
========================================
   EMBELLEZE WEB · TRÁFEGO PAGO
========================================
Status: ATIVO
Última revisão: 2026-05-18
========================================
```

## ⟠ Estado Atual

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CANAL          STATUS
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Google Ads     Ativo — AW-18004058795
┃ Google GTM     Pronto — aguarda PUBLIC_GTM_ID
┃ Meta Pixel     Pronto — aguarda conta Meta
┃ Meta Ads       Bloqueado — conta do cliente
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⨷ Tracking Implementado

```text
▓▓▓ EVENTOS — src/lib/tracking.ts
────────────────────────────────────────
└─ PAGE_VIEW                 qualquer página
└─ CLICK_WHATSAPP            clique em wa.me
└─ CLICK_COURSE              clique em card de curso
└─ GENERATE_DISCOUNT_TICKET  geração de código (desativada)
└─ OPEN_MAP                  interação com mapa
└─ START_FUTURE_SIMULATOR    início do quiz
└─ COMPLETE_FUTURE_SIMULATOR conclusão do quiz
```

```text
▓▓▓ CONVERSÕES RECOMENDADAS — Google Ads
────────────────────────────────────────
└─ Principal   CLICK_WHATSAPP           lead quente
└─ Secundária  COMPLETE_FUTURE_SIMULATOR lead qualificado
```

────────────────────────────────────────

## ⧉ Captura de Leads

```text
▓▓▓ ORIGENS → POSTGRES
────────────────────────────────────────
└─ Simulador (quiz)  POST /api/leads    QUALIFICADO
└─ Clique WhatsApp   POST /api/leads    INTERESSADO
                     (interceptor global)
```

Campos: `phone`, `name`, `course_interest`,
`objective`, `origin`, `status`.

────────────────────────────────────────

## ⧇ URLs de Destino

```text
▓▓▓ PÁGINAS POR CAMPANHA
────────────────────────────────────────
└─ /          campanha geral (awareness)
└─ /cursos    fundo de funil (por curso)
└─ /mapa      campanha local/proximidade
└─ /obrigado  confirmação (disparo pixel)
```

LPs de campanha dedicadas ficam em pacotes
separados `embelleze-lp-[slug]`.

────────────────────────────────────────

## ⍟ UTM Padrão

```bash
https://embelleze-bella.online/
  ?utm_source=google
  &utm_medium=cpc
  &utm_campaign=manicure-jun26
```

UTMs preservados na URL e gravados
no Postgres (first-touch, nunca sobrescrito).

────────────────────────────────────────

## ◬ Checklist Pré-Campanha

```text
▓▓▓ ATIVAÇÕES NECESSÁRIAS
────────────────────────────────────────
[ ] PUBLIC_META_PIXEL_ID no Railway
[ ] PUBLIC_GTM_ID no Railway (se usar GTM)
[ ] Conversões configuradas no Google Ads
[ ] Evento customizado Meta Ads: CLICK_WHATSAPP
[ ] Validar com Meta Pixel Helper + GA4 DebugView
[ ] Definir públicos de remarketing
```

```text
▓▓▓ ENV VARS (Railway → Variables)
────────────────────────────────────────
└─ PUBLIC_GTM_ID=GTM-XXXXXXX
└─ PUBLIC_META_PIXEL_ID=000000000000
```

────────────────────────────────────────

```text
▓▓▓ EMBELLEZE TRINDADE
────────────────────────────────────────
Operação digital · captação e conversão
Trindade/GO
────────────────────────────────────────
```
