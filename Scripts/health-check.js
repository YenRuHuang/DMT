/**
 * 系統健康檢查腳本 (Health Check)
 * 
 * 執行此腳本以驗證所有系統元件是否正常運作。
 * 用法: node Scripts/health-check.js
 */

const fs = require('fs');
const path = require('path');

// 使用共享設定模組
const config = require('./config');

async function runHealthCheck() {
  console.log('🩺 正在執行系統健康檢查...\n');

  let passed = 0;
  let failed = 0;

  // === 1. 檢查關鍵檔案是否存在 ===
  console.log('📁 [1/4] 檢查關鍵檔案...');

  const criticalFiles = [
    { name: 'Master_Command_Center.md', path: config.MARKDOWN_FILE_PATH },
    { name: 'Google Credentials JSON', path: config.CREDENTIALS_PATH },
    { name: 'package.json', path: path.join(config.PROJECT_ROOT, 'package.json') },
  ];

  for (const file of criticalFiles) {
    if (fs.existsSync(file.path)) {
      console.log(`   ✅ ${file.name}`);
      passed++;
    } else {
      console.log(`   ❌ ${file.name} - 檔案不存在！`);
      failed++;
    }
  }

  // === 2. 檢查 Node Modules ===
  console.log('\n📦 [2/4] 檢查 Node 相依性...');
  const nodeModulesPath = path.join(config.PROJECT_ROOT, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules 已安裝');
    passed++;
  } else {
    console.log('   ❌ node_modules 未安裝！請執行 npm install');
    failed++;
  }

  // === 3. 檢查 Google API 連線 (簡單驗證) ===
  console.log('\n☁️ [3/4] 檢查 Google API 憑證...');
  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    if (client) {
      console.log('   ✅ Google API 憑證有效');
      passed++;
    }
  } catch (error) {
    console.log(`   ❌ Google API 憑證無效: ${error.message}`);
    failed++;
  }

  // === 4. 檢查 AI 模式 ===
  console.log('\n🤖 [4/4] 檢查 AI 模式...');
  if (config.AI_MODE === 'AI_PRO_WORKSPACE_STUDIO') {
    console.log('   ✅ AI Pro 模式 (Gemini 3 Pro via Workspace Studio)');
    passed++;
  } else {
    console.log('   ⚠️ AI 模式未設定，請檢查 config.js');
  }

  // === 總結 ===
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 健康檢查結果: ${passed} 通過 / ${failed} 失敗`);

  if (failed === 0) {
    console.log('🎉 系統狀態良好，所有檢查項目通過！');
  } else {
    console.log('⚠️ 部分檢查項目失敗，請根據上方提示修復問題。');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return failed === 0;
}

runHealthCheck().then(success => {
  process.exit(success ? 0 : 1);
});
