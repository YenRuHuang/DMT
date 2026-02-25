const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const config = require('../../config');

// Define Cycles to sync (Month System)
const CYCLES = [
  {
    dir: path.join(config.PROJECT_ROOT, 'Planning', 'Month1'),
    sheetTitle: 'Month1_文案細節'
  },
  {
    dir: path.join(config.PROJECT_ROOT, 'Output', 'Month2'),
    sheetTitle: 'Month2_文案細節'
  },
  {
    dir: path.join(config.PROJECT_ROOT, 'Output', 'Month3'),
    sheetTitle: 'Month3_文案細節'
  }
];

// Parser for January Content (Different Format)
function parseJanFile(content, week) {
  const items = [];

  // 1. Parse Jan Posts
  // Header: ## 📝 貼文 #1：Brand
  // Date: **發布日期**：...
  // Topic: **主題**：...
  // Copy: ### 文案 (Caption) -> ```...```
  // Visual: ### 視覺 Prompt (Nano Banana) -> ```...```
  const postStartRegex = /## 📝 貼文 #\d+：(.+)/g;
  let match;

  // We iterate by detecting headers and extracting blocks manually or via Regex loop
  // Since sections are well defined, let's use a block-based Regex
  // Flexible Jan Post Regex:
  // Header -> Date -> Topic -> Copy -> (Optional Visual)
  const postBlockRegex = /## 📝 貼文 #\d+：(.+)[\s\S]+?\*\*發布日期\*\*：(.+)[\s\S]+?\*\*主題\*\*：(.+)[\s\S]+?### 文案 \(Caption\)[\s\S]+?```([\s\S]+?)```(?:\n[\s\S]*?### 視覺 Prompt .+[\s\S]+?```([\s\S]+?)```)?/g;

  while ((match = postBlockRegex.exec(content)) !== null) {
    items.push({
      Week: week,
      Date: match[2]?.trim() || '',
      Brand: match[1]?.trim() || '',
      Type: '貼文 (Post)',
      Topic: match[3]?.trim() || '',
      Content: match[4]?.trim() || '',
      Visual: match[5]?.trim() || '',
      Interaction: ''
    });
  }

  // 2. Parse Jan Reels
  // Header: ## 🎬 短影音 #1：Brand
  // Date: **發布日期**：...
  // Topic: **主題**：...
  // Prompt: ### Veo 3.1 Prompt -> ```...``` or similar
  const reelBlockRegex = /## 🎬 短影音 #\d+：(.+)[\s\S]+?\*\*發布日期\*\*：(.+)[\s\S]+?\*\*主題\*\*：(.+)[\s\S]+?### [\s\S]+?Prompt[\s\S]+?```([\s\S]+?)```/g;

  while ((match = reelBlockRegex.exec(content)) !== null) {
    items.push({
      Week: week,
      Date: match[2]?.trim() || '',
      Brand: match[1]?.trim() || '',
      Type: '短影音 (Reel)',
      Topic: match[3]?.trim() || '',
      Content: match[4]?.trim() || '', // Use Prompt as Content/Script
      Visual: match[4]?.trim() || '', // Also matches visual prompt
      Interaction: ''
    });
  }

  // 3. Parse Jan Stories
  // Header: ## 📱 限動 #1：Brand
  // Date: **發布日期**：...
  // Topic: **主題**：...
  // Script: ### 腳本 -> ```...```
  const storyBlockRegex = /## 📱 限動 #\d+：(.+)[\s\S]+?\*\*發布日期\*\*：(.+)[\s\S]+?(?:\*\*類型\*\*：.+[\s\S]+?)?\*\*主題\*\*：(.+)[\s\S]+?### 腳本[\s\S]+?```([\s\S]+?)```/g;

  while ((match = storyBlockRegex.exec(content)) !== null) {
    items.push({
      Week: week,
      Date: match[2]?.trim() || '',
      Brand: match[1]?.trim() || '',
      Type: '限動 (Story)',
      Topic: match[3]?.trim() || '',
      Content: match[4]?.trim() || '',
      Visual: '',
      Interaction: ''
    });
  }

  return items;
}

