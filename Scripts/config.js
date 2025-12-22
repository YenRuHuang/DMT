/**
 * 曜亞 x 默默的社群經營 - 共享設定模組
 * 
 * 所有腳本應 require 此模組來取得路徑與 ID，
 * 避免在多個檔案中重複寫死設定。
 */

const path = require('path');

// 專案根目錄
const PROJECT_ROOT = path.resolve(__dirname, '..');

module.exports = {
  // === 路徑設定 ===
  PROJECT_ROOT,
  PLANNING_DIR: path.join(PROJECT_ROOT, 'Planning'),
  SCRIPTS_DIR: path.join(PROJECT_ROOT, 'Scripts'),

  // 核心文件
  MARKDOWN_FILE_PATH: path.join(PROJECT_ROOT, 'Planning', 'Master_Command_Center.md'),

  // Google API 金鑰 (不要上傳到 GitHub！)
  CREDENTIALS_PATH: path.join(PROJECT_ROOT, 'glass-tide-461207-j2-8b7a7afd3e07.json'),

  // === Google Sheets 設定 ===
  SPREADSHEET_ID: '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8',
  SHEET_NAME: '進度追蹤_乾淨版',

  // === Google Slides 設定 ===
  SLIDES_ID: '13sQCCsWMCvYFd9ymU0V5raRY0swLERybFz2ic6CTvcA',

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
  FORBIDDEN_WORDS: ['治療', '改善疾病', '永久', '保證', '治癒', '痊癒']
};
