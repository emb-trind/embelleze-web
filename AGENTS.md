<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# AGENTS — embelleze-web

```text
========================================
   EMBELLEZE WEB · AGENTS
========================================
Escopo : embelleze-web/
Repo   : github.com/emb-trind/embelleze-web
Deploy : Railway — Railpack (v0.23.0) via railway.toml
========================================
```

## ⟠ Projeto

Site/webapp oficial de captação e conversão do Instituto Embelleze Trindade.
SDR Bella integrada via Azure OpenAI — responde no WhatsApp e no chat do site.

```text
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ Framework   Astro SSR
┃ Domínio     embelleze-bella.online
┃ Deploy      Railway → emb-trind/embelleze-web
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⨷ Estrutura

```text
src/
  pages/index.astro        apenas importa seções
  sections/                blocos da landing
  components/              UI reutilizável
  content/                 dados editáveis (courses, faqs, offers)
  middleware.ts             security headers + CSP com nonce por request
  env.d.ts                 tipos de App.Locals (cspNonce)
  lib/
    bella.ts               generateBellaReply() — Azure OpenAI
    db.ts                  upsertLead, claimProbeltecSync, getLeadByPhone
    redis.ts               histórico conversa Bella
    phone.ts               normalizePhone, maskPhone
    rate-limit.ts          enforceRateLimit() — in-memory, por IP
    whatsapp-gateway.ts    sendGatewayMessage → neo-whatsapp-connect
    probeltec.ts           createLead → CRM
    resend.ts              emails transacionais
    whatsapp.ts            links wa.me
  pages/api/
    whatsapp/webhook.ts    ← inbound Baileys (Bearer WHATSAPP_WEBHOOK_SECRET)
    bella/chat.ts          chat FAB do site (Vitória — atendimento web)
    leads.ts               captura formulário
    location-intent.ts     geolocalização de intenção
    payment/flowpay/
      webhook.ts           confirmação pagamento PIX_PAGO (Bearer FLOWPAY_WEBHOOK_SECRET)
  content/
    vitoria.web.md         prompt da Vitória — atendimento web
    bella.knowledge.md     base de conhecimento estratégica da Bella (não exposta no site)
```

---

## ◬ Canais WhatsApp

| Canal | Status | Endpoint |
| Baileys (neo-whatsapp-connect) | ativo | `/api/whatsapp/webhook` |

---

## ⍟ Proibições

- Não colocar seções dentro de `index.astro`
- Não duplicar links de WhatsApp — usar sempre `whatsapp.ts`
- Não inventar dados comerciais
- Não inserir preços sem validação do cliente
- Não criar dependências pesadas sem necessidade
- Lógica de Bella fica em `bella.ts` — não espalhar por outros arquivos
