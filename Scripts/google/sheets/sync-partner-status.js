const { google } = require('googleapis');
const config = require('../../config');

const PARTNER_SPREADSHEET_ID = '1-3OrOhG0KJ7Q5dIgfTLFcyd2H0jnFLSc8oE-JZov-bE';
const PARTNER_SHEET_NAME = '工作表4';

async function syncPartnerStatus() {
  try {
    console.log('🚀 開始同步合作夥伴狀態 (判斷背景色)...');

    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. 讀取合作夥伴表格數據 (含格式)
    console.log(`📖 讀取來源表格: ${PARTNER_SHEET_NAME}...`);
    // Read grid data to verify colors
    const partnerResp = await sheets.spreadsheets.get({
      spreadsheetId: PARTNER_SPREADSHEET_ID,
      includeGridData: true,
      ranges: [`${PARTNER_SHEET_NAME}!A:H`], // Read cols A to H
    });

    const partnerSheet = partnerResp.data.sheets[0];
    const partnerRows = partnerSheet.data[0].rowData;

    if (!partnerRows || partnerRows.length < 2) {
      console.log('⚠️ 來源表格為空或無數據。');
      return;
    }

    // 2. 準備來源數據 Map (Date + Brand -> Status)
    const completedItems = new Set();

    partnerRows.forEach((row, index) => {
      if (index === 0) return; // Skip Header
      if (!row.values) return;

      const checkboxCell = row.values[0];
      const dateCell = row.values[4]; // Col E (Index 4)
      const brandCell = row.values[5]; // Col F (Index 5)

      // Get Values
      const dateVal = dateCell?.formattedValue || '';
      const brandVal = brandCell?.formattedValue || '';

      if (!dateVal || !brandVal) return;

      // Check Status based on Background Color
      let isCompleted = false;

      const isRed = (color) => {
        return color && color.red === 1 && (color.green || 0) === 0 && (color.blue || 0) === 0;
      };

      const isYellow = (color) => {
        return color && color.red === 1 && color.green === 1 && (color.blue || 0) === 0;
      };

      // Check Checkbox Cell Color (Col A) - Expect Red (1, 0, 0)
      if (checkboxCell?.effectiveFormat?.backgroundColor) {
        if (isRed(checkboxCell.effectiveFormat.backgroundColor)) {
          isCompleted = true;
        }
      }

      // Check Content Cell Color (e.g., Brand Col F) - Expect Yellow (1, 1, 0)
      if (!isCompleted && brandCell?.effectiveFormat?.backgroundColor) {
        if (isYellow(brandCell.effectiveFormat.backgroundColor)) {
          isCompleted = true;
        }
      }

      if (isCompleted) {
        // Create unique key: "01/15 (三)_Neuramis"
        const key = `${dateVal}_${brandVal}`;
        completedItems.add(key);
      }
    });

    console.log(`✅ 檢測到 ${completedItems.size} 筆「已完成」項目 (紅/黃底色)。`);

    // 3. 讀取主要表格數據 (Jan & Feb) & 更新
    const TARGET_SHEETS = ['2026_01_排程', '2026_02_排程'];

    for (const sheetName of TARGET_SHEETS) {
      console.log(`🔍 檢查目標分頁: ${sheetName}...`);

      try {
        const targetResp = await sheets.spreadsheets.values.get({
          spreadsheetId: config.SPREADSHEET_ID,
          range: `${sheetName}!A:H`, // Read up to Status column (Col H / Index 7)
        });

        const targetRows = targetResp.data.values;
        if (!targetRows) continue;

        const updates = [];

        // Loop through target rows (skip header)
        for (let i = 1; i < targetRows.length; i++) {
          const targetRow = targetRows[i];
          const tDate = targetRow[1]; // Col B
          const tBrand = targetRow[2]; // Col C
          const currentStatus = targetRow[6];

          const key = `${tDate}_${tBrand}`;

          // If in completedItems set and content status is NOT '內容完成'
          if (completedItems.has(key) && currentStatus !== '內容完成') {
            console.log(`🔄 更新: ${tDate} ${tBrand} -> 內容完成`);
            updates.push({
              range: `${sheetName}!H${i + 1}`,
              values: [['內容完成']]
            });
          }
        }

        // 4. 執行批量更新
        if (updates.length > 0) {
          console.log(`✍️ 正在更新 ${updates.length} 筆資料到 ${sheetName}...`);
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: config.SPREADSHEET_ID,
            resource: {
              data: updates,
              valueInputOption: 'RAW'
            }
          });
        } else {
          console.log(`✨ ${sheetName} 無需更新。`);
        }

      } catch (err) {
        console.warn(`跳過分頁 ${sheetName}: ${err.message}`);
      }
    }

    console.log('✅ 同步完成！');

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
  }
}

syncPartnerStatus();
