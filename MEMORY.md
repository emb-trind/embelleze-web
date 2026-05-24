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
- Webhook validado em PRODUÇÃO:
  - `src/pages/api/zapi/webhook.ts` — entrada Z-API
  - `src/lib/zapi.ts` — envio com `normalizePhone` + `maskPhone`
  - `src/lib/bella.ts` — Azure OpenAI (system prompt de `bella.knowledge.md`)
  - `src/pages/api/health/zapi.ts` — requer `X-Health-Token`
- Fluxo de dados: Z-API → Webhook → bella.ts (Azure)
  → zapi.ts → db.ts → lead_events.
- Probeltec implementado: `src/lib/probeltec.ts`
  Auth + createLead. Sync atômico via `claimProbeltecSync`.
  Sync só ocorre se `upsertLead` salvar com sucesso (leadSaved).
- `appendLeadEvent` persiste em tabela `lead_events`
  (criada automaticamente na primeira chamada por processo).
- Segurança reforçada nesta sessão:
  - Webhook rejeita quando `ZAPI_CLIENT_TOKEN` não está definido
  - Health endpoint exige `HEALTH_TOKEN` via `X-Health-Token`
  - `content-length` validado como número (não string)
  - Telefone normalizado para E.164 antes de enviar pela Z-API
  - Logs nunca expõem mais que os últimos 4 dígitos do telefone
  - `isValidTicket` valida formato real `BELLA-{base36}-{3chars}`

────────────────────────────────────────

## ⍟ Princípio

O site não é vitrine.
É máquina de captação, qualificação e conversão
para WhatsApp e matrícula.
LPs de campanha são satélites — convertem para o mesmo WhatsApp.
