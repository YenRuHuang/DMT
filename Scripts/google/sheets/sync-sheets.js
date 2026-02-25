'use strict';

/**
 * sync-sheets.js
 * 從當月 Markdown 企劃文件讀取排程表，同步至 Google Sheets。
 *
 * 用法：node Scripts/google/sheets/sync-sheets.js
 *       npm run sync:sheets
 */

const fs = require('fs');
const config = require('../../config');
const { getSheetsClient } = require('../../utils');

// ── 欄位索引常數（對應 Markdown 表格欄位順序）───────────────
const COL = {
  WEEK: 0,            // A 週次
  DATE: 1,            // B 日期
  BRAND: 2,           // C 品牌
  TYPE: 3,            // D 類型
  FORMAT: 4,          // E 格式
  TOPIC: 5,           // F 主題
  MECHANISM: 6,       // G 機制/切角
  STATUS_CONTENT: 7,  // H 內容狀態
  STATUS_CLIENT: 8,   // I 客戶審核
  STATUS_UPLOAD: 9,   // J 上架狀態
  TOTAL: 12,          // 篩選器 / 條件格式的終止欄
};

// ── 類型正規化對照表（Markdown 簡稱 → Sheets 下拉選單值）──
const TYPE_MAP = {
  '生活': '生活類',
  '知識': '知識性',
  '互動': '互動型',
  '氛圍': '氛圍感',
  '炫技': 'AI/動畫',
  '技術': 'AI/動畫',
  '情境': '氛圍感',
  '形象': '行銷類',
};

// ═══════════════════════════════════════════════════════════
// 1. 讀取 Markdown 檔案
// ═══════════════════════════════════════════════════════════
function readMarkdown(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`找不到企劃文件: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

// ═══════════════════════════════════════════════════════════
// 2. 解析 Markdown 排程表 → { headers, rows }
// ═══════════════════════════════════════════════════════════
function parseMarkdownTable(content) {
  const tableRegex = /\|\s*週次\s*\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/;
  const match = content.match(tableRegex);
  if (!match) {
    throw new Error('找不到內容排程表！請確認 Markdown 中包含「週次 | 日期 | 品牌」表頭。');
  }

  const headerLine = '週次 |' + match[1];
  const bodyLines = match[2].trim().split('\n');

  const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);

  const rows = bodyLines.map(line => {
    return line
      .split('|')
      .map((cell, colIndex) => {
        let text = cell.trim()
          .replace(/\*\*/g, '')              // 移除 Markdown 粗體 **
          .replace(/^['"](.*)['"]$/, '$1');  // 移除前後引號

        // split('|') 後第 0 個是空字串，所以 colIndex = COL.X + 1
        if (colIndex === COL.TYPE + 1) {
          text = TYPE_MAP[text] ?? text;
        }
        if (colIndex === COL.FORMAT + 1) {
          text = text.replace(/\(\d+\)/g, '').trim(); // 移除括號數字 "貼文(1)" → "貼文"
        }
        return text;
      })
      .filter((_, index, arr) => index > 0 && index < arr.length - 1);
  });

  return { headers, rows };
}

// ═══════════════════════════════════════════════════════════
// 3. 確保目標分頁存在（不存在則自動建立）
// ═══════════════════════════════════════════════════════════
async function getOrCreateSheet(sheets, spreadsheetId, sheetTitle) {
  const docInfo = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = docInfo.data.sheets.some(s => s.properties.title === sheetTitle);

  if (!exists) {
    console.log(`📄 找不到分頁「${sheetTitle}」，正在建立...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
    });
    console.log(`✅ 分頁「${sheetTitle}」已建立`);
  }
}

