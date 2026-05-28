<!-- markdownlint-disable MD003 MD007 MD013 MD022 MD023 MD025 MD029 MD032 MD033 MD034 -->
# MEMORY

```text
========================================
   EMBELLEZE WEB · MEMORY
========================================
Escopo : embelleze-web/
Função : decisões para evitar regressão
========================================
```

## Decisões vigentes

- `embelleze-web` é dono do estado de follow-up.
- Dispatch de email usa `/api/followup/email-dispatch` com `FOLLOWUP_DISPATCH_SECRET`.
- Webhook da Resend entra por `/api/followup/resend-webhook` com `RESEND_WEBHOOK_SECRET`.
- `provider_message_id` precisa ser preservado para reconciliar eventos de entrega/abertura.
- Dashboard consome estado derivado; não deve implementar lógica paralela de atualização.
- URL de webhook da Resend é configurada no painel da Resend, não no `.env` da aplicação.
- OpenAI Ads Pixel é client-side: `PUBLIC_OPENAI_PIXEL_ID` pode ir ao browser e não é secret.
- `OPENAI_PIXEL_ID` sem prefixo público fica reservado para eventual medição server-side; token/API key de Conversions API nunca deve ser exposto.
- Funil OpenAI Ads atual: page view em `TrackingPixel.astro`, curso visto e clique WhatsApp em `events.client.ts`, conversão final em `/obrigado`.
- Planilha oficial operacional fica online no Google Sheets: `1Qs54aeCLBgt1yPU6_L9ZTx0vTLEvLVD0bimMFzhsUv0`.
- Snapshots locais de 2026-05-28 ficam fora da raiz, em pasta ignorada: `private/lead-snapshots/2026-05-28/`.
- Operação atual: atualização de cadastro e reenvio de mensagem para checar intenção; dashboard deve consumir estado/eventos por sync ou webhook, sem virar fonte de regra.
- Sync Google Sheets -> `embelleze-web` usa `POST /api/sheets/webhook`.
  O secret não fica no código: Railway usa `SHEETS_WEBHOOK_SECRET` e
  Apps Script usa Script property de mesmo nome. Guia:
  `docs/SHEETS_WEBHOOK_SETUP.md`.
- `/sw.js` existe só como cleanup para clientes antigos com service worker
  registrado. O app atual não usa cache/offline/push.

## Guardrails

- Sem logs com tokens, secrets ou payload completo sensível.
- Sem fallback que mascare erro estrutural de produção sem sinalizar.
- Não colocar secret do Sheets no `docs/sheets-apps-script.js`.

---

## Atualização 2026-05-26 (aditiva · sync)

- `scripts/sync-followup-data.py` passou a priorizar Postgres (`followup_events`) como fonte oficial de eventos.
- `jsonl` local permanece somente como fallback de contingência (offline/sem conectividade).
- Validação operacional concluída: `events_source=postgres`, `events_found=3`, `events_applied=3`.
