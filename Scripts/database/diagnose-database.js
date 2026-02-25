#!/usr/bin/env node

/**
 * Hostinger 資料庫連接診斷腳本
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function diagnoseDatabaseConnection() {
  console.log('🔍 開始診斷 Hostinger MySQL 連接...');
  
  // 檢查環境變數
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
  
  console.log('📋 資料庫配置:');
  console.log(`  Host: ${dbConfig.host}`);
  console.log(`  Port: ${dbConfig.port}`);
  console.log(`  User: ${dbConfig.user}`);
  console.log(`  Database: ${dbConfig.database}`);
  console.log(`  Password: ${dbConfig.password ? '[已設定]' : '[未設定]'}`);
  
  // 測試 1: 基本連接
  console.log('\n🔧 測試 1: 基本連接...');
  let connection = null;
  
  try {
    console.log('⏱️  連接逾時設定: 10 秒');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: parseInt(dbConfig.port),
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      connectTimeout: 10000
    });
    
    console.log('✅ 基本連接成功！');
    
    // 測試 2: ping
    console.log('\n🔧 測試 2: Ping 測試...');
    await connection.ping();
    console.log('✅ Ping 成功！');
    
    // 測試 3: 簡單查詢
    console.log('\n🔧 測試 3: 簡單查詢測試...');
    const [result] = await connection.execute('SELECT 1 as test, NOW() as server_time');
    console.log('✅ 查詢成功:', result[0]);
    
    // 測試 4: 資料庫資訊
    console.log('\n🔧 測試 4: 資料庫資訊查詢...');
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as mysql_version');
    console.log('✅ 資料庫資訊:', dbInfo[0]);
    
    // 測試 5: 檢查現有表格
    console.log('\n🔧 測試 5: 檢查現有表格...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log(`✅ 找到 ${tables.length} 個表格:`);
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}: ${table.TABLE_ROWS || 0} 筆資料`);
    });
    
    console.log('\n🎉 所有測試通過！Hostinger 資料庫連接正常。');
    
  } catch (error) {
    console.error('\n❌ 連接失敗:', error.message);
    console.error('錯誤代碼:', error.code);
    
    // 詳細錯誤分析
    if (error.code === 'ENOTFOUND') {
      console.error('\n🔍 診斷結果: DNS 解析失敗');
      console.error('  → 主機名稱無法解析，請檢查 DB_HOST 設定');
      console.error('  → 確認網路連接正常');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔍 診斷結果: 連接被拒絕');
      console.error('  → MySQL 服務可能未運行');
      console.error('  → 檢查端口號是否正確');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔍 診斷結果: 認證失敗');
      console.error('  → 用戶名或密碼錯誤');
      console.error('  → 檢查 DB_USER 和 DB_PASSWORD');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n🔍 診斷結果: 資料庫不存在');
      console.error('  → 檢查 DB_NAME 是否正確');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n🔍 診斷結果: 連接逾時');
      console.error('  → 網路延遲或主機無回應');
      console.error('  → 可能是防火牆阻擋');
    } else {
      console.error('\n🔍 診斷結果: 其他錯誤');
      console.error('  → 請檢查 Hostinger 控制台狀態');
      console.error('  → 確認資料庫服務正常運行');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 連接已關閉');
    }
  }
}

// 執行診斷
diagnoseDatabaseConnection();
