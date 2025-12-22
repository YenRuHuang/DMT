/**
 * 新增篩選功能腳本
 * 為指定工作表的第一列新增篩選器
 */

const config = require('./config');
const { getSheetsClient, runScript, logger } = require('./utils');

async function addFilters() {
  logger.info('🚀 開始新增篩選功能...');

  const sheets = await getSheetsClient();
  const { SPREADSHEET_ID, DEFAULT_SHEET_ID } = config;

  // 先取得工作表資訊
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets(properties,basicFilter)'
  });

  const requests = [];

  // 如果已經有篩選，先清除
  const sheet = sheetInfo.data.sheets.find(s => s.properties.sheetId === DEFAULT_SHEET_ID);
  if (sheet && sheet.basicFilter) {
    logger.info('🔄 清除現有篩選...');
    requests.push({
      clearBasicFilter: {
        sheetId: DEFAULT_SHEET_ID
      }
    });
  }

  // 新增篩選功能
  requests.push({
    setBasicFilter: {
      filter: {
        range: {
          sheetId: DEFAULT_SHEET_ID,
          startRowIndex: 0,  // 從第一列開始（包含標題）
          startColumnIndex: 0,
          endColumnIndex: 12  // 到第12欄（備註欄）
        }
      }
    }
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: { requests }
  });

  logger.success('篩選功能已新增！');
  logger.info('📌 現在您可以在標題列看到篩選圖示，點擊即可篩選：');
  logger.info('   - 品牌：P電漿 / 精靈聚雙璇 / Hera');
  logger.info('   - 類型：知識性 / 生活類 / 互動型...等');
  logger.info('   - 格式：貼文 / 限動 / 短影音');
  logger.info('   - 狀態：待辦 / 進行中 / 完成...等');
  logger.info('   - 上架狀態：未上架 / 已排程 / 已上架');
  logger.info(`🔗 查看連結: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

if (require.main === module) {
  runScript(addFilters);
}

module.exports = addFilters;
