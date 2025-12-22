#!/usr/bin/env node

// 確保加載環境變數
require('dotenv').config();

const crypto = require('crypto');
const DatabaseService = require('../services/DatabaseService');
const TokenManager = require('../security/TokenManager');
const logger = require('../utils/logger');

async function createToken() {
  try {
    // 初始化資料庫
    const dbInitialized = await DatabaseService.init();
    
    if (!dbInitialized) {
      throw new Error('資料庫初始化失敗，無法創建 Token');
    }
    
    // 創建 TokenManager 實例並初始化
    const tokenManager = new TokenManager();
    await tokenManager.initialize();
    
    console.log('🔑 Creating first API Token...\n');
    
    // 創建第一個 Token
    const tokenData = {
      name: 'Primary API Token',
      description: 'First API token for testing and initial development',
      expiresInDays: 365 // 1 年有效期
    };
    
    const result = await tokenManager.createToken(tokenData);
    
    console.log('✅ Token created successfully!\n');
    console.log('📋 Token Details:');
    console.log(`   Token ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Expires: ${result.expiresAt}`);
    console.log(`   Created: ${result.createdAt}\n`);
    
    console.log('🔐 API Token (Save this securely!):');
    console.log(`   ${result.token}\n`);
    
    console.log('🌐 Usage Examples:');
    console.log(`   # Health check`);
    console.log(`   curl https://your-zeabur-domain.zeabur.app/health`);
    console.log(``);
    console.log(`   # Test authenticated endpoint`);
    console.log(`   curl https://your-zeabur-domain.zeabur.app/auth/tokens \\`);
    console.log(`     -H "Authorization: Bearer ${result.token}"`);
    console.log(``);
    console.log(`   # Test Claude API proxy`);
    console.log(`   curl https://your-zeabur-domain.zeabur.app/api/claude/v1/messages \\`);
    console.log(`     -H "Authorization: Bearer ${result.token}" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"model":"claude-3-haiku-20240307","max_tokens":100,"messages":[{"role":"user","content":"Hello!"}]}'`);
    
  } catch (error) {
    console.error('❌ Failed to create token:', error.message);
    process.exit(1);
  } finally {
    // 關閉資料庫連接
    await DatabaseService.close();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  createToken();
}

module.exports = createToken;
