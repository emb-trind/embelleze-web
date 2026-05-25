<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# TRÁFEGO PAGO

```text
========================================
   EMBELLEZE WEB · TRÁFEGO PAGO
========================================
Status: ATIVO
Última revisão: 2026-05-25 (CAPI implementada)
========================================
```

## ⟠ Estado Atual

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CANAL                   STATUS
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Meta Pixel              Ativo — PUBLIC_META_PIXEL_ID (Railway)
┃ Meta Conversions API    Ativo — CAPI_ACCESS_TOKEN (Railway)
┃ Meta Ads                Ativo — campanhas rodando
┃ Google Ads              Não implementado — removido do código
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⨷ Tracking Implementado

```text
▓▓▓ EVENTOS BROWSER — src/lib/tracking.ts
────────────────────────────────────────
└─ PAGE_VIEW                 qualquer página
└─ CLICK_WHATSAPP            clique em wa.me
└─ CLICK_COURSE              clique em card de curso
└─ OPEN_MAP                  interação com mapa
└─ START_FUTURE_SIMULATOR    primeiro clique no quiz (corrigido: era page load)
└─ COMPLETE_FUTURE_SIMULATOR conclusão do quiz

▓▓▓ EVENTOS CAPI SERVER-SIDE — src/lib/capi.ts
────────────────────────────────────────
└─ PageView   middleware.ts — toda request HTML, fire-and-forget
              dedup com pixel via pageViewEventId (Astro.locals)
└─ Lead       api/leads.ts — somente status QUALIFICADO (simulador)
              dedup com pixel via event_id retornado na response
```

Pixel ID : `1879889489292663` — dataset "E Trind Web"
System User: `61590504080297` — "Conversions API System User"

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

Campanha ativa: `ativacao-mai26` — definida em `src/lib/constants.ts`.

```text
▓▓▓ CONVENÇÃO
────────────────────────────────────────
utm_source   → canal de origem
utm_medium   → tipo de mídia
utm_campaign → slug da campanha (NÃO mudar mid-flight)
utm_content  → criativo ou elemento clicado
utm_term     → segmento de público (Meta) / palavra-chave (Google)
```

```text
▓▓▓ META ADS — links prontos para campanha
────────────────────────────────────────
utm_source=meta
utm_medium=paid_social
utm_campaign=ativacao-mai26
utm_content=[formato]-[variação]   ← substituir conforme o criativo

CONVENÇÃO utm_content
  formato  : feed | stories | reels | carrossel | messenger
  variação : sequência numérica ou descrição curta
  exemplos : feed-video-01 | stories-img-02 | reels-01
             carrossel-cursos | feed-depo-gabriela

PÁGINAS DE DESTINO
────────────────────────────────────────

/ — awareness / topo de funil
https://embelleze-bella.online/?utm_source=meta&utm_medium=paid_social&utm_campaign=ativacao-mai26&utm_content=[formato]-[variação]

/cursos — fundo de funil / interesse por curso
https://embelleze-bella.online/cursos?utm_source=meta&utm_medium=paid_social&utm_campaign=ativacao-mai26&utm_content=[formato]-[variação]

/oferta — conversão direta / oferta com preço
https://embelleze-bella.online/oferta?utm_source=meta&utm_medium=paid_social&utm_campaign=ativacao-mai26&utm_content=[formato]-[variação]

/mapa — geo targeting / campanha local (Trindade e região)
https://embelleze-bella.online/mapa?utm_source=meta&utm_medium=paid_social&utm_campaign=ativacao-mai26&utm_content=[formato]-[variação]

NOTA: fbclid é injetado automaticamente pelo Meta.
      Não adicionar manualmente. Não remover da URL recebida.
```

UTMs preservados na URL e gravados
no Postgres (first-touch, nunca sobrescrito).

────────────────────────────────────────

## ◬ Checklist Pré-Campanha

```text
▓▓▓ ENV VARS (Railway → Variables)
────────────────────────────────────────
└─ PUBLIC_META_PIXEL_ID=<pixel_id>      ✅ configurado
└─ CAPI_ACCESS_TOKEN=<system_user_token> ✅ configurado

▓▓▓ META BUSINESS MANAGER
────────────────────────────────────────
└─ System User: Conversions API System User (ID: 61590504080297)
└─ Pixel E Trind Web atribuído com Full control
└─ Token: gerado com ads_management + ads_read (sem expiração)
└─ Para renovar token: Business Settings → System users → Generate token
```

────────────────────────────────────────

```text
▓▓▓ EMBELLEZE TRINDADE
────────────────────────────────────────
Operação digital · captação e conversão
Trindade/GO
────────────────────────────────────────
```
