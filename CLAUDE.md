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

## Fluxo follow-up/email

1. Geração de fila de dispatch (pipeline local)
2. `POST /api/followup/email-dispatch` envia emails e registra `provider_message_id`
3. Resend envia eventos para `POST /api/followup/resend-webhook`
4. Webhook atualiza eventos/estado de email
5. Dashboard consome estado atualizado (leitura)

## Variáveis de ambiente principais

- `DATABASE_URL`
- `REDIS_URL`
- `RESEND_API_KEY`
- `FOLLOWUP_DISPATCH_SECRET`
- `RESEND_WEBHOOK_SECRET`
- `AZURE_OPENAI_*`
- `WHATSAPP_GATEWAY_*`

## Nota importante

URL do webhook da Resend não precisa ser variável no app.
Ela é configurada no painel da Resend apontando para:
`https://embelleze-bella.online/api/followup/resend-webhook`
