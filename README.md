<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# embelleze-web

```text
========================================
   EMBELLEZE TRINDADE · WEB APP
========================================
Status: ESTÁVEL (Fase 2)
Versão: v1.0.0
========================================
```

## ⟠ Objetivo

Captar, qualificar e converter visitantes em
matrículas via Bella (WhatsApp SDR).

O site não é institucional.
É a plataforma central de captação, qualificação,
Bella SDR, CRM e conversão.
LPs de campanha (embelleze-lp-*) são satélites deste core.

────────────────────────────────────────

## ⨷ Contexto

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CLIENTE       Instituto Embelleze Trindade
┃ CNPJ          19.367.067/0001-97
┃ CIDADE        Trindade/GO
┃ WHATSAPP      62 994789032
┃ DOMÍNIO       embelleze-bella.online
┃ DEPLOY        Railway
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

────────────────────────────────────────

## ⧉ Funil de Conversão

```text
▓▓▓ PÁGINAS
────────────────────────────────────────
└─ /           Home — orquestra todas as seções
└─ /mapa       Localização + rota para o instituto
└─ /oferta     Página de campanha por curso e UTM
└─ /obrigado   Confirmação + disparo de conversão
```

```text
▓▓▓ SEÇÕES — HOME
────────────────────────────────────────
└─ Hero              Captura atenção em 3 segundos
└─ BellaIntro        Apresenta a consultora virtual
└─ LocalImpact       Conecta com Trindade/GO
└─ CourseOffer       Oferta ativa com urgência
└─ DiscountTicket    Código que gera ação imediata
└─ CoursesGrid       Grade de cursos com contexto
└─ ObjectionBreak    Elimina objeções antes do WA
└─ SocialProof       Depoimentos reais (aprovados)
└─ FutureSimulator   Captura Nome/WhatsApp e sugere curso
└─ MapPreview        Ponte para /mapa
└─ FinalCTA          Fechamento direto
└─ WhatsAppFloat     Botão fixo de conversão
```

────────────────────────────────────────

## ⧇ Stack

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CAMADA        TECNOLOGIA
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Framework     Astro
┃ Estilo        CSS modular (tokens.css)
┃ Scripts       TypeScript (client-side)
┃ Deploy        Railway
┃ Tracking      GTM + GA4 + Meta Pixel
┃ CRM           PostgreSQL (Railway)
┃ Cache/Stats   Redis (Railway)
┃ Conversão     WhatsApp via wa.me + Lead capture
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```diagram
sequenceDiagram
  actor Cron
  participant ProbeltecSyncAPI as api_probeltec_sync
  participant DB as db_ts
  participant ProbeltecAPI as probeltec_ts
  participant MetaCAPI as meta_capi

  Cron->>ProbeltecSyncAPI: GET /api/probeltec/sync
  ProbeltecSyncAPI->>DB: getLeadsWithProbeltecId()
  DB-->>ProbeltecSyncAPI: leads

  loop for each lead
    ProbeltecSyncAPI->>ProbeltecAPI: fetchLeadStatus(probeltec_id)
    ProbeltecAPI-->>ProbeltecSyncAPI: status

    alt [status]
      ProbeltecSyncAPI->>DB: updateProbeltecStatus(phone, status)
      alt [status == Matriculado]
        ProbeltecSyncAPI->>DB: upsertLead({ phone, status: CHECKOUT_PAGO })
        DB-->>MetaCAPI: claimAndSendMetaCAPI(phone, data)
      end
    end
  end
```

────────────────────────────────────────

## ⍟ Regras Críticas

- Nunca inventar preço.
- Nunca inventar data de início de turma.
- Nunca prometer vaga disponível sem confirmação.
- Todo link de WhatsApp passa por `src/lib/whatsapp.ts`.
- Todo evento de tracking passa por `src/lib/tracking.ts`.
- `src/pages/index.astro` apenas importa seções.
- Dados de negócio ficam em `src/content/`.

────────────────────────────────────────

## ◬ Documentação

**Começar aqui:**
- [SETUP](./SETUP.md) — instalação, variáveis e comandos
- [docs/LANDING_STRATEGY.md](./docs/LANDING_STRATEGY.md) — estratégia do funil
- [docs/OFFER_LOGIC.md](./docs/OFFER_LOGIC.md) — lógica da oferta e ticket
- [docs/TRACKING_EVENTS.md](./docs/TRACKING_EVENTS.md) — eventos implementados
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — deploy e domínio
- [docs/VISUAL_IDENTITY.md](./docs/VISUAL_IDENTITY.md) — cores e assets

**Conteúdo editável:**
- [src/content/courses.json](./src/content/courses.json) — cursos e horários
- [src/content/offers.json](./src/content/offers.json) — oferta ativa
- [src/content/bella.knowledge.md](./src/content/bella.knowledge.md) — base da Bella

────────────────────────────────────────

```text
▓▓▓ NΞØ MELLØ
────────────────────────────────────────
Core Architect · NΞØ Protocol
neo@neoprotocol.space

"Code is law. Expand until
chaos becomes protocol."

Security by design.
Exploits find no refuge here.
────────────────────────────────────────
```