// ═══════════════════════════════════════════════════════════
// 4. 清空並寫入資料，回傳更新的儲存格數
// ═══════════════════════════════════════════════════════════
async function writeSheetData(sheets, spreadsheetId, sheetTitle, data) {
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: sheetTitle });

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitle}!A1`,
    valueInputOption: 'RAW',
    resource: { values: data },
  });

  return response.data.updatedCells;
}

// ═══════════════════════════════════════════════════════════
// 5. 取得含格式資訊的分頁物件
// ═══════════════════════════════════════════════════════════
async function fetchSheetWithFormats(sheets, spreadsheetId, sheetTitle) {
  const docInfo = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties,conditionalFormats,bandedRanges)',
  });
  return docInfo.data.sheets.find(s => s.properties.title === sheetTitle);
}

// ═══════════════════════════════════════════════════════════
// 6. 建立完整的格式化 batchUpdate requests
// ═══════════════════════════════════════════════════════════
function buildFormatRequests(sheetId, targetSheet) {
  const cleanupRequests = [
    // 清除舊斑馬紋
    ...(targetSheet.bandedRanges ?? []).map(b => ({
      deleteBanding: { bandedRangeId: b.bandedRangeId },
    })),
    // 清除舊條件格式（從 index 0 連續刪 N 次）
    ...(targetSheet.conditionalFormats ?? []).map(() => ({
      deleteConditionalFormatRule: { sheetId, index: 0 },
    })),
  ];

  const formatRequests = [
    // (1) 凍結第一列
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },
    // (2) 標題列樣式（深灰底 / 白字 / 置中 / 粗體）
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    },
    // (3) 內容列樣式（自動換行 / 垂直置中）
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1 },
        cell: { userEnteredFormat: { wrapStrategy: 'WRAP', verticalAlignment: 'MIDDLE' } },
        fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)',
      },
    },
    // (4) 行高 32px
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: 1 },
        properties: { pixelSize: 32 },
        fields: 'pixelSize',
      },
    },
    // (5) 欄寬
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: COL.WEEK, endIndex: COL.WEEK + 1 }, properties: { pixelSize: 50 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: COL.DATE, endIndex: COL.DATE + 1 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: COL.TOPIC, endIndex: COL.TOPIC + 1 }, properties: { pixelSize: 500 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: COL.MECHANISM, endIndex: COL.MECHANISM + 1 }, properties: { pixelSize: 400 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: COL.STATUS_CONTENT, endIndex: COL.STATUS_UPLOAD + 1 }, properties: { pixelSize: 120 }, fields: 'pixelSize' } },
    // (6) 篩選器
    {
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: COL.TOTAL } },
      },
    },
    // (7) 下拉選單
    { setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: COL.BRAND, endColumnIndex: COL.BRAND + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['Neuramis', 'Cooltech', 'LPG'].map(v => ({ userEnteredValue: v })) }, showCustomUi: true, strict: false } } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: COL.TYPE, endColumnIndex: COL.TYPE + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['生活類', '知識性', '行銷類', '互動型', '氛圍感', 'AI/動畫', '賦能', '硬核', '比對', '炫技', '權威', '時機', '心理', '價值', '話題', '痛點', '效果', '視覺', '趨勢', '再製'].map(v => ({ userEnteredValue: v })) }, showCustomUi: true, strict: false } } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: COL.FORMAT, endColumnIndex: COL.FORMAT + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['貼文', '限動', '短影音'].map(v => ({ userEnteredValue: v })) }, showCustomUi: true, strict: false } } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: COL.STATUS_CONTENT, endColumnIndex: COL.STATUS_CONTENT + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['待製作', '製作中', '內容完成'].map(v => ({ userEnteredValue: v })) }, showCustomUi: true, strict: false } } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: COL.STATUS_CLIENT, endColumnIndex: COL.STATUS_CLIENT + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['待審核', '修改中', '客戶確認完成'].map(v => ({ userEnteredValue: v })) }, showCustomUi: true, strict: false } } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, startColumnIndex: COL.STATUS_UPLOAD, endColumnIndex: COL.STATUS_UPLOAD + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: ['未上架', '已排程', '已上架'].map(v => ({ userEnteredValue: v })) }, showCustomUi: true, strict: false } } },
    // (8) 條件格式（index: 0 表示最高優先，後加入者會推擠前者）
    // 短影音 → 淡粉
    { addConditionalFormatRule: { rule: { ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: COL.TOTAL }], booleanRule: { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$E2="短影音"' }] }, format: { backgroundColor: { red: 1, green: 0.9, blue: 0.9 } } } }, index: 0 } },
    // 限動 → 淡黃
    { addConditionalFormatRule: { rule: { ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: COL.TOTAL }], booleanRule: { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$E2="限動"' }] }, format: { backgroundColor: { red: 1, green: 0.98, blue: 0.9 } } } }, index: 0 } },
    // 貼文 → 淡藍
    { addConditionalFormatRule: { rule: { ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: COL.TOTAL }], booleanRule: { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$E2="貼文"' }] }, format: { backgroundColor: { red: 0.9, green: 0.95, blue: 1 } } } }, index: 0 } },
    // 再製 → 淡紫（最高優先，覆蓋格式色）
    { addConditionalFormatRule: { rule: { ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: COL.TOTAL }], booleanRule: { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=$D2="再製"' }] }, format: { backgroundColor: { red: 0.9, green: 0.85, blue: 0.95 }, textFormat: { bold: true, foregroundColor: { red: 0.2, green: 0, blue: 0.4 } } } } }, index: 0 } },
  ];

  return [...cleanupRequests, ...formatRequests];
}

// ═══════════════════════════════════════════════════════════
// 主函式（Orchestrator）
// ═══════════════════════════════════════════════════════════
async function syncSheets() {
  try {
    console.log('🚀 開始同步...');

    // 1. 讀取與解析 Markdown 企劃文件
    console.log(`📖 讀取檔案: ${config.MARKDOWN_FILE_PATH}`);
    const content = readMarkdown(config.MARKDOWN_FILE_PATH);

    console.log('🔍 解析表格資料...');
    const { headers, rows } = parseMarkdownTable(content);
    console.log(`📊 解析完成，共 ${rows.length} 筆資料`);

    // 2. 連接 Google Sheets
    console.log('☁️ 連接 Google Sheets...');
    const sheets = await getSheetsClient();

    // 3. 確保目標分頁存在
    const sheetTitle = config.SHEET_NAME;
    console.log(`🔍 檢查分頁: ${sheetTitle}`);
    await getOrCreateSheet(sheets, config.SPREADSHEET_ID, sheetTitle);

    // 4. 寫入資料
    console.log(`✍️ 寫入 Google Sheets (${sheetTitle})...`);
    const updatedCells = await writeSheetData(sheets, config.SPREADSHEET_ID, sheetTitle, [headers, ...rows]);
    console.log(`✅ 同步成功！已更新 ${updatedCells} 個儲存格。`);

    // 5. 套用格式化
    console.log(`✨ 正在美化表格 (${sheetTitle})...`);
    const targetSheet = await fetchSheetWithFormats(sheets, config.SPREADSHEET_ID, sheetTitle);

    if (targetSheet) {
      const requests = buildFormatRequests(targetSheet.properties.sheetId, targetSheet);
      const batchResult = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.SPREADSHEET_ID,
        resource: { requests },
      });
      if (!batchResult.data) {
        console.warn('⚠️ batchUpdate 未回傳預期資料，請手動確認格式是否套用。');
      }
      console.log('✨ 表格美化完成！（行高、對齊、欄寬、篩選器、下拉選單、條件格式）');
    } else {
      console.warn(`⚠️ 找不到分頁「${sheetTitle}」的格式資訊，跳過美化。`);
    }

    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${config.SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

syncSheets().catch(err => {
  console.error('❌ 未預期錯誤:', err.message);
  process.exit(1);
});