function parseFile(filePath, isJan = false) {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  // Try to extract week from filename or use directory context if needed
  let week = 'Unknown';
  const weekMatch = filename.match(/W(\d+)/);
  if (weekMatch) {
    week = `W${weekMatch[1]}`;
  }

  if (isJan) {
    return parseJanFile(content, week);
  }

  const items = [];

  // 1. Parse Posts
  const postRegex = /### Post \d+: (.+)\s+\*\s+\*\*發布時間\*\*：(.+)\s+\*\s+\*\*主題\*\*：(.+)\s+(?:\*\s+\*\*視覺建議\*\*：([\s\S]+?)\s+)?\*\s+\*\*文案\*\*：([\s\S]*?)(?=\n---|###|$)/g;
  let match;
  while ((match = postRegex.exec(content)) !== null) {
    items.push({
      Week: week,
      Date: match[2]?.trim() || '',
      Brand: match[1].trim(),
      Type: '貼文 (Post)',
      Topic: match[3]?.trim() || '',
      Content: match[5]?.trim() || '',
      Visual: match[4]?.trim() || '',
      Interaction: ''
    });
  }

  // 2. Parse Reels
  const reelRegexRobust = /### Reel \d+: (.+)\s+\*\s+\*\*發布時間\*\*：(.+)\s+\*\s+\*\*主題\*\*：(.+)\s+\*\s+\*\*腳本\*\*：([\s\S]+?)(?:\s+\*\s+\*\*Visual Prompt \(for Veo\)\*\*：([\s\S]+?))?(?=\n---|###|$)/g;
  while ((match = reelRegexRobust.exec(content)) !== null) {
    items.push({
      Week: week,
      Date: match[2]?.trim() || '',
      Brand: match[1].trim(),
      Type: '短影音 (Reel)',
      Topic: match[3]?.trim() || '',
      Content: match[4]?.trim() || '',
      Visual: match[5]?.trim() || '',
      Interaction: ''
    });
  }

  // 3. Parse Stories
  const storySectionMatch = content.match(/## 📱 限時動態 \(Stories\)[\s\S]*?\|(.+)\|[\s\S]*?\|[-:|\s]+\|([\s\S]*?)(?=\n---|\n##|$)/);
  if (storySectionMatch) {
    const tableBody = storySectionMatch[2].trim();
    const lines = tableBody.split('\n');
    lines.forEach(line => {
      if (!line.trim() || !line.includes('|')) return;
      const cols = line.split('|').map(c => c.trim()).filter((c, i) => i > 0 && i < 6);
      if (cols.length >= 5) {
        items.push({
          Week: week,
          Date: cols[0],
          Brand: cols[1],
          Type: `限動 (Story) - ${cols[2]}`,
          Topic: '',
          Content: cols[3].replace(/<br>/g, '\n'),
          Visual: '',
          Interaction: cols[4].replace(/<br>/g, '\n')
        });
      }
    });
  }
  return items;
}

async function syncAllContent() {
  try {
    console.log('🚀 開始全月份文案細節同步...');

    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    for (const cycle of CYCLES) {
      console.log(`\n📅 處理週期: ${cycle.sheetTitle} (Path: ${cycle.dir})`);

      if (!fs.existsSync(cycle.dir)) {
        console.log(`⚠️ 目錄不存在，跳過: ${cycle.dir}`);
        continue;
      }

      // 1. Gather Data
      const files = fs.readdirSync(cycle.dir).filter(f => f.startsWith('Content_W') && f.endsWith('.md'));
      const allItems = [];

      console.log(`📄 找到 ${files.length} 個檔案`);
      files.forEach(f => {
        const p = path.join(cycle.dir, f);
        console.log(`   - 解析: ${f}`);
        const isJan = cycle.dir.includes('Month1');
        const parsed = parseFile(p, isJan);
        // console.log(`     -> Got ${parsed.length} items`);
        allItems.push(...parsed);
      });

      if (allItems.length === 0) {
        console.log(`⚠️ 無資料，跳過同步`);
        continue;
      }

      allItems.sort((a, b) => a.Date.localeCompare(b.Date));

      // Prepare Data
      const headers = ['週次', '日期', '品牌', '類型', '主題', '文案/腳本/內容', '視覺建議/Visual Prompt', '互動元件'];
      const values = [headers, ...allItems.map(item => [
        item.Week, item.Date, item.Brand, item.Type, item.Topic, item.Content, item.Visual, item.Interaction
      ])];

      // 2. Sync to Sheet
      // Check/Create Sheet
      const docInfo = await sheets.spreadsheets.get({ spreadsheetId: config.INTERNAL_SPREADSHEET_ID });
      let targetSheet = docInfo.data.sheets.find(s => s.properties.title === cycle.sheetTitle);

      if (!targetSheet) {
        console.log(`➕ 建立分頁: ${cycle.sheetTitle}...`);
        const addResp = await sheets.spreadsheets.batchUpdate({
          spreadsheetId: config.INTERNAL_SPREADSHEET_ID,
          resource: { requests: [{ addSheet: { properties: { title: cycle.sheetTitle } } }] }
        });
        targetSheet = addResp.data.replies[0].addSheet;
      }
      const sheetId = targetSheet.properties.sheetId;

      // Clear and Write
      await sheets.spreadsheets.values.clear({
        spreadsheetId: config.INTERNAL_SPREADSHEET_ID,
        range: cycle.sheetTitle,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: config.INTERNAL_SPREADSHEET_ID,
        range: `${cycle.sheetTitle}!A1`,
        valueInputOption: 'RAW',
        resource: { values: values },
      });

      // 3. Formatting (Standard + Alternating Colors)
      console.log(`✨ 美化表格中...`);

      // Basic Formats
      const requests = [
        {
          updateSheetProperties: {
            properties: { sheetId: sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: 'gridProperties.frozenRowCount'
          }
        },
        // Header: Dark Grey
        {
          repeatCell: {
            range: { sheetId: sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
          }
        },
        // Body: Wrap, Top Align, Borders
        {
          repeatCell: {
            range: { sheetId: sheetId, startRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                wrapStrategy: 'WRAP',
                verticalAlignment: 'TOP',
                borders: {
                  bottom: { style: 'SOLID', width: 1, color: { red: 0.8, green: 0.8, blue: 0.8 } }
                }
              }
            },
            fields: 'userEnteredFormat(wrapStrategy,verticalAlignment,borders)'
          }
        },
        // Column Widths (Adjusted for Readability)
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 60 }, fields: 'pixelSize' } }, // Week
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 120 }, fields: 'pixelSize' } }, // Date
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } }, // Brand
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 100 }, fields: 'pixelSize' } }, // Type
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } }, // Topic
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 500 }, fields: 'pixelSize' } }, // Content (Wider)
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 }, properties: { pixelSize: 350 }, fields: 'pixelSize' } }, // Visual
        { updateDimensionProperties: { range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: 7, endIndex: 8 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } }, // Interaction
      ];

      // Add Alternating Colors (Banding)
      // Note: Must delete existing banding if any, or just add new one if not exists.
      // Simplified: Add banding request. If it fails (overlaps), ignore.
      // Actually it's safer to not use addBanding in batch with others if we can't clear old one easily.
      // But 'repeatCell' overwrites formatting. Banding is separate.
      // Let's rely on standard cell backgrounds if banding is tricky via API without knowing ID.
      // Actually, we can just set background colors for even rows manually. 
      // Or, use addBanding. 
      // Let's use basic manual row coloring for simplicity and robustness.

      // Apply Alternating Row Colors (Grey for even rows)
      // We loop or use repeatCell with specific ranges, but that's hard for dynamic rows.
      // Let's skip complex banding and stick to borders/wrapping which solves "readability" mostly.
      // Wait, the user said "hard to read". Banding really helps.
      // I'll try to add a banding request.
      requests.push({
        addBanding: {
          banding: {
            range: { sheetId: sheetId, startRowIndex: 1 }, // Start from row 2
            rowProperties: {
              headerColor: { red: 1, green: 1, blue: 1 }, // Not used if startRowIndex skips header
              firstBandColor: { red: 1, green: 1, blue: 1 }, // White
              secondBandColor: { red: 0.95, green: 0.95, blue: 0.95 } // Light Grey
            }
          }
        }
      });

      // Execute Formatting
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: config.INTERNAL_SPREADSHEET_ID,
          resource: { requests: requests }
        });
      } catch (fmtErr) {
        // Ignore banding overlap errors
        if (!fmtErr.message.includes('overlaps')) {
          console.error('   ⚠️ Formatting Error:', fmtErr.message);
        }
        process.exit(1);
      }
      console.log(`   ✅ 處理完成`);
    }

    console.log(`\n🎉 全部同步完成！連結: https://docs.google.com/spreadsheets/d/${config.INTERNAL_SPREADSHEET_ID}`);

  } catch (e) {
    console.error('❌ Sync Failed:', e);
    process.exit(1);
  }
}

syncAllContent();
