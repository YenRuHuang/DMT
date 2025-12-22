const { google } = require('googleapis');

// 設定
const CREDENTIALS_PATH = '/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json';
const SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';

async function recreateCleanSheet() {
  try {
    console.log('🚀 開始重建乾淨的工作表...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. 先讀取現有資料
    console.log('📖 讀取現有資料...');
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: '工作表1!A1:L100'
    });

    const data = currentData.data.values;
    console.log(`✅ 已讀取 ${data.length} 列資料`);

    // 2. 建立新的乾淨工作表
    console.log('🆕 建立新工作表...');
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: '進度追蹤_乾淨版',
              gridProperties: {
                rowCount: 100,
                columnCount: 12,
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    });

    const newSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
    console.log(`✅ 新工作表已建立 (ID: ${newSheetId})`);

    // 3. 寫入資料到新工作表
    console.log('✍️ 寫入資料到新工作表...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: '進度追蹤_乾淨版!A1',
      valueInputOption: 'RAW',
      resource: { values: data }
    });

    // 4. 設定標題列格式
    console.log('🎨 設定格式...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: newSheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat'
            }
          }
        ]
      }
    });

    console.log('✅ 完成！');
    console.log('📌 新工作表「進度追蹤_乾淨版」已建立');
    console.log('📌 這是完全乾淨的格式，沒有任何下拉選單');
    console.log('📌 您可以刪除舊的「工作表1」');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 重建失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

recreateCleanSheet();
