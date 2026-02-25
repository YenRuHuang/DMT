const { google } = require('googleapis');
const config = require('../../config');

const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;

// Brand name mapping — English to Chinese display names
const BRAND_DISPLAY = {
  'Neuramis': 'Neuramis',
  'Cooltech': '酷特冷凍減脂',
  'LPG': 'LPG'
};

// Brand keyword for matching old filenames (still English in Drive)
function getBrandKeyword(brand) {
  if (brand.includes('Neuramis')) return 'Neuramis';
  if (brand.includes('Cooltech') || brand.includes('酷特')) return 'Cooltech';
  if (brand.includes('LPG')) return 'LPG';
  return brand;
}

function getBrandDisplayName(brand) {
  const kw = getBrandKeyword(brand);
  return BRAND_DISPLAY[kw] || brand;
}

async function batchRename() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
  });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Get all images from Drive
  console.log("📂 Scanning Drive for all images...");
  let allImages = [];
  async function traverse(folderId, p = '') {
    try {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
        pageSize: 200
      });
      for (const f of res.data.files) {
        if (f.mimeType === 'application/vnd.google-apps.folder') {
          await traverse(f.id, `${p}${f.name}/`);
        } else if (f.mimeType.startsWith('image/')) {
          allImages.push({ id: f.id, name: f.name, path: `${p}${f.name}` });
        }
      }
    } catch (e) {
      console.error(`Error traversing: ${e.message}`);
    }
  }
  await traverse(IMAGE_FOLDER_ID);
  console.log(`Found ${allImages.length} images.\n`);

  // 2. Get the Month1 schedule
  console.log("📊 Reading Month1_排程...");
  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId: config.SPREADSHEET_ID,
    range: 'Month1_排程!A2:H100'
  });
  const rows = sheetRes.data.values || [];

  // 3. Match and build rename operations
  const usedImageIds = new Set();
  const renameOps = [];
  const mappingRows = []; // For updating the 圖片對照 tab

  for (const row of rows) {
    const week = row[0];
    const dateStr = row[1];
    const brand = row[2];
    const format = row[4];
    const status = row[7] || '';

    const brandKw = getBrandKeyword(brand);
    const brandDisplay = getBrandDisplayName(brand);
    const mm = dateStr.substring(0, 2);
    const dd = dateStr.substring(3, 5);

    if (format && format.includes('短影音')) {
      mappingRows.push([week, dateStr, brandDisplay, format, '(短影音-略)', '', '', '']);
      continue;
    }

    // Determine target image date
    let targetMonth = parseInt(mm, 10);
    let targetDay = parseInt(dd, 10);
    const oldMatch = status.match(/使用\s*(\d{1,2})\/(\d{1,2})\s*舊圖/);
    if (oldMatch) {
      targetMonth = parseInt(oldMatch[1], 10);
      targetDay = parseInt(oldMatch[2], 10);
    }

    // EXACT match regex using old English brand keyword
    const exactPattern = new RegExp(`_${targetMonth}-${targetDay}${brandKw}`, 'i');
    const febImages = allImages.filter(img => img.path && img.path.includes('二月'));
    let match = febImages.find(img => exactPattern.test(img.name) && !usedImageIds.has(img.id));
    if (!match) match = allImages.find(img => exactPattern.test(img.name) && !usedImageIds.has(img.id));

    // New filename with Chinese brand name
    const ext = match ? match.name.split('.').pop() : 'jpg';
    const newName = `M1_${week}_${mm}${dd}_${brandDisplay}_${format}.${ext}`;

    if (match) {
      usedImageIds.add(match.id);
      renameOps.push({ imageId: match.id, oldName: match.name, newName, rowInfo: `${dateStr} ${brandDisplay} [${format}]` });
      mappingRows.push([week, dateStr, brandDisplay, format, newName, match.name, match.id, `https://drive.google.com/uc?id=${match.id}`]);
    } else {
      mappingRows.push([week, dateStr, brandDisplay, format, newName.replace(`.${ext}`, ''), '(待補)', '', '']);
    }
  }

  // 4. Report
  console.log(`\n=== RENAME PLAN ===`);
  console.log(`Will rename: ${renameOps.length} images\n`);
  renameOps.forEach(op => {
    console.log(`✏️  ${op.oldName}`);
    console.log(`   → ${op.newName}`);
    console.log(`   (${op.rowInfo})\n`);
  });

  // 5. Execute renames
  console.log("🚀 Executing renames...");
  let successCount = 0;
  for (const op of renameOps) {
    try {
      await drive.files.update({ fileId: op.imageId, requestBody: { name: op.newName } });
      successCount++;
      console.log(`  ✅ ${op.oldName} → ${op.newName}`);
    } catch (e) {
      console.error(`  ❌ ${op.oldName}: ${e.message}`);
    }
  }
  console.log(`\nRenamed ${successCount}/${renameOps.length} images.\n`);

  // 6. Update 圖片對照 tab
  console.log("📊 Updating 圖片對照 tab...");
  const header = ['週次', '日期', '品牌', '格式', '標準檔名', '雲端原檔名', 'Drive File ID', '圖片連結'];
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.SPREADSHEET_ID,
    range: "'圖片對照'!A1",
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [header, ...mappingRows] }
  });

  const matched = mappingRows.filter(r => r[6] && r[6] !== '');
  const pending = mappingRows.filter(r => r[5] === '(待補)');
  console.log(`✅ Updated 圖片對照 tab: ${matched.length} matched, ${pending.length} pending.\n`);
  console.log(`✅ All done! Renamed ${successCount} images, updated Sheet.`);
}

batchRename();
