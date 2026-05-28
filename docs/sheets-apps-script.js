// ============================================================
//  Apps Script — Embelleze Sheets → embelleze-web webhook
//  Colar em: Extensões → Apps Script na planilha oficial
//  Guia de subida: docs/SHEETS_WEBHOOK_SETUP.md
// ============================================================

const DEFAULT_WEBHOOK_URL = 'https://embelleze-web.up.railway.app/api/sheets/webhook';
const DEFAULT_SHEET_NAME = 'TABELA CAMPANHA';

// Configurar em Apps Script > Project Settings > Script properties:
// WEBHOOK_URL: opcional; usa DEFAULT_WEBHOOK_URL se vazio
// SHEET_NAME: opcional; usa DEFAULT_SHEET_NAME se vazio
// SHEETS_WEBHOOK_SECRET: obrigatório; mesmo valor configurado no Railway
function getConfig_() {
  const props = PropertiesService.getScriptProperties();
  const webhookUrl = props.getProperty('WEBHOOK_URL') || DEFAULT_WEBHOOK_URL;
  const webhookSecret = props.getProperty('SHEETS_WEBHOOK_SECRET');
  const sheetName = props.getProperty('SHEET_NAME') || DEFAULT_SHEET_NAME;

  if (!webhookSecret) {
    throw new Error('Script property SHEETS_WEBHOOK_SECRET não configurada.');
  }

  return { webhookUrl, webhookSecret, sheetName };
}

// Criar gatilho instalável: syncOnEdit -> From spreadsheet -> On edit
function syncOnEdit(e) {
  if (!e || !e.source) return;
  const { sheetName } = getConfig_();
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== sheetName) return;
  syncSheet();
}

// Criar gatilho instalável: syncByTimer -> Time-driven -> A cada hora
function syncByTimer() {
  syncSheet();
}

function syncSheet() {
  const { webhookUrl, webhookSecret, sheetName } = getConfig_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('Aba "' + sheetName + '" não encontrada.');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const dataRows = data.slice(1); // pula header

  // Monta array de { values: string[] } para cada linha com telefone
  const rows = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    // Índice 3 = coluna Telefone
    const phone = String(row[3] || '').replace(/\D/g, '');
    if (phone.length < 8) continue;
    rows.push({ values: row.map(String) });
  }

  if (rows.length === 0) {
    Logger.log('Nenhuma linha com telefone válido.');
    return;
  }

  const options = {
    method      : 'POST',
    contentType : 'application/json',
    headers     : { 'x-sheets-secret': webhookSecret },
    payload     : JSON.stringify(rows),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(webhookUrl, options);
  const code = response.getResponseCode();
  const body = response.getContentText();

  Logger.log('[WEBHOOK] status=' + code + ' body=' + body);
}
