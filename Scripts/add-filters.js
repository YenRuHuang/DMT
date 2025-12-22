const { google } = require('googleapis');

// 設定
const CREDENTIALS_PATH = '/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json';
const SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';
const SHEET_ID = 0; // 預設第一個工作表的 ID 通常為 0

async function addFilters() {
  try {
    console.log('🚀 開始新增篩選功能...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 先取得工作表資訊
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets(properties,basicFilter)'
    });

    const requests = [];

    // 如果已經有篩選，先清除
    const sheet = sheetInfo.data.sheets.find(s => s.properties.sheetId === SHEET_ID);
    if (sheet && sheet.basicFilter) {
      console.log('🔄 清除現有篩選...');
      requests.push({
        clearBasicFilter: {
          sheetId: SHEET_ID
        }
      });
    }

    // 新增篩選功能
    requests.push({
      setBasicFilter: {
        filter: {
          range: {
            sheetId: SHEET_ID,
            startRowIndex: 0,  // 從第一列開始（包含標題）
            startColumnIndex: 0,
            endColumnIndex: 12  // 到第12欄（備註欄）
          }
        }
      }
    });

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: { requests }
    });

    console.log('✅ 篩選功能已新增！');
    console.log('📌 現在您可以在標題列看到篩選圖示，點擊即可篩選：');
    console.log('   - 品牌：P電漿 / 精靈聚雙璇 / Hera');
    console.log('   - 類型：知識性 / 生活類 / 互動型...等');
    console.log('   - 格式：貼文 / 限動 / 短影音');
    console.log('   - 狀態：待辦 / 進行中 / 完成...等');
    console.log('   - 上架狀態：未上架 / 已排程 / 已上架');
    console.log(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);

  } catch (error) {
    console.error('❌ 新增篩選失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

addFilters();
