const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const config = require('../../config');

// 設定
const CREDENTIALS_PATH = config.CREDENTIALS_PATH;
const PRESENTATION_ID = config.SLIDES_ID;
const STRATEGY_FILE_PATH = path.join(config.PLANNING_DIR, 'Project_Requirements_Strategy.md');

async function syncPresentation() {
  try {
    console.log('🚀 開始同步 Google Slides (安全模式)...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive'
      ],
    });

    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // 1. 確認策略文件存在（僅警告，不中斷）
    if (!fs.existsSync(STRATEGY_FILE_PATH)) {
      console.warn(`⚠️  找不到策略文件: ${STRATEGY_FILE_PATH}`);
      console.warn('   簡報標題將使用當月週期識別碼，請確認文件路徑是否正確。');
    }

    // 2. 更新簡報標題（動態帶入當月週期，換月只需更新 .env）
    const slideTitle = `${config.CURRENT_CYCLE}_曜亞X默默的社群經營 - B2B 專業提案`;
    console.log(`📝 更新簡報標題為：${slideTitle}`);
    await drive.files.update({
      fileId: PRESENTATION_ID,
      requestBody: { name: slideTitle }
    });
    console.log('✅ 標題已更新');

    // 3. (選擇性) 新增一張新投影片作為備份或展示
    // 我們不再動第 10 頁，以免破壞版面
    console.log('ℹ️ 跳過更新現有投影片，以保留原始設計格式。');

    console.log('✅ 同步完成！(僅更新標題)');
    console.log(`🔗 查看連結: https://docs.google.com/presentation/d/${PRESENTATION_ID}`);

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    if (error.response) {
      console.error('詳細錯誤:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

syncPresentation().catch(err => {
  console.error('❌ 未預期錯誤:', err.message);
  process.exit(1);
});
