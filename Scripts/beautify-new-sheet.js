const { google } = require('googleapis');

// 設定
const CREDENTIALS_PATH = '/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json';
const SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';
const NEW_SHEET_ID = 206607254; // 新工作表的 ID

async function beautifyNewSheet() {
  try {
    console.log('🚀 開始美化新工作表...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const requests = [
      // 1. 設定欄寬
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 60 }, fields: 'pixelSize' } }, // 週次
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } }, // 日期
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 120 }, fields: 'pixelSize' } }, // 品牌
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } }, // 類型
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 80 }, fields: 'pixelSize' } }, // 格式
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 350 }, fields: 'pixelSize' } }, // 主題
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 90 }, fields: 'pixelSize' } }, // 狀態
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'COLUMNS', startIndex: 7, endIndex: 11 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } }, // 連結欄位

      // 2. 設定列高
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 40 }, fields: 'pixelSize' } }, // 標題列
      { updateDimensionProperties: { range: { sheetId: NEW_SHEET_ID, dimension: 'ROWS', startIndex: 1, endIndex: 100 }, properties: { pixelSize: 30 }, fields: 'pixelSize' } }, // 資料列

      // 3. 標題列格式（深色背景）
      {
        repeatCell: {
          range: { sheetId: NEW_SHEET_ID, startRowIndex: 0, endRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat'
        }
      },

      // 4. 資料列格式（自動換行、垂直置中）
      {
        repeatCell: {
          range: { sheetId: NEW_SHEET_ID, startRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              wrapStrategy: 'WRAP',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)'
        }
      },

      // 5. 交替列顏色（斑馬紋）
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [{ sheetId: NEW_SHEET_ID, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 }],
            booleanRule: {
              condition: {
                type: 'CUSTOM_FORMULA',
                values: [{ userEnteredValue: '=MOD(ROW(),2)=0' }]
              },
              format: {
                backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 }
              }
            }
          },
          index: 0
        }
      },

      // 6. 加入篩選功能（只在標題列）
      {
        setBasicFilter: {
          filter: {
            range: {
              sheetId: NEW_SHEET_ID,
              startRowIndex: 0,
              startColumnIndex: 0,
              endColumnIndex: 12
            }
          }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { requests }
    });

    console.log('✅ 美化完成！');
    console.log('📌 已設定：');
    console.log('   - 欄寬與列高優化');
    console.log('   - 標題列深色背景');
    console.log('   - 交替列顏色（斑馬紋）');
    console.log('   - 篩選功能（標題列有 ▼ 圖示）');
    console.log('   - 自動換行與垂直置中');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 美化失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

beautifyNewSheet();
