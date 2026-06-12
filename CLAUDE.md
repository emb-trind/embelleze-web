# CLAUDE.md — embelleze-web

```text
========================================
   EMBELLEZE-WEB · Site + API Core
========================================
Serviço  : embelleze-bella.online
Tipo     : Astro SSR (Node)
Repo     : github.com/emb-trind/embelleze-web
========================================
```

## Escopo

Módulo central de backend e integração.
Quando houver conflito de "quem grava estado", o `embelleze-web` é a referência.

## Stack

- Astro SSR
- Postgres (`DATABASE_URL`)
- Redis (`REDIS_URL`)
- Resend (`RESEND_API_KEY`)
- Azure OpenAI

## Convenções TypeScript

`tsconfig.json` segue o padrão workspace — ver raiz `CLAUDE.md` → *Convenções de Configuração*.
Este módulo usa `baseUrl` + path alias `@/*`, por isso inclui `ignoreDeprecations: "6.0"`.
Targets Makefile canônicos: `dev` · `build` · `check` · `clean` · `install`.

## Fluxo follow-up/email

1. Geração de fila de dispatch (pipeline local)
2. `POST /api/followup/email-dispatch` envia emails e registra `provider_message_id`
3. Resend envia eventos para `POST /api/followup/resend-webhook`
4. Webhook atualiza eventos/estado de email
5. Dashboard consome estado atualizado (leitura)

## Fluxo de Checkout & Probeltec & Meta CAPI

1. SDR envia link da UseRede -> Status muda para `CHECKOUT_ENVIADO`
2. Vendedora faz verificação humana e dá baixa no CRM Probeltec como `Matriculado`
3. Robô vigilante (`/api/probeltec/sync`) via CRON percebe mudança na Probeltec
4. `sync.ts` evolui status para `CHECKOUT_PAGO` (Matrícula)
5. O trigger local em `db.ts` dispara o envio Server-side (Deduplicado) do evento `Purchase` para a Meta CAPI

## Variáveis de ambiente principais

- `DATABASE_URL`
- `REDIS_URL`
- `RESEND_API_KEY`
- `FOLLOWUP_DISPATCH_SECRET`
- `RESEND_WEBHOOK_SECRET`
- `AZURE_OPENAI_*`
- `WHATSAPP_GATEWAY_*`
- `PROBELTEC_API_URL`
- `PROBELTEC_API_TOKEN`
- `CRON_SECRET`
- `CAPI_ACCESS_TOKEN`
- `PUBLIC_META_PIXEL_ID`

## Nota importante

URL do webhook da Resend não precisa ser variável no app.
Ela é configurada no painel da Resend apontando para:
`https://embelleze-bella.online/api/followup/resend-webhook`
