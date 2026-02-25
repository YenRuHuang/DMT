const { google } = require('googleapis');
const config = require('../../config');

const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;

async function writeMapping() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
  });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Get all images
  console.log("📂 Scanning Drive...");
  let allImages = [];
  async function traverse(folderId, p = '') {
    try {
      const res = await drive.files.list({ q: `'${folderId}' in parents and trashed = false`, fields: 'files(id, name, mimeType)', pageSize: 200 });
      for (const f of res.data.files) {
        if (f.mimeType === 'application/vnd.google-apps.folder') await traverse(f.id, `${p}${f.name}/`);
        else if (f.mimeType.startsWith('image/')) allImages.push({ id: f.id, name: f.name, path: `${p}${f.name}` });
      }
    } catch (e) { }
  }
  await traverse(IMAGE_FOLDER_ID);
  console.log(`Found ${allImages.length} images.`);

  // 2. Get schedule
  const sheetRes = await sheets.spreadsheets.values.get({
    spreadsheetId: config.SPREADSHEET_ID,
    range: `${config.SHEET_NAME}!A2:H100`
  });
  const rows = sheetRes.data.values || [];

  // 3. Build mapping for each row
  const usedImageIds = new Set();
  const mappingRows = []; // Each: [週次, 日期, 品牌, 格式, 標準檔名, 原檔名, Drive FileID, Drive URL]

  for (const row of rows) {
    const week = row[0];
    const dateStr = row[1];
    const brand = row[2];
    const format = row[4];
    const status = row[7] || '';

    if (format && format.includes('短影音')) {
      mappingRows.push([week, dateStr, brand, format, '(短影音-略)', '', '', '']);
      continue;
    }

    let targetMonth = parseInt(dateStr.substring(0, 2), 10);
    let targetDay = parseInt(dateStr.substring(3, 5), 10);
    const oldMatch = status.match(/使用\s*(\d{1,2})\/(\d{1,2})\s*舊圖/);
    if (oldMatch) { targetMonth = parseInt(oldMatch[1], 10); targetDay = parseInt(oldMatch[2], 10); }

    const bk = brand.includes('Neuramis') ? 'Neuramis' : brand.includes('Cooltech') ? 'Cooltech' : brand.includes('LPG') ? 'LPG' : brand;
    const exactP = new RegExp(`_${targetMonth}-${targetDay}${bk}`, 'i');
    const febImages = allImages.filter(img => img.path && img.path.includes('二月'));
    let match = febImages.find(img => exactP.test(img.name) && !usedImageIds.has(img.id));
    if (!match) match = allImages.find(img => exactP.test(img.name) && !usedImageIds.has(img.id));

    const mm = dateStr.substring(0, 2);
    const dd = dateStr.substring(3, 5);
    const stdName = `M1_${week}_${mm}${dd}_${bk}_${format}`;

    if (match) {
      usedImageIds.add(match.id);
      mappingRows.push([week, dateStr, brand, format, stdName, match.name, match.id, `https://drive.google.com/uc?id=${match.id}`]);
    } else {
      mappingRows.push([week, dateStr, brand, format, stdName, '(待補)', '', '']);
    }
  }

  // 4. Create or update a "圖片對照" tab in the new sheet
  const spreadsheetId = config.SPREADSHEET_ID;
  const tabName = '圖片對照';

  // Check if tab exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTab = meta.data.sheets.find(s => s.properties.title === tabName);
  if (!existingTab) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] }
    });
    console.log(`Created tab: ${tabName}`);
  }

  // Write header + data
  const header = ['週次', '日期', '品牌', '格式', '標準檔名', '雲端原檔名', 'Drive File ID', '圖片連結'];
  const allData = [header, ...mappingRows];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: allData }
  });

  // Freeze header
  const newMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const tabId = newMeta.data.sheets.find(s => s.properties.title === tabName).properties.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { updateSheetProperties: { properties: { sheetId: tabId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
        {
          repeatCell: {
            range: { sheetId: tabId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
            cell: { userEnteredFormat: { backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true } } },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }
      ]
    }
  });

  const matched = mappingRows.filter(r => r[6] && r[6] !== '');
  const notMatched = mappingRows.filter(r => r[5] === '(待補)');
  console.log(`\n✅ Wrote ${mappingRows.length} rows to '${tabName}' tab.`);
  console.log(`   Matched: ${matched.length} images`);
  console.log(`   Pending: ${notMatched.length} images still needed`);
}

writeMapping().catch(err => {
  console.error('❌ 錯誤:', err.message);
  process.exit(1);
});
