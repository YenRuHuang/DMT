const { google } = require('googleapis');
const config = require('../../config');

// 設定
const CREDENTIALS_PATH = config.CREDENTIALS_PATH;
const SPREADSHEET_ID = config.SPREADSHEET_ID;
const NEW_SHEET_ID = 206607254;

async function addStatusDropdowns() {
  try {
    console.log('🚀 開始新增狀態下拉選單...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const requests = [
      // 狀態欄 (G, index 6) 的下拉選單
      {
        setDataValidation: {
          range: { sheetId: NEW_SHEET_ID, startRowIndex: 1, startColumnIndex: 6, endColumnIndex: 7 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '待辦' },
                { userEnteredValue: '進行中' },
                { userEnteredValue: '待審核' },
                { userEnteredValue: '修改中' },
                { userEnteredValue: '完成' }
              ]
            },
            showCustomUi: true,
            strict: false
          }
        }
      },
      // 上架狀態欄 (J, index 9) 的下拉選單
      {
        setDataValidation: {
          range: { sheetId: NEW_SHEET_ID, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: '未上架' },
                { userEnteredValue: '已排程' },
                { userEnteredValue: '已上架' }
              ]
            },
            showCustomUi: true,
            strict: false
          }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { requests }
    });

    console.log('✅ 下拉選單已新增！');
    console.log('📌 「狀態」欄位：待辦 / 進行中 / 待審核 / 修改中 / 完成');
    console.log('📌 「上架狀態」欄位：未上架 / 已排程 / 已上架');
    console.log('📌 其他欄位保持乾淨，可以自由輸入');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 新增失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

addStatusDropdowns();
