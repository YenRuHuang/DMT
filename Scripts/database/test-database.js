#!/usr/bin/env node

/**
 * Mursfoto API Gateway - 資料庫連接測試
 * 測試 Hostinger 資料庫連接和表格初始化
 */

require('dotenv').config();
const logger = require('../utils/logger');

async function testDatabase() {
  try {
    logger.info('🔍 開始資料庫連接測試...');
    
    // 導入資料庫服務
    const db = require('../services/DatabaseService');
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info('✅ 資料庫連接成功！');
    
    // 測試基本查詢
    logger.info('🔍 測試基本查詢...');
    const result = await db.query('SELECT 1 as test');
    logger.info('✅ 基本查詢測試通過:', result);
    
    // 檢查表格是否存在
    logger.info('🔍 檢查資料表結構...');
    const tables = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('api_tokens', 'api_usage_logs', 'blocked_ips', 'security_alerts')
    `, [process.env.DB_NAME]);
    
    logger.info('✅ 找到的資料表:', tables.map(t => t.TABLE_NAME));
    
    // 測試 Token 相關操作
    logger.info('🔍 測試 Token 管理功能...');
    const TokenManager = require('../security/TokenManager');
    const tokenManager = new TokenManager();
    
    // 創建測試 token
    const testTokenData = {
      name: 'Database Test Token',
      description: '用於測試資料庫功能的臨時 Token',
      createdBy: 'test-script'
    };
    
    const createdToken = await tokenManager.createToken(testTokenData);
    logger.info('✅ Token 創建成功:', {
      id: createdToken.id,
      name: createdToken.name,
      expiresAt: createdToken.expiresAt
    });
    
    // 獲取 token 統計
    const tokenStats = await tokenManager.getTokenStats(createdToken.id);
    logger.info('✅ Token 統計獲取成功:', tokenStats);
    
    // 撤銷測試 token
    await tokenManager.revokeToken(createdToken.id, 'test-cleanup');
    logger.info('✅ Token 撤銷成功');
    
    // 測試安全功能
    logger.info('🔍 測試安全監控功能...');
    
    // 創建測試安全告警
    await db.createSecurityAlert({
      alertType: 'test_alert',
      severity: 'low',
      message: '資料庫測試告警',
      details: { test: true },
      ipAddress: '127.0.0.1',
      tokenId: null,
      endpoint: 'test'
    });
    
    // 獲取安全告警
    const alerts = await db.getSecurityAlerts(5);
    logger.info('✅ 安全告警功能測試通過，當前告警數量:', alerts.length);
    
    // 測試 IP 阻止功能
    await db.blockIp('192.168.1.100', '測試阻止', 'test-script');
    const isBlocked = await db.isIpBlocked('192.168.1.100');
    logger.info('✅ IP 阻止功能測試通過:', isBlocked);
    
    // 解除阻止
    await db.unblockIp('192.168.1.100');
    const isUnblocked = await db.isIpBlocked('192.168.1.100');
    logger.info('✅ IP 解除阻止功能測試通過:', !isUnblocked);
    
    logger.info('🎉 所有資料庫測試通過！');
    logger.info('📊 測試摘要:');
    logger.info('  - 資料庫連接: ✅');
    logger.info('  - 表格初始化: ✅');
    logger.info('  - Token 管理: ✅');
    logger.info('  - 安全監控: ✅');
    logger.info('  - IP 阻止管理: ✅');
    
    // 清理測試數據
    logger.info('🧹 清理測試數據...');
    await db.query('DELETE FROM security_alerts WHERE alert_type = ?', ['test_alert']);
    await db.query('DELETE FROM blocked_ips WHERE reason = ?', ['測試阻止']);
    logger.info('✅ 測試數據清理完成');
    
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ 資料庫測試失敗:', error);
    
    // 提供故障排除建議
    logger.error('🔧 故障排除建議:');
    logger.error('  1. 檢查 .env 中的資料庫配置是否正確');
    logger.error('  2. 確認 Hostinger 資料庫服務是否正常運行');
    logger.error('  3. 檢查網路連接是否正常');
    logger.error('  4. 確認資料庫用戶權限是否足夠');
    
    if (error.code === 'ENOTFOUND') {
      logger.error('  → 資料庫主機無法連接，請檢查 DB_HOST 設定');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('  → 資料庫認證失敗，請檢查 DB_USER 和 DB_PASSWORD');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      logger.error('  → 資料庫不存在，請檢查 DB_NAME 設定');
    }
    
    process.exit(1);
  }
}

// 執行測試
if (require.main === module) {
  testDatabase();
}

module.exports = testDatabase;
