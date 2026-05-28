<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# CONTEXT

```text
========================================
   EMBELLEZE WEB · CONTEXT
========================================
Escopo : embelleze-web/
========================================
```

## Objetivo atual

Ser o núcleo de estado operacional de captação e follow-up:
- recebe dados
- normaliza
- persiste
- integra canais

## Fronteiras

- Dashboard: visualização, sem escrita de regra de negócio
- Neo WhatsApp Connect: transporte de mensagens
- Resend: provedor externo de entrega de email

## Estado crítico

- Eventos de email devem ser tratados por webhook (`resend-webhook`)
- Estado não deve depender de arquivo local em produção
- Alterações de taxonomia (status/origem/mídia) devem manter compatibilidade com dashboard PT-BR
- Tráfego OpenAI Ads é atribuição paga: anúncio no ChatGPT leva ao site, pixel mede navegação/conversão e Bella assume somente após ação do usuário no funil.
- `PUBLIC_OPENAI_PIXEL_ID` é identificador público de pixel; segredos de medição server-side continuam proibidos no cliente.
- Tabela oficial de operação/cadastro é o Google Sheets compartilhado; CSVs locais são snapshots auditáveis, não fonte definitiva depois de exportados.
- Conexão com `embelleze-dashboard` deve ser latente por leitura/sync ou webhook de eventos, mantendo escrita operacional no `embelleze-web`.
- Sync Google Sheets -> Postgres entra por `POST /api/sheets/webhook`,
  autenticado por `SHEETS_WEBHOOK_SECRET`; instruções de subida em
  `docs/SHEETS_WEBHOOK_SETUP.md`.
- `/sw.js` é apenas cleanup de service worker antigo; não há estratégia PWA
  ativa de cache/offline no app atual.
