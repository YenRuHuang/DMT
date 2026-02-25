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

// 載入 .env（必須存在）
const envPath = path.join(PROJECT_ROOT, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ 找不到 .env 檔案。請複製 .env.example 並填入設定值。');
  process.exit(1);
}
require('dotenv').config({ path: envPath });

// 驗證必要的環境變數
const REQUIRED_ENV = ['CREDENTIALS_PATH', 'SPREADSHEET_ID', 'INTERNAL_SPREADSHEET_ID', 'SLIDES_ID', 'IMAGE_FOLDER_ID'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ 缺少必要的環境變數：${missing.join(', ')}\n   請檢查 .env 檔案。`);
  process.exit(1);
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

  // 核心文件 - 當月排程來源（每月更新此路徑）
  MARKDOWN_FILE_PATH: path.join(PROJECT_ROOT, 'Planning', '2026_02_Cycle', 'Final_Proposal_Submission_2026_02.md'),

  // === Google API 憑證與試算表設定 ===
  CREDENTIALS_PATH: path.resolve(PROJECT_ROOT, process.env.CREDENTIALS_PATH),

  // Token 路徑 (用於存儲 OAuth token)
  TOKEN_PATH: path.join(PROJECT_ROOT, 'token.json'),

  SPREADSHEET_ID: process.env.SPREADSHEET_ID,
  INTERNAL_SPREADSHEET_ID: process.env.INTERNAL_SPREADSHEET_ID,
  SHEET_NAME: process.env.SHEET_NAME || 'Month2_排程',

  DEFAULT_SHEET_ID: 0,

  // === Google Slides 設定 ===
  SLIDES_ID: process.env.SLIDES_ID,

  // === Google Drive 設定 ===
  /** 圖片素材資料夾 ID（所有週期共用） */
  IMAGE_FOLDER_ID: process.env.IMAGE_FOLDER_ID,

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
    'Neuramis': {
      color: '#E6D5F0',
      keywords: ['柔和粉', '仙女光', 'SHAPE技術', '自然'],
      emoji: '🧚‍♀️'
    },
    'Cooltech': {
      color: '#0066CC',
      keywords: ['科技藍', '冰晶白', '360度冷卻', '4探頭'],
      emoji: '❄️'
    },
    'LPG': {
      color: '#FFD700',
      keywords: ['香檳金', '無限波', '身心平衡', '法式優雅'],
      emoji: '♾️'
    }
  },

  // === 禁用詞彙 (醫療合規 & 品牌規範) ===
  FORBIDDEN_WORDS: ['治療', '改善疾病', '永久', '保證', '治癒', '痊癒', '減重', '減肥', '瘦身', '胖', '銷量霸主', '冠軍'],

  // === 部署檢查 URL ===
  POSSIBLE_DEPLOYMENT_URLS: [
    'https://mursfoto-api-gateway.zeabur.app',
    'https://api-gateway.zeabur.app',
    'https://mursfoto-api-gateway-production.zeabur.app'
  ]
};
