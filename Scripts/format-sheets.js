const { google } = require('googleapis');

// 設定
const CREDENTIALS_PATH = '/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json';
const SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';
const SHEET_ID = 0; // 預設第一個工作表的 ID 通常為 0

async function formatSheets() {
  try {
    console.log('🚀 開始美化表格...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const requests = [
      // 1. 修改試算表標題
      {
        updateSpreadsheetProperties: {
          properties: { title: '2025_12_曜亞X默默的社群經營' },
          fields: 'title'
        }
      },
      // 2. 設定凍結窗格 (凍結第一列)
      {
        updateSheetProperties: {
          properties: {
            sheetId: SHEET_ID,
            gridProperties: { frozenRowCount: 1 }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      },
      // 3. 設定欄寬
      {
        updateDimensionProperties: {
          range: { sheetId: SHEET_ID, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, // 週次
          properties: { pixelSize: 50 },
          fields: 'pixelSize'
        }
      },
      {
        updateDimensionProperties: {
          range: { sheetId: SHEET_ID, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, // 日期
          properties: { pixelSize: 100 },
          fields: 'pixelSize'
        }
      },
      {
        updateDimensionProperties: {
          range: { sheetId: SHEET_ID, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, // 品牌
          properties: { pixelSize: 120 },
          fields: 'pixelSize'
        }
      },
      {
        updateDimensionProperties: {
          range: { sheetId: SHEET_ID, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, // 主題 (加寬)
          properties: { pixelSize: 300 },
          fields: 'pixelSize'
        }
      },
      {
        updateDimensionProperties: {
          range: { sheetId: SHEET_ID, dimension: 'COLUMNS', startIndex: 7, endIndex: 11 }, // 連結與回饋
          properties: { pixelSize: 200 },
          fields: 'pixelSize'
        }
      },
      // 4. 設定標題列樣式 (深色背景、白字、置中、粗體)
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
      // 5. 設定內容列樣式 (自動換行、垂直置中)
      {
        repeatCell: {
          range: { sheetId: SHEET_ID, startRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              wrapStrategy: 'WRAP',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)'
        }
      },
      // 6. 加入下拉式選單 (Data Validation)
      // 品牌 (Col C / Index 2)
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'P電漿' }, { userEnteredValue: '精靈聚雙璇' }, { userEnteredValue: 'Hera' }] },
            showCustomUi: true
          }
        }
      },
      // 類型 (Col D / Index 3)
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST', values: [
                { userEnteredValue: '生活類' },
                { userEnteredValue: '知識性' },
                { userEnteredValue: '行銷類' },
                { userEnteredValue: '互動型' },
                { userEnteredValue: '氛圍感' },
                { userEnteredValue: 'AI/動畫' }
              ]
            },
            showCustomUi: true
          }
        }
      },
      // 格式 (Col E / Index 4)
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 4, endColumnIndex: 5 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: '貼文' }, { userEnteredValue: '限動' }, { userEnteredValue: '短影音' }] },
            showCustomUi: true
          }
        }
      },
      // 狀態 (Col G / Index 6)
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 6, endColumnIndex: 7 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST', values: [
                { userEnteredValue: '待辦' },
                { userEnteredValue: '進行中' },
                { userEnteredValue: '待審核' },
                { userEnteredValue: '修改中' },
                { userEnteredValue: '完成' }
              ]
            },
            showCustomUi: true
          }
        }
      },
      // 上架狀態 (Col J / Index 9)
      {
        setDataValidation: {
          range: { sheetId: SHEET_ID, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST', values: [
                { userEnteredValue: '未上架' },
                { userEnteredValue: '已排程' },
                { userEnteredValue: '已上架' }
              ]
            },
            showCustomUi: true
          }
        }
      }
    ];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { requests }
    });

    console.log('✅ 表格美化完成！');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 美化失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

formatSheets();
