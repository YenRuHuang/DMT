const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 使用共享設定模組
const config = require('./config');
const { MARKDOWN_FILE_PATH, GEMINI_API_KEY, BRANDS, FORBIDDEN_WORDS } = config;

// 初始化 Gemini Pro API
if (!GEMINI_API_KEY) {
  console.error('❌ 錯誤: 請設定 GEMINI_API_KEY 環境變數！');
  console.log('   執行: export GEMINI_API_KEY="您的API金鑰"');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

console.log('🤖 AI 模式: GEMINI PRO (已啟用)');

/**
 * 使用 Gemini Pro 生成專業 B2B 文案
 */
async function callGeminiPro(brand, topic, type, format) {
  const brandInfo = BRANDS[brand] || { keywords: [], emoji: '📝' };

  const systemPrompt = `你是一位專業的醫美 B2B 社群行銷專家。你正在為「${brand}」品牌撰寫針對診所/醫師的專業貼文。

## 品牌特色
- 關鍵字: ${brandInfo.keywords.join('、')}
- 情感調性: ${brand === 'P電漿' ? '科技、專業、臨床' : brand === '精靈聚雙璇' ? '夢幻、柔和、自然' : '高級、透明、質感'}

## 規則
1. 目標受眾是「診所/醫師/諮詢師」，不是一般消費者
2. 強調「原廠賦能」、「臨床專業」、「技術優勢」
3. 嚴禁使用: ${FORBIDDEN_WORDS.join('、')}
4. 使用繁體中文
5. 文案約 100-150 字，包含標題與正文

## 輸出格式
【標題】一句吸睛標題
【正文】2-3 段專業內容
【Hashtags】3-5 個相關標籤`;

  const userPrompt = `請為以下貼文生成專業文案:
- 品牌: ${brand}
- 主題: ${topic}
- 類型: ${type}
- 格式: ${format}`;

  try {
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`   ❌ Gemini API 錯誤: ${error.message}`);
    return `[生成失敗] ${error.message}`;
  }
}

async function generateCopy(rowNumber = null) {
  try {
    console.log('🚀 開始生成文案 (Gemini Pro)...\n');

    // 1. 讀取 Markdown 檔案
    const content = fs.readFileSync(MARKDOWN_FILE_PATH, 'utf8');

    // 2. 解析表格
    const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/;
    const match = content.match(tableRegex);

    if (!match) {
      throw new Error('找不到 Markdown 表格！');
    }

    const headerLine = match[1];
    const bodyLines = match[2].trim().split('\n');
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);

    // 找出欄位索引
    const brandIdx = headers.indexOf('品牌');
    const typeIdx = headers.indexOf('類型');
    const formatIdx = headers.indexOf('格式');
    const topicIdx = headers.indexOf('主題');
    const copyIdx = headers.indexOf('文案');

    if (copyIdx === -1) {
      throw new Error('找不到「文案」欄位，請先確認表格格式。');
    }

    let updatedBodyLines = [...bodyLines];
    let updateCount = 0;

    // 3. 遍歷每一列 (或指定列)
    for (let i = 0; i < bodyLines.length; i++) {
      if (rowNumber !== null && (i + 1) !== rowNumber) {
        continue;
      }

      const line = bodyLines[i];
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

      // 檢查是否已有文案
      if (cells[copyIdx] && cells[copyIdx].length > 5) {
        console.log(`⚠️ 第 ${i + 1} 列已有文案，跳過。`);
        continue;
      }

      const brand = cells[brandIdx];
      const type = cells[typeIdx];
      const format = cells[formatIdx];
      const topic = cells[topicIdx];

      if (!brand || !topic) {
        console.log(`⚠️ 第 ${i + 1} 列資訊不足，跳過。`);
        continue;
      }

      console.log(`✨ 正在為第 ${i + 1} 列生成文案...`);
      console.log(`   品牌: ${brand} | 主題: ${topic}`);

      // 4. 呼叫 Gemini Pro API
      const generatedText = await callGeminiPro(brand, topic, type, format);

      // 處理換行符號以適應 Markdown 表格
      const cleanText = generatedText.replace(/\n/g, '<br>').substring(0, 500);

      cells[copyIdx] = cleanText;

      const newRow = '| ' + cells.join(' | ') + ' |';
      updatedBodyLines[i] = newRow;
      updateCount++;

      console.log(`   ✅ 完成！\n`);
    }

    if (updateCount > 0) {
      const newContent = content.replace(match[2].trim(), updatedBodyLines.join('\n'));
      fs.writeFileSync(MARKDOWN_FILE_PATH, newContent, 'utf8');
      console.log(`🎉 已更新 ${updateCount} 筆文案到 Markdown 檔案。`);
      console.log('💡 記得執行 node Scripts/sync-sheets.js 同步到 Google Sheets！');
    } else {
      console.log('ℹ️ 沒有需要更新的文案。');
    }

  } catch (error) {
    console.error('❌ 生成失敗:', error.message);
  }
}

// CLI 參數處理
const args = process.argv.slice(2);
if (args.includes('--all')) {
  generateCopy();
} else {
  const rowArgIndex = args.indexOf('--row');
  if (rowArgIndex !== -1 && args[rowArgIndex + 1]) {
    const row = parseInt(args[rowArgIndex + 1]);
    generateCopy(row);
  } else {
    console.log('用法:');
    console.log('  node Scripts/generate-copy.js --all        (生成所有空白文案)');
    console.log('  node Scripts/generate-copy.js --row <行號> (生成指定行號文案)');
  }
}
