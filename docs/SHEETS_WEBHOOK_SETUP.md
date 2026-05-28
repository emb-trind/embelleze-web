<!-- markdownlint-disable MD013 -->

# Sheets Webhook Setup

Guia operacional para subir o sync Google Sheets -> `embelleze-web`.

## O Que Sobe Onde

- Railway `embelleze-web`:
  - `SHEETS_WEBHOOK_SECRET`
- Google Apps Script:
  - código de `docs/sheets-apps-script.js`
  - Script property `SHEETS_WEBHOOK_SECRET`
  - opcional: `WEBHOOK_URL`
  - opcional: `SHEET_NAME`

O valor de `SHEETS_WEBHOOK_SECRET` precisa ser igual nos dois lados.
Não commit passar esse valor para o Git.

## Railway

1; Abrir o serviço `embelleze-web`.
2; Ir em `Variables`.
3; Adicionar:

```text
SHEETS_WEBHOOK_SECRET=<string forte gerada pelo operador>
```

 4; Fazer redeploy do serviço se a Railway não reiniciar automaticamente.

## Google Sheets

1; Abrir a planilha oficial.
2; Ir em `Extensões` -> `Apps Script`.
3; Colar o conteúdo de `docs/sheets-apps-script.js`.
4; Ir em `Project Settings` -> `Script properties`.
5; Adicionar:

```text
SHEETS_WEBHOOK_SECRET=<mesmo valor do Railway>
```

6; Opcionalmente adicionar:

```text
WEBHOOK_URL=https://embelleze-web.up.railway.app/api/sheets/webhook
SHEET_NAME=TABELA CAMPANHA
```

Se `WEBHOOK_URL` ou `SHEET_NAME` não forem definidos, o script usa os
defaults do arquivo.

## Gatilhos

Criar gatilhos instaláveis, não usar `onEdit` simples.

1; Em Apps Script, abrir `Triggers`.
2; Criar:

```text
Function: syncOnEdit
Event source: From spreadsheet
Event type: On edit
```

3 Criar:

```text
Function: syncByTimer
Event source: Time-driven
Interval: Hour timer
```

## Smoke Test

1; No Apps Script, executar manualmente `syncSheet`.
2; Autorizar permissões quando o Google pedir.
3; Conferir o log:

```text
[WEBHOOK] status=200 body={"processed":...}
```

4; Se retornar `401`, o secret do Apps Script não bate com o secret da Railway.
5; Se retornar `404`, conferir `WEBHOOK_URL` e deploy do `embelleze-web`.
6; Se retornar `500`, verificar logs do Railway no serviço `embelleze-web`.

## Guardrails

- Não colocar secret no arquivo `docs/sheets-apps-script.js`.
- Não expor `.env` local.
- Não mover regra de negócio para a planilha.
- Não usar o dashboard como fonte de escrita.
- Não remover proteção do webhook; produção deve falhar fechada quando o
  secret estiver ausente.
- `/sw.js` não participa do sync do Google Sheets. O arquivo público existe
  apenas para limpar clientes antigos que ainda tentem atualizar um service
  worker herdado.
