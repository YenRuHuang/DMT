/**
 * 曜亞 x 默默的社群經營 - 共用工具模組
 *
 * 提供統一的 logger、Google API 客戶端工廠，以及腳本執行包裝器。
 */

const chalk = require('chalk');
const { google } = require('googleapis');

/**
 * 統一的 Logger 工具類
 */
const logger = {
  prefix: '🚀 曜亞',

  info(...args) {
    console.log(chalk.blue(`[${this.prefix}]`), ...args);
  },

  success(...args) {
    console.log(chalk.green(`[${this.prefix}] ✅`), ...args);
  },

  warn(...args) {
    console.log(chalk.yellow(`[${this.prefix}] ⚠️`), ...args);
  },

  error(...args) {
    console.error(chalk.red(`[${this.prefix}] ❌`), ...args);
  },

  debug(...args) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(chalk.gray(`[${this.prefix}] 🔧`), ...args);
    }
  }
};

/**
 * 通用的錯誤處理函數
 * @param {Error} error - 錯誤物件
 * @param {string} context - 錯誤發生的上下文
 */
const handleError = (error, context = '') => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
};

/**
 * 建立已認證的 Google Sheets 客戶端
 * @param {string[]} [scopes] - 覆寫預設 scopes（預設為完整讀寫）
 * @returns {Promise<import('googleapis').sheets_v4.Sheets>}
 */
const getSheetsClient = async (scopes = ['https://www.googleapis.com/auth/spreadsheets']) => {
  // 延遲載入 config 避免模組互相依賴時的初始化順序問題
  const config = require('./config');
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes,
  });
  return google.sheets({ version: 'v4', auth });
};

/**
 * 標準腳本執行包裝器
 * 自動加上錯誤捕捉與 process.exit(1)，讓 CI/CD 能偵測失敗。
 * 使用方式：if (require.main === module) { runScript(myAsyncFn); }
 * @param {() => Promise<void>} fn - 要執行的 async 函式
 */
const runScript = (fn) => {
  fn()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(`腳本執行失敗: ${err.message}`);
      if (process.env.DEBUG) {
        console.error(err.stack);
      }
      process.exit(1);
    });
};

module.exports = {
  logger,
  handleError,
  getSheetsClient,
  runScript,
};
