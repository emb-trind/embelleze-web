<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# MEMORY

```text
========================================
   EMBELLEZE WEB · MEMORY
========================================
Escopo : embelleze-web/
Função : Decisões tomadas — não regredir
========================================
```

## ⟠ Decisões

- A landing deve parecer local e real,
  não institucional genérica.
- Bella aparece como consultora virtual
  e ponte para o WhatsApp.
- Vitória é o agente de atendimento do chat do site: entende intenção, responde dúvidas do site e encaminha para Bella/WhatsApp quando houver pedido de atendimento, condição comercial ou reserva. Prompt canônico: `src/content/vitoria.web.md`.
- Oferta é dinâmica por curso ativo
  via `src/content/offers.json`.
- Ticket/código de desconto é mecânica
  de conversão, não desconto real.
- O componente `DiscountTicket` foi comentado por decisão do arquiteto, pois não há ação de marketing ativa no momento. A seção foi mantida modular para ser ativada/desativada conforme a necessidade de campanhas.
- Mapa é página separada em `/mapa`.
- Prova social usa apenas materiais
  aprovados pelo cliente.
- Params UTM de `/oferta` são repassados
  para o link do WhatsApp.
- Webhook ativo:
  - `src/pages/api/whatsapp/webhook.ts` — entrada Baileys via `neo-whatsapp-connect`
  - `src/lib/whatsapp-gateway.ts` — envio via gateway Baileys
  - `src/lib/phone.ts` — `normalizePhone` + `maskPhone`
  - `src/lib/bella.ts` — Azure OpenAI (system prompt de `bella.knowledge.md`)
- Fluxo de dados: Baileys → Webhook → bella.ts (Azure)
  → whatsapp-gateway.ts → db.ts → lead_events.
- Probeltec implementado: `src/lib/probeltec.ts`
  Auth + createLead. Sync atômico via `claimProbeltecSync`.
  Sync só ocorre se `upsertLead` salvar com sucesso (leadSaved).
- `appendLeadEvent` persiste em tabela `lead_events`
  (criada automaticamente na primeira chamada por processo).
- Segurança reforçada nesta sessão:
  - Webhook Baileys rejeita quando `WHATSAPP_WEBHOOK_SECRET` não está definido
  - FlowPay exige `FLOWPAY_WEBHOOK_SECRET`
  - `content-length` validado como número (não string)
  - `/api/bella/chat`, `/api/leads` e `/api/location-intent` têm rate limit em memória por IP
  - Middleware global aplica headers básicos: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
  - Telefone normalizado para E.164 antes de enviar pelo gateway WhatsApp
  - Logs nunca expõem mais que os últimos 4 dígitos do telefone
  - `isValidTicket` valida formato real `BELLA-{base36}-{3chars}`
- Handoff do chat do site deve usar apenas o fluxo canônico `wa.me` via CTA do componente; não usar deep link de WhatsApp Business, Play Store, Apple Store ou URL alternativa.

────────────────────────────────────────

## ⍟ Princípio

O site não é vitrine.
É máquina de captação, qualificação e conversão
para WhatsApp e matrícula.
LPs de campanha são satélites — convertem para o mesmo WhatsApp.
