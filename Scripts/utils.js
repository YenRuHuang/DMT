/**
 * 曜亞 x 默默的社群經營 - 共用工具模組
 * 
 * 提供統一的 logger 和其他共用功能
 */

const chalk = require('chalk');

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

module.exports = {
  logger,
  handleError
};
