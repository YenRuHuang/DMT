#!/usr/bin/env node

const axios = require('axios');
const logger = require('../utils/logger');

const POSSIBLE_URLS = [
  'https://mursfoto-api-gateway.zeabur.app',
  'https://api-gateway.zeabur.app', 
  'https://mursfoto-api-gateway-production.zeabur.app',
  // 需要用戶提供實際 URL
];

async function checkDeployment() {
  console.log('🔍 檢查部署狀態...\n');
  
  for (const baseUrl of POSSIBLE_URLS) {
    console.log(`📡 測試: ${baseUrl}`);
    
    try {
      // 測試健康檢查
      const healthResponse = await axios.get(`${baseUrl}/health`, { 
        timeout: 10000,
        validateStatus: () => true 
      });
      
      if (healthResponse.status === 200) {
        console.log('✅ 健康檢查成功！');
        console.log('📊 響應:', JSON.stringify(healthResponse.data, null, 2));
        
        // 測試詳細健康檢查
        try {
          const detailedResponse = await axios.get(`${baseUrl}/health/detailed`, { 
            timeout: 15000,
            validateStatus: () => true 
          });
          console.log('📋 詳細健康檢查:', JSON.stringify(detailedResponse.data, null, 2));
        } catch (detailError) {
          console.log('⚠️ 詳細健康檢查失敗:', detailError.message);
        }
        
        return baseUrl;
      } else {
        console.log(`❌ HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.log('🚫 域名不存在');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🚫 連接被拒絕');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('⏱️ 連接超時');
      } else {
        console.log(`❌ 錯誤: ${error.message}`);
      }
    }
    
    console.log(''); // 空行
  }
  
  console.log('📝 部署檢查完成');
  console.log('💡 如果所有 URL 都失敗，可能需要：');
  console.log('   1. 檢查 Zeabur Dashboard 中的實際域名');
  console.log('   2. 查看 Zeabur 部署日誌');
  console.log('   3. 確認環境變數配置');
  console.log('   4. 手動觸發重新部署');
  
  return null;
}

// 執行檢查
if (require.main === module) {
  checkDeployment().then(workingUrl => {
    if (workingUrl) {
      console.log(`\n🎉 找到工作中的部署: ${workingUrl}`);
    } else {
      console.log('\n❌ 未找到可用的部署');
      process.exit(1);
    }
  }).catch(error => {
    console.error('檢查過程發生錯誤:', error);
    process.exit(1);
  });
}

module.exports = checkDeployment;
