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
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CANAL          STATUS
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Meta Pixel     Ativo — PUBLIC_META_PIXEL_ID (Railway)
┃ Meta Ads       Ativo — campanhas rodando
┃ Google Ads     Não implementado — removido do código
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
▓▓▓ ENV VARS (Railway → Variables)
────────────────────────────────────────
└─ PUBLIC_META_PIXEL_ID=<pixel_id>
```

────────────────────────────────────────

```text
▓▓▓ EMBELLEZE TRINDADE
────────────────────────────────────────
Operação digital · captação e conversão
Trindade/GO
────────────────────────────────────────
```
