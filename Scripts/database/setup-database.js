#!/usr/bin/env node

/**
 * Mursfoto API Gateway - 資料庫初始化腳本
 * 自動創建所需的資料庫表格結構
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// 資料庫表格 SQL 定義
const TABLE_DEFINITIONS = {
  api_tokens: `
    CREATE TABLE IF NOT EXISTS api_tokens (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL,
      last_used_at TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT TRUE,
      usage_count INT DEFAULT 0,
      INDEX idx_token_hash (token_hash),
      INDEX idx_created_at (created_at),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  api_usage_logs: `
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      token_id VARCHAR(36),
      endpoint VARCHAR(255) NOT NULL,
      method VARCHAR(10) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      request_size INT,
      response_status INT,
      response_time_ms INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token_id (token_id),
      INDEX idx_created_at (created_at),
      INDEX idx_endpoint (endpoint),
      INDEX idx_ip_address (ip_address),
      FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  blocked_ips: `
    CREATE TABLE IF NOT EXISTS blocked_ips (
      id INT PRIMARY KEY AUTO_INCREMENT,
      ip_address VARCHAR(45) NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      blocked_by VARCHAR(255),
      blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT TRUE,
      INDEX idx_ip_address (ip_address),
      INDEX idx_active (is_active),
      INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  security_alerts: `
    CREATE TABLE IF NOT EXISTS security_alerts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      alert_type VARCHAR(100) NOT NULL,
      severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
      message TEXT NOT NULL,
      details JSON,
      ip_address VARCHAR(45),
      token_id VARCHAR(36),
      endpoint VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_resolved BOOLEAN DEFAULT FALSE,
      INDEX idx_alert_type (alert_type),
      INDEX idx_severity (severity),
      INDEX idx_created_at (created_at),
      INDEX idx_resolved (is_resolved),
      INDEX idx_ip_address (ip_address),
      FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `
};

async function setupDatabase() {
  let connection = null;

  try {
    logger.info('🔧 開始設定 Hostinger MySQL 資料庫...');

    // 檢查環境變數
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`缺少必要的環境變數: ${missingVars.join(', ')}`);
    }

    // 資料庫連線配置
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      timezone: '+08:00',
      connectTimeout: 30000
    };

    logger.info('📍 連線資訊:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });

    // 建立資料庫連線
    logger.info('🔌 建立資料庫連線...');
    connection = await mysql.createConnection(dbConfig);
    
    logger.info('✅ 資料庫連線成功！');

    // 測試連線
    await connection.execute('SELECT 1 as test');
    logger.info('✅ 資料庫連線測試通過');

    // 創建表格
    logger.info('🏗️  開始創建資料庫表格...');
    
    for (const [tableName, sql] of Object.entries(TABLE_DEFINITIONS)) {
      try {
        logger.info(`📋 創建表格: ${tableName}`);
        await connection.execute(sql);
        logger.info(`✅ 表格 ${tableName} 創建成功`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          logger.info(`ℹ️  表格 ${tableName} 已存在，跳過`);
        } else {
          throw error;
        }
      }
    }

    // 檢查表格結構
    logger.info('🔍 驗證表格結構...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('api_tokens', 'api_usage_logs', 'blocked_ips', 'security_alerts')
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME]);

    logger.info('📊 資料庫表格狀態:');
    tables.forEach(table => {
      logger.info(`  - ${table.TABLE_NAME}: ${table.TABLE_ROWS || 0} 筆記錄 (${Math.round(table.DATA_LENGTH / 1024)} KB)`);
    });

    // 創建測試 Token (可選)
    logger.info('🔐 創建初始管理員 Token...');
    const tokenId = require('crypto').randomUUID();
    const jwt = require('jsonwebtoken');
    
    const adminToken = jwt.sign(
      { 
        id: tokenId,
        type: 'admin',
        name: 'Initial Admin Token'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const tokenHash = require('crypto')
      .createHash('sha256')
      .update(adminToken)
      .digest('hex');

    await connection.execute(`
      INSERT IGNORE INTO api_tokens 
      (id, name, description, token_hash, created_by, expires_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      tokenId,
      'Initial Admin Token',
      '系統初始化時創建的管理員 Token',
      tokenHash,
      'system',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天後過期
    ]);

    logger.info('✅ 初始管理員 Token 創建成功');
    logger.info('🔑 Token:', adminToken);
    logger.info('⚠️  請妥善保管此 Token，它將在 30 天後過期');

    // 最終驗證
    logger.info('🎯 執行最終驗證...');
    
    // 測試 Token 查詢
    const [tokenResult] = await connection.execute(
      'SELECT COUNT(*) as token_count FROM api_tokens WHERE is_active = TRUE'
    );
    
    // 測試外鍵約束
    await connection.execute(
      'SELECT COUNT(*) as log_count FROM api_usage_logs'
    );

    logger.info('🎉 資料庫設定完成！');
    logger.info('📊 設定摘要:');
    logger.info(`  - 資料庫: ${process.env.DB_NAME}`);
    logger.info(`  - 表格數量: ${tables.length}`);
    logger.info(`  - Token 數量: ${tokenResult[0].token_count}`);
    logger.info('  - 功能狀態: 完全就緒 ✅');

    logger.info('🚀 現在可以啟動完整版 API Gateway:');
    logger.info('   npm run start:full');

  } catch (error) {
    logger.error('❌ 資料庫設定失敗:', error);
    
    // 提供詳細的故障排除指導
    logger.error('🔧 故障排除指導:');
    
    if (error.code === 'ENOTFOUND') {
      logger.error('  → 資料庫主機無法連接');
      logger.error('    1. 檢查 DB_HOST 設定是否正確');
      logger.error('    2. 確認網路連接正常');
      logger.error('    3. 檢查 Hostinger 資料庫服務狀態');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('  → 資料庫認證失敗');
      logger.error('    1. 檢查 DB_USER 和 DB_PASSWORD');
      logger.error('    2. 確認用戶有足夠的資料庫權限');
      logger.error('    3. 檢查 Hostinger 用戶設定');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      logger.error('  → 資料庫不存在');
      logger.error('    1. 檢查 DB_NAME 拼寫');
      logger.error('    2. 在 Hostinger 控制台確認資料庫已創建');
    } else if (error.message?.includes('環境變數')) {
      logger.error('  → 環境變數配置問題');
      logger.error('    1. 檢查 .env 檔案是否存在');
      logger.error('    2. 確認所有必要的環境變數已設定');
      logger.error('    3. 參考 .env.example 檔案');
    } else {
      logger.error('  → 未知錯誤，請檢查:');
      logger.error('    1. 網路連接');
      logger.error('    2. Hostinger 服務狀態');
      logger.error('    3. 資料庫配置');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      logger.info('🔌 資料庫連線已關閉');
    }
  }
}

// 執行設定
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
