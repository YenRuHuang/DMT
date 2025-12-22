#!/usr/bin/env node

/**
 * Mursfoto API Gateway 部署腳本
 * 使用 Mursfoto CLI 部署策略
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MursfotoAPIGatewayDeployer {
  constructor() {
    this.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    this.serviceName = this.packageJson.mursfoto?.service || 'mursfoto-api-gateway';
    this.serviceType = this.packageJson.mursfoto?.type || 'api-gateway';
    this.servicePort = this.packageJson.mursfoto?.port || 4100;
  }

  async deploy() {
    console.log(`🚀 部署 Mursfoto API Gateway: ${this.serviceName}`);
    console.log('─'.repeat(50));

    try {
      // 1. 檢查 Git 狀態
      this.checkGitStatus();
      
      // 2. GitHub 部署
      await this.deployToGitHub();
      
      // 3. 顯示 Zeabur 配置
      this.showZeaburConfig();
      
      console.log('');
      console.log('✅ 部署配置完成！');
      console.log('');
      console.log('📱 接下來的步驟:');
      console.log('   1. 前往 https://zeabur.com/');
      console.log(`   2. 創建新項目: ${this.serviceName}`);
      console.log(`   3. 連接 GitHub 倉庫: YenRuHuang/${this.serviceName}`);
      console.log('   4. 添加環境變數 (如上所示)');
      console.log('   5. 部署！');
      console.log('');
      console.log('🌐 部署後的訪問端點:');
      console.log(`   - Claude Sonnet 4: https://${this.serviceName}.zeabur.app/api/claude/v1/messages`);
      console.log(`   - API 狀態: https://${this.serviceName}.zeabur.app/api/status`);
      console.log(`   - 健康檢查: https://${this.serviceName}.zeabur.app/health`);
      
    } catch (error) {
      console.error('❌ 部署失敗:', error.message);
      process.exit(1);
    }
  }

  checkGitStatus() {
    console.log('📋 檢查 Git 狀態...');
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('📝 提交變更...');
        execSync('git add .');
        execSync(`git commit -m "feat: prepare ${this.serviceName} for Zeabur deployment with Cloudflare AI Gateway"`);
      }
    } catch (error) {
      // 可能是新的 repo，繼續
    }
    
    console.log('✅ Git 狀態正常');
  }

  async deployToGitHub() {
    console.log('📡 部署到 GitHub...');
    
    const githubUser = 'YenRuHuang';
    const repoName = this.serviceName;
    
    try {
      // 檢查是否已有 remote
      try {
        execSync('git remote get-url origin', { stdio: 'pipe' });
        console.log('📡 Remote origin 已存在');
      } catch {
        // 添加 remote
        const repoUrl = `https://github.com/${githubUser}/${repoName}.git`;
        execSync(`git remote add origin ${repoUrl}`);
        console.log(`📡 添加 remote: ${repoUrl}`);
      }
      
      // Push to GitHub
      execSync('git push -u origin main', { stdio: 'inherit' });
      console.log('✅ 成功推送到 GitHub');
      
    } catch (error) {
      console.log('⚠️  GitHub push 失敗。您可能需要:');
      console.log('   1. 創建倉庫: https://github.com/new');
      console.log(`   2. 設置倉庫名稱: ${repoName}`);
      console.log('   3. 運行: git push -u origin main');
    }
  }

  showZeaburConfig() {
    console.log('');
    console.log('🔧 Zeabur 環境變數配置:');
    console.log('─'.repeat(40));
    
    const config = {
      // 基本配置
      NODE_ENV: 'production',
      PORT: '8080', // Zeabur 使用 8080
      
      // Mursfoto 系統配置
      MURSFOTO_SERVICE_NAME: this.serviceName,
      MURSFOTO_SERVICE_TYPE: this.serviceType,
      
      // API 密鑰 (需要手動設置)
      ANTHROPIC_API_KEY: 'sk-ant-api03--YOUR_ANTHROPIC_KEY',
      GEMINI_API_KEY: 'your-gemini-key',
      STRIPE_SECRET_KEY: 'sk_live_your-stripe-key',
      
      // Cloudflare AI Gateway 配置
      CLOUDFLARE_ENABLED: 'true',
      CLOUDFLARE_ACCOUNT_ID: 'ead81cc171e4abea31cd5a0b3ff92095',
      CLOUDFLARE_GATEWAY_ID: 'mursfoto-gateway',
      CLOUDFLARE_API_TOKEN: 'ezBaReS_pLJOUOODq4CAKW50hM84e8akgC0ITKne',
      
      // 安全配置
      JWT_SECRET: this.generateRandomSecret(64),
      ADMIN_API_KEY: `mf_admin_${this.generateRandomSecret(16)}`,
      
      // CORS 配置
      ALLOWED_ORIGINS: `https://${this.serviceName}.zeabur.app,https://claude.ai`,
      
      // 速率限制配置
      GLOBAL_RATE_LIMIT: '1000',
      API_RATE_LIMIT: '100',
      AUTH_RATE_LIMIT: '10',
      
      // 日誌配置
      LOG_LEVEL: 'info',
      ENABLE_REQUEST_LOGGING: 'true',
      
      // 可選配置 (如果需要 Sentry 監控)
      // SENTRY_DSN: 'your-sentry-dsn',
      
      // 健康檢查配置
      EXTERNAL_API_HEALTH_CHECK: 'true',
      HEALTH_CHECK_TIMEOUT: '5000'
    };

    Object.entries(config).forEach(([key, value]) => {
      if (key.includes('KEY') || key.includes('TOKEN') || key.includes('SECRET')) {
        console.log(`${key}=${value.includes('YOUR') ? value : '***HIDDEN***'}`);
      } else {
        console.log(`${key}=${value}`);
      }
    });
    
    console.log('');
    console.log('💡 重要提示:');
    console.log('   - 請將 YOUR_ANTHROPIC_KEY 替換為您的真實 Anthropic API 密鑰');
    console.log('   - Cloudflare 配置已自動填入，但請確認正確性');
    console.log('   - JWT_SECRET 和 ADMIN_API_KEY 已自動生成，請保存');
    console.log('   - 複製這些變數到 Zeabur Environment 標籤');
    console.log('');
    console.log('🔒 安全配置:');
    console.log('   - API 密鑰將被隱藏顯示');
    console.log('   - CORS 已配置允許 Claude AI 和您的域名');
    console.log('   - 速率限制已啟用');
    console.log('   - 請求日誌已啟用');
  }

  generateRandomSecret(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// CLI 介面
function main() {
  const [,, command] = process.argv;
  const deployer = new MursfotoAPIGatewayDeployer();

  switch (command) {
    case 'deploy':
    case undefined:
      deployer.deploy();
      break;
      
    default:
      console.log('Mursfoto API Gateway 部署工具');
      console.log('');
      console.log('使用方法:');
      console.log('  npm run deploy  - 準備部署到 Zeabur');
      console.log('');
      console.log('功能:');
      console.log('  ✅ 自動 Git 提交和推送');
      console.log('  ✅ 生成 Zeabur 環境變數配置');
      console.log('  ✅ Claude Sonnet 4 完整支援');
      console.log('  ✅ Cloudflare AI Gateway 智能路由');
      console.log('  ✅ 安全配置和監控');
  }
}

if (require.main === module) {
  main();
}

module.exports = MursfotoAPIGatewayDeployer;