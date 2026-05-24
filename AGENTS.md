<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# AGENTS — embelleze-web

```text
========================================
   EMBELLEZE WEB · AGENTS
========================================
Escopo : embelleze-web/
Repo   : github.com/emb-trind/embelleze-web
Deploy : Railway — build direto do repo via Dockerfile
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
  lib/
    bella.ts               generateBellaReply() — Azure OpenAI
    db.ts                  upsertLead, claimProbeltecSync, getLeadByPhone
    redis.ts               histórico conversa Bella
    zapi.ts                sendTextMessage (legado Z-API)
    probeltec.ts           createLead → CRM
    resend.ts              emails transacionais
    whatsapp.ts            links wa.me
  pages/api/
    whatsapp/webhook.ts    ← inbound Baileys (gateway neo-whatsapp-connect)
    zapi/webhook.ts        ← inbound Z-API (legado — desativar após Baileys)
    bella/chat.ts          chat FAB do site (Vitória)
    leads.ts               captura formulário
    payment/flowpay/
      webhook.ts           confirmação pagamento PIX_PAGO
```

---

## ◬ Canais WhatsApp

| Canal | Status | Endpoint |
|---|---|---|
| Baileys (neo-whatsapp-connect) | ativo em breve | `/api/whatsapp/webhook` |
| Z-API | legado — em produção | `/api/zapi/webhook` |

Desativar Z-API somente após validar Baileys em produção.

---

## ⍟ Proibições

- Não colocar seções dentro de `index.astro`
- Não duplicar links de WhatsApp — usar sempre `whatsapp.ts`
- Não inventar dados comerciais
- Não inserir preços sem validação do cliente
- Não criar dependências pesadas sem necessidade
- Lógica de Bella fica em `bella.ts` — não espalhar por outros arquivos
