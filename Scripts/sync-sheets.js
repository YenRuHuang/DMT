const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 使用共享設定模組
const config = require('./config');
const { CREDENTIALS_PATH, SPREADSHEET_ID, MARKDOWN_FILE_PATH, SHEET_NAME } = config;

async function syncSheets() {
  try {
    console.log('🚀 開始同步...');

    // 1. 讀取 Markdown 檔案
    console.log(`📖 讀取檔案: ${MARKDOWN_FILE_PATH}`);
    const content = fs.readFileSync(MARKDOWN_FILE_PATH, 'utf8');

    // 2. 解析 Markdown 表格
    console.log('🔍 解析表格資料...');
    const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/;
    const match = content.match(tableRegex);

    if (!match) {
      throw new Error('找不到 Markdown 表格！請確認 Master_Command_Center.md 格式正確。');
    }

    const headerLine = match[1];
    const bodyLines = match[2].trim().split('\n');

    // 處理標頭
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);

    // 處理內容
    const rows = bodyLines.map(line => {
      return line.split('|')
        .map(cell => cell.trim())
        .filter((cell, index, arr) => index > 0 && index < arr.length - 1); // 移除前後空的分割
    });

    const data = [headers, ...rows];
    console.log(`📊 解析完成，共 ${rows.length} 筆資料`);

    // 3. 連接 Google Sheets API
    console.log('☁️ 連接 Google Sheets...');
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 4. 清空並寫入資料
    console.log('✍️ 寫入 Google Sheets...');

    // 先清空舊資料
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });

    // 寫入新資料
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values: data,
      },
    });

    console.log(`✅ 同步成功！已更新 ${response.data.updatedCells} 個儲存格。`);
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

syncSheets();
