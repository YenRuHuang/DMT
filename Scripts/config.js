/**
 * 曜亞 x 默默的社群經營 - 共享設定模組
 * 
 * 所有腳本應 require 此模組來取得路徑與 ID，
 * 避免在多個檔案中重複寫死設定。
 */

const path = require('path');
const fs = require('fs');

// 專案根目錄
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 檢查 .env 是否存在，如果存在則加載
if (fs.existsSync(path.join(PROJECT_ROOT, '.env'))) {
  require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });
}

module.exports = {
  // === 路徑設定 ===
  /** 專案根目錄 */
  PROJECT_ROOT,
  /** 企劃文件目錄 */
  PLANNING_DIR: path.join(PROJECT_ROOT, 'Planning'),
  /** 腳本目錄 */
  SCRIPTS_DIR: path.join(PROJECT_ROOT, 'Scripts'),
  /** 輸出/報告目錄 (如果有的話) */
  OUTPUT_DIR: path.join(PROJECT_ROOT, 'Output'),

  // 核心文件
  MARKDOWN_FILE_PATH: path.join(PROJECT_ROOT, 'Planning', 'Master_Command_Center.md'),

  // Google API 金鑰 (不要上傳到 GitHub！)
  CREDENTIALS_PATH: path.join(PROJECT_ROOT, 'glass-tide-461207-j2-8b7a7afd3e07.json'),

  // Token 路徑 (用於存儲 OAuth token)
  TOKEN_PATH: path.join(PROJECT_ROOT, 'token.json'),

  // === Google Sheets 設定 ===
  SPREADSHEET_ID: '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8',
  SHEET_NAME: '進度追蹤_乾淨版',

  // 工作表 ID (通常第一個是 0，但最好動態獲取)
  DEFAULT_SHEET_ID: 0,

  // === Google Slides 設定 ===
  SLIDES_ID: '13sQCCsWMCvYFd9ymU0V5raRY0swLERybFz2ic6CTvcA',

  // === 資料庫設定 (優先使用環境變數) ===
  DB_CONFIG: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },

  // === AI 模式 ===
  // 本專案使用 AI Pro (Gemini 3 Pro) 透過 Workspace Studio 進行文案生成
  // 不再使用 API Key，所有 AI 功能透過雲端 Agent 執行
  AI_MODE: 'AI_PRO_WORKSPACE_STUDIO',

  // === 品牌資訊 ===
  BRANDS: {
    'P電漿': {
      color: '#0066CC',
      keywords: ['科技藍', '實驗室白', '顯微鏡視角', '殺菌修復'],
      emoji: '🔵'
    },
    '精靈聚雙璇': {
      color: '#E6D5F0',
      keywords: ['柔和粉紫', '泡泡微球體', '夢幻感', '膠原蛋白'],
      emoji: '🟣'
    },
    'Hera': {
      color: '#D8BFD8',
      keywords: ['粉紫金', '透明感', '少女質感', '高級體驗'],
      emoji: '✨'
    }
  },

  // === 禁用詞彙 (醫療合規) ===
  FORBIDDEN_WORDS: ['治療', '改善疾病', '永久', '保證', '治癒', '痊癒'],

  // === 部署檢查 URL ===
  POSSIBLE_DEPLOYMENT_URLS: [
    'https://mursfoto-api-gateway.zeabur.app',
    'https://api-gateway.zeabur.app',
    'https://mursfoto-api-gateway-production.zeabur.app'
  ]
};
