# CLAUDE.md — embelleze-web

```text
========================================
   EMBELLEZE-WEB · Site Principal
========================================
Serviço  : embelleze-bella.online
Tipo     : Astro SSR (Node adapter)
Deploy   : Railway — auto-deploy no push
Repo     : github.com/emb-trind/embelleze-web
========================================
```

## Escopo

Este é o repositório do **site principal**. Ao trabalhar aqui, **não leia nem edite** os serviços vizinhos (`embelleze-lp-hub/`, `embelleze-lp-manicure/`, `neo-whatsapp-connect/`, `embelleze-dashboard/`) a menos que a tarefa envolva integração explícita com eles.

---

## Stack

- **Framework**: Astro 5 — SSR com adaptador Node
- **Runtime**: Node 20
- **Banco**: Postgres (Railway) via `pg` → `src/lib/db.ts`
- **Cache/histórico**: Redis (Railway) → `src/lib/redis.ts`
- **IA**: Azure OpenAI (GPT-4o) → `src/lib/bella.ts`
- **WhatsApp**: Z-API (legado ativo) → `src/lib/zapi.ts`
- **Email**: Resend → `src/lib/resend.ts`
- **CRM**: Probeltec → `src/lib/probeltec.ts`

---

## Arquivos-chave

```
src/
├── layouts/BaseLayout.astro       ← UTM capture + GlobalInterceptor
├── components/TrackingPixel.astro ← Meta Pixel init + CAPI PageView
├── lib/
│   ├── tracking.ts                ← track() + trackMeta()
│   ├── capi.ts                    ← CAPI server-side (Lead, PageView)
│   ├── db.ts                      ← upsertLead + state machine PIX
│   ├── bella.ts                   ← IA SDR (Azure OpenAI + Redis)
│   ├── whatsapp.ts                ← getWhatsAppLink()
│   └── constants.ts               ← URLs, IDs, config
├── scripts/events.client.ts       ← eventos client-side (ViewContent, Contact…)
├── sections/FutureSimulator.astro ← quiz + captura lead → fbq Lead
└── pages/api/
    ├── leads.ts                   ← POST /api/leads
    ├── bella/chat.ts              ← POST /api/bella/chat (Vitória FAB)
    ├── zapi/webhook.ts            ← entrada WhatsApp Z-API
    └── payment/flowpay/webhook.ts ← callback PIX FlowPay
```

---

## Variáveis de ambiente (Railway)

| Var | Uso |
|-----|-----|
| `DATABASE_URL` | Postgres |
| `REDIS_URL` | Redis |
| `AZURE_OPENAI_API_KEY` | Bella IA |
| `AZURE_OPENAI_ENDPOINT` | Bella IA |
| `AZURE_OPENAI_DEPLOYMENT` | Bella IA |
| `PUBLIC_META_PIXEL_ID` | Pixel `1879889489292663` |
| `CAPI_ACCESS_TOKEN` | Meta Conversions API |
| `ZAPI_TOKEN` | Z-API (WhatsApp legado) |
| `ZAPI_INSTANCE_ID` | Z-API instância |
| `RESEND_API_KEY` | Email |
| `FLOWPAY_WEBHOOK_SECRET` | Segurança webhook PIX |

---

## Comandos

```bash
pnpm dev          # dev local (porta 4321)
pnpm build        # build de produção
pnpm preview      # preview do build
railway logs --tail   # logs em tempo real
railway variables     # verificar env vars
```

---

## Tracking Meta (resumo)

| Evento | Onde dispara |
|--------|-------------|
| `PageView` | Toda página (Pixel + CAPI) |
| `Lead` | FutureSimulator submit (Pixel + CAPI) |
| `Contact` | Qualquer clique em wa.me |
| `ViewContent` | Clique em card de curso |
| `InitiateCheckout` | Geração código DiscountTicket |
| `Schedule` | Botão WA na página /mapa |
| `Purchase` | ⏳ Pendente — webhook FlowPay |

UTM first-touch: capturado em `sessionStorage` no `BaseLayout.astro`, persiste no Postgres via `upsertLead`.
