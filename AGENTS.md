<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->

# AGENTS — embelleze-web

```text
========================================
   EMBELLEZE WEB · AGENTS
========================================
Escopo : embelleze-web/
Repo   : github.com/emb-trind/embelleze-web
Deploy : Railway
========================================
```

## Projeto

Backend funcional do ecossistema Embelleze.
Aqui vivem site, APIs de follow-up, webhooks e escrita de estado operacional.

## Dono de responsabilidades

- Follow-up state e eventos (email/whatsapp/sms)
- Dispatch de email via Resend
- Recebimento de webhook da Resend
- Integração com gateway WhatsApp

## Não pertence a este módulo

- Renderização do dashboard (fica em `embelleze-dashboard`)
- Transporte WhatsApp Baileys (fica em `neo-whatsapp-connect`)
- Interface de criação de webhook da Resend (console externo)

## Endpoints críticos

- `POST /api/followup/email-dispatch`
- `POST /api/followup/resend-webhook`
- `POST /api/whatsapp/webhook`
- `POST /api/sheets/webhook`

## Variáveis críticas

- `DATABASE_URL`
- `REDIS_URL`
- `RESEND_API_KEY`
- `FOLLOWUP_DISPATCH_SECRET`
- `RESEND_WEBHOOK_SECRET`
- `SHEETS_WEBHOOK_SECRET`

## Regras

- Não vazar secrets em logs
- Não mover regras de estado para dashboard
- Não acoplar web a arquivos locais para evento de produção
- Sync Google Sheets usa Apps Script com Script properties;
  ver `docs/SHEETS_WEBHOOK_SETUP.md`
