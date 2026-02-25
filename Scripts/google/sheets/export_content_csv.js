const fs = require('fs');
const path = require('path');
const config = require('../../config');

const CYCLE_DIR = path.join(config.PROJECT_ROOT, 'Output', '2026_02_Cycle');
const OUTPUT_FILE = path.join(CYCLE_DIR, 'Internal_Content_Detailed_List_2026_02.csv');

// Helper to escape CSV fields
function escapeCsv(field) {
  if (!field) return '';
  let stringField = String(field);
  // If contains quote, comma or newline, wrap in quotes and escape internal quotes
  if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r')) {
    stringField = stringField.replace(/"/g, '""');
    return `"${stringField}"`;
  }
  return stringField;
}

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  const weekMatch = filename.match(/W(\d+)/);
  const week = weekMatch ? `W${weekMatch[1]}` : 'Unknown';

  const items = [];

  // 1. Parse Posts
  // Regex logic: Find block starting with ### Post
  const postRegex = /### Post \d+: (.+)[\r\n]+(?:\* \*\*發布時間\*\*：(.+)[\r\n]+)?(?:\* \*\*主題\*\*：(.+)[\r\n]+)?(?:\* \*\*視覺建議\*\*：(.+)[\r\n]+)?(?:\* \*\*文案\*\*：([\s\S]*?))(?=\n---|\n##|$)/g;

  let match;
  while ((match = postRegex.exec(content)) !== null) {
    const brand = match[1].trim();
    const date = match[2]?.trim() || '';
    const topic = match[3]?.trim() || '';
    const visual = match[4]?.trim() || '';
    let copy = match[5]?.trim() || '';

    // Clean up copy formatting (remove extra bullets if needed, preserve newlines)

    items.push({
      Week: week,
      Date: date,
      Brand: brand,
      Type: '貼文 (Post)',
      Topic: topic,
      Content: copy,
      Visual: visual,
      Interaction: ''
    });
  }

  // 2. Parse Reels
  const reelRegex = /### Reel \d+: (.+)[\r\n]+(?:\* \*\*發布時間\*\*：(.+)[\r\n]+)?(?:\* \*\*主題\*\*：(.+)[\r\n]+)?(?:\* \*\*腳本\*\*：([\s\S]*?))(?:\* \*\*Visual Prompt \(for Veo\)\*\*：(.+)[\r\n]*)?(?=\n---|\n##|$)/g;

  while ((match = reelRegex.exec(content)) !== null) {
    const brand = match[1].trim();
    const date = match[2]?.trim() || '';
    const topic = match[3]?.trim() || '';
    const script = match[4]?.trim() || '';
    const prompt = match[5]?.trim() || '';

    items.push({
      Week: week,
      Date: date,
      Brand: brand,
      Type: '短影音 (Reel)',
      Topic: topic,
      Content: script,
      Visual: prompt, // Use Prompt as Visual
      Interaction: ''
    });
  }

  // 3. Parse Stories (Table)
  // Find Table section
  const storySectionMatch = content.match(/## 📱 限時動態 \(Stories\)[\s\S]*?\|(.+)\|[\s\S]*?\|[-:|\s]+\|([\s\S]*?)(?=\n---|\n##|$)/);
  if (storySectionMatch) {
    const tableBody = storySectionMatch[2].trim();
    const lines = tableBody.split('\n');
    lines.forEach(line => {
      if (!line.trim() || !line.includes('|')) return;
      // | 02/16 (一) | Cooltech | 投票 | 背景... | 投票... |
      const cols = line.split('|').map(c => c.trim()).filter((c, i) => i > 0 && i < 6);
      // Expected: Date, Brand, Format, Content, Interaction
      if (cols.length >= 5) {
        items.push({
          Week: week,
          Date: cols[0],
          Brand: cols[1],
          Type: `限動 (Story) - ${cols[2]}`,
          Topic: '', // Story often has no title, use content summary
          Content: cols[3].replace(/<br>/g, '\n'), // Content Summary
          Visual: '',
          Interaction: cols[4].replace(/<br>/g, '\n')
        });
      }
    });
  }

  return items;
}

// Main Execution
try {
  const files = fs.readdirSync(CYCLE_DIR).filter(f => f.startsWith('Content_W') && f.endsWith('.md'));
  const allItems = [];

  files.forEach(f => {
    console.log(`Processing ${f}...`);
    const items = parseFile(path.join(CYCLE_DIR, f));
    allItems.push(...items);
  });

  // Sort by Date (simple string sort might fail for dates, but filenames W1-W4 helps)
  // We rely on file order.

  // Write CSV
  const header = ['週次', '日期', '品牌', '類型', '主題', '文案/腳本/內容', '視覺建議/Visual Prompt', '互動元件'];
  const rows = allItems.map(item => {
    return [
      item.Week,
      item.Date,
      item.Brand,
      item.Type,
      item.Topic,
      item.Content,
      item.Visual,
      item.Interaction
    ].map(escapeCsv).join(',');
  });

  const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n'); // Add BOM for Excel
  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf8');

  console.log(`✅ CSV Exported to: ${OUTPUT_FILE}`);

} catch (e) {
  console.error('Error exporting CSV:', e);
  process.exit(1);
}
