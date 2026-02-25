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

    // 1. 讀取本地策略文件
    console.log('📖 讀取策略文件...');
    let strategyContent = '';
    if (fs.existsSync(STRATEGY_FILE_PATH)) {
      strategyContent = fs.readFileSync(STRATEGY_FILE_PATH, 'utf8');
      const lines = strategyContent.split('\n');
      strategyContent = lines.slice(0, 20).join('\n');
    } else {
      strategyContent = '策略文件同步測試\nB2B 專業轉型計畫';
    }

    // 2. 更新簡報標題
    console.log('📝 更新簡報標題...');
    await drive.files.update({
      fileId: PRESENTATION_ID,
      requestBody: {
        name: '2026_01_曜亞X默默的社群經營 - B2B 專業提案'
      }
    });
    console.log('✅ 標題已更新');

    // 3. (選擇性) 新增一張新投影片作為備份或展示
    // 我們不再動第 10 頁，以免破壞版面
    console.log('ℹ️ 跳過更新現有投影片，以保留原始設計格式。');

    console.log('✅ 同步完成！(僅更新標題)');
    console.log(`🔗 查看連結: https://docs.google.com/presentation/d/${PRESENTATION_ID}`);

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
  }
}

syncPresentation();
