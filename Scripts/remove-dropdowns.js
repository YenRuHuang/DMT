const { google } = require('googleapis');

// 設定
const CREDENTIALS_PATH = '/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json';
const SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';
const SHEET_ID = 0;

async function removeDataValidation() {
  try {
    console.log('🚀 開始移除資料驗證（下拉選單）...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const requests = [
      // 清除品牌欄 (C) 的資料驗證
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 2, endColumnIndex: 3 },
          rule: null
        }
      },
      // 清除類型欄 (D) 的資料驗證
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 },
          rule: null
        }
      },
      // 清除格式欄 (E) 的資料驗證
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 4, endColumnIndex: 5 },
          rule: null
        }
      },
      // 清除狀態欄 (G) 的資料驗證
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 6, endColumnIndex: 7 },
          rule: null
        }
      },
      // 清除上架狀態欄 (J) 的資料驗證
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 },
          rule: null
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { requests }
    });

    console.log('✅ 已移除所有資料列的下拉選單！');
    console.log('📌 現在只有第一行（標題列）有篩選功能 ▼');
    console.log('📌 資料列可以自由輸入，不會再有下拉選單干擾');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 移除失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

removeDataValidation();
