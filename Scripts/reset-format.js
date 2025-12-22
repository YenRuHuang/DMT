const { google } = require('googleapis');

// 設定
const CREDENTIALS_PATH = '/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json';
const SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';
const SHEET_ID = 0;

async function resetToSimpleFormat() {
  try {
    console.log('🚀 開始重置表格格式...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const requests = [
      // 1. 清除所有篩選
      {
        clearBasicFilter: {
          sheetId: SHEET_ID
        }
      },
      // 2. 清除所有資料驗證
      {
        setDataValidation: {
          range: {
            sheetId: SHEET_ID,
            startRowIndex: 0,
            startColumnIndex: 0,
            endRowIndex: 100,
            endColumnIndex: 12
          },
          rule: null
        }
      },
      // 3. 保留基本格式：標題列樣式
      {
        repeatCell: {
          range: { sheetId: SHEET_ID, startRowIndex: 0, endRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      },
      // 4. 凍結第一列
      {
        updateSheetProperties: {
          properties: {
            sheetId: SHEET_ID,
            gridProperties: { frozenRowCount: 1 }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { requests }
    });

    console.log('✅ 表格格式已重置！');
    console.log('📌 現在是簡單的表格格式，沒有下拉選單和篩選器');
    console.log('📌 我可以隨時自動更新內容');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 重置失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

resetToSimpleFormat();
