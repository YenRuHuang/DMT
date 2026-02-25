#!/usr/bin/env node

/**
 * 系統健康檢查腳本 (Health Check)
 * 
 * 執行此腳本以驗證所有系統元件是否正常運作。
 * 用法: node Scripts/health-check.js
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 使用共享設定模組
const config = require('./config');
const { logger } = require('./utils');

async function runHealthCheck() {
  logger.info('🩺 正在執行系統健康檢查...\n');

  let passed = 0;
  let failed = 0;

  // === 1. 檢查關鍵檔案是否存在 ===
  logger.info('📁 [1/4] 檢查關鍵檔案...');

  const criticalFiles = [
    { name: 'Final_Proposal_Submission_2026_02.md', path: config.MARKDOWN_FILE_PATH },
    { name: 'Google Credentials JSON', path: config.CREDENTIALS_PATH },
    { name: 'package.json', path: path.join(config.PROJECT_ROOT, 'package.json') },
  ];

  for (const file of criticalFiles) {
    if (fs.existsSync(file.path)) {
      logger.success(`   ${file.name}`);
      passed++;
    } else {
      logger.error(`   ${file.name} - 檔案不存在！`);
      failed++;
    }
  }

  // === 2. 檢查 Node Modules ===
  logger.info('\n📦 [2/4] 檢查 Node 相依性...');
  const nodeModulesPath = path.join(config.PROJECT_ROOT, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    logger.success('   node_modules 已安裝');
    passed++;
  } else {
    logger.error('   node_modules 未安裝！請執行 npm install');
    failed++;
  }

  // === 3. 檢查 Google API 連線 (簡單驗證) ===
  logger.info('\n☁️ [3/4] 檢查 Google API 憑證...');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    if (client) {
      logger.success('   Google API 憑證有效');
      passed++;
    }
  } catch (error) {
    logger.error(`   Google API 憑證無效: ${error.message}`);
    failed++;
  }

  // === 4. 檢查 AI 模式 ===
  logger.info('\n🤖 [4/4] 檢查 AI 模式...');
  if (config.AI_MODE === 'AI_PRO_WORKSPACE_STUDIO') {
    logger.success('   AI Pro 模式 (Gemini 3 Pro via Workspace Studio)');
    passed++;
  } else {
    logger.warn('   AI 模式未設定，請檢查 config.js');
  }

  // === 總結 ===
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 健康檢查結果: ${passed} 通過 / ${failed} 失敗`);

  if (failed === 0) {
    logger.success('系統狀態良好，所有檢查項目通過！');
  } else {
    logger.warn('部分檢查項目失敗，請根據上方提示修復問題。');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return failed === 0;
}

if (require.main === module) {
  runHealthCheck().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = runHealthCheck;
