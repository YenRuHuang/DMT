const { google } = require('googleapis');
const config = require('../../config');

// v3.0 以前的舊版試算表 ID（2026-01 月前的歷史資料，僅供稽核用途）
const LEGACY_SPREADSHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8';

async function readBoth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. OLD sheet (legacy v3.0 以前) — check what tabs exist
  console.log("=== OLD SHEET (legacy) ===");
  try {
    const oldMeta = await sheets.spreadsheets.get({ spreadsheetId: LEGACY_SPREADSHEET_ID });
    const oldTabs = oldMeta.data.sheets.map(s => `${s.properties.title} (gid:${s.properties.sheetId})`);
    console.log("Tabs:", oldTabs.join(', '));

    // Read the tab with gid=894648926
    for (const sheet of oldMeta.data.sheets) {
      if (sheet.properties.sheetId === 894648926) {
        const tabName = sheet.properties.title;
        console.log(`\nReading tab: ${tabName}`);
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: LEGACY_SPREADSHEET_ID,
          range: `'${tabName}'!A1:J20`
        });
        const rows = res.data.values || [];
        rows.forEach((r, i) => console.log(`  Row${i}: ${r.join(' | ')}`));
      }
    }
  } catch (e) {
    console.error("Old sheet error:", e.message);
    process.exit(1);
  }

  // 2. 當前試算表 — 主排程
  console.log("\n=== CURRENT SHEET ===");
  try {
    const newMeta = await sheets.spreadsheets.get({ spreadsheetId: config.SPREADSHEET_ID });
    const newTabs = newMeta.data.sheets.map(s => `${s.properties.title} (gid:${s.properties.sheetId})`);
    console.log("Tabs:", newTabs.join(', '));

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.SPREADSHEET_ID,
      range: `${config.SHEET_NAME}!A1:H5`
    });
    console.log("First 5 rows:", res.data.values?.length);
  } catch (e) {
    console.error("Current sheet error:", e.message);
    process.exit(1);
  }

  // 3. List current Drive images with full paths
  console.log("\n=== CURRENT DRIVE IMAGES ===");
  const drive = google.drive({ version: 'v3', auth });
  const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;
  let allImages = [];
  async function traverse(folderId, p = '') {
    try {
      const res = await drive.files.list({ q: `'${folderId}' in parents and trashed = false`, fields: 'files(id, name, mimeType, modifiedTime)', orderBy: 'name' });
      for (const f of res.data.files) {
        if (f.mimeType === 'application/vnd.google-apps.folder') await traverse(f.id, `${p}${f.name}/`);
        else if (f.mimeType.startsWith('image/')) allImages.push({ id: f.id, name: f.name, path: `${p}${f.name}`, modified: f.modifiedTime });
      }
    } catch(e) {}
  }
  await traverse(IMAGE_FOLDER_ID);
  
  // Group by folder
  const byFolder = {};
  allImages.forEach(img => {
    const folder = img.path.split('/').slice(0, -1).join('/');
    if (!byFolder[folder]) byFolder[folder] = [];
    byFolder[folder].push(img);
  });
  
  Object.keys(byFolder).sort().forEach(folder => {
    console.log(`\n📂 ${folder}/`);
    byFolder[folder].forEach(img => console.log(`  ${img.name} (${img.modified?.substring(0,10)})`));
  });
  console.log(`\nTotal images: ${allImages.length}`);
}
readBoth();
