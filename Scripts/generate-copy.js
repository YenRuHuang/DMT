const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 使用共享設定模組
const config = require('./config');
const { MARKDOWN_FILE_PATH, GEMINI_API_KEY, OPENAI_API_KEY, BRANDS, FORBIDDEN_WORDS } = config;

// AI 模式選擇：優先 Gemini > OpenAI > Mock
const AI_MODE = GEMINI_API_KEY ? 'gemini' : (OPENAI_API_KEY ? 'openai' : 'mock');
console.log(`🤖 AI 模式: ${AI_MODE.toUpperCase()}`);

async function generateCopy(rowNumber = null) {
  try {
    console.log('🚀 開始生成文案...');

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
      // 如果指定了 rowNumber (1-based)，則只處理該列
      if (rowNumber !== null && (i + 1) !== rowNumber) {
        continue;
      }

      const line = bodyLines[i];
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

      // 檢查是否已有文案 (避免覆蓋，除非強制？這裡先設定為若有內容則跳過)
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

      console.log(`🤖 正在為第 ${i + 1} 列生成文案...`);
      console.log(`   - 品牌: ${brand}, 主題: ${topic}`);

      // 4. 呼叫 AI 生成文案
      let generatedText = '';
      if (MOCK_AI) {
        generatedText = `[AI 生成] 這是針對 ${brand} 的 ${topic} 文案草稿。強調 ${type} 與 ${format} 的呈現方式。`;
        await new Promise(r => setTimeout(r, 500)); // 模擬延遲
      } else {
        // 這裡實作 OpenAI API 呼叫
        // const response = await openai.chat.completions.create({...})
        // generatedText = response.choices[0].message.content;
        console.log('⚠️ 請設定 OPENAI_API_KEY 以啟用真實 AI 生成。目前使用模擬模式。');
        generatedText = `[AI 生成] 這是針對 ${brand} 的 ${topic} 文案草稿。`;
      }

      // 5. 更新該列內容
      // 注意：Markdown 表格的 cell 可能包含特殊字元，需處理換行
      const cleanText = generatedText.replace(/\n/g, '<br>');

      // 重新組裝該列
      // 原始 line 分割後可能會有空白頭尾，需小心處理
      // 簡單做法：直接替換文案欄位
      // 但因為 split/join 可能會破壞格式，我們用 cells 陣列重組
      cells[copyIdx] = cleanText;

      // 重組為 Markdown row
      const newRow = '| ' + cells.join(' | ') + ' |';
      updatedBodyLines[i] = newRow;
      updateCount++;
    }

    if (updateCount > 0) {
      // 6. 寫回檔案
      const newContent = content.replace(match[2].trim(), updatedBodyLines.join('\n'));
      fs.writeFileSync(MARKDOWN_FILE_PATH, newContent, 'utf8');
      console.log(`✅ 已更新 ${updateCount} 筆文案到 Markdown 檔案。`);
      console.log('💡 記得執行 node Scripts/sync-sheets.js 同步到 Google Sheets！');
    } else {
      console.log('ℹ️ 沒有需要更新的文案。');
    }

  } catch (error) {
    console.error('❌ 生成失敗:', error.message);
  }
}

// 處理 CLI 參數
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
