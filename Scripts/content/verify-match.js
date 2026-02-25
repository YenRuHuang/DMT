const { google } = require('googleapis');
const config = require('../config');
const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;

async function verify() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  
  let allImages = [];
  async function traverse(folderId, p = '') {
    try {
      const res = await drive.files.list({ q: `'${folderId}' in parents and trashed = false`, fields: 'files(id, name, mimeType)' });
      for (const f of res.data.files) {
        if (f.mimeType === 'application/vnd.google-apps.folder') await traverse(f.id, `${p}${f.name}/`);
        else if (f.mimeType.startsWith('image/')) allImages.push({ id: f.id, name: f.name, path: `${p}${f.name}` });
      }
    } catch(e) {}
  }
  await traverse(IMAGE_FOLDER_ID);
  
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: config.SPREADSHEET_ID, range: 'Month1_排程!A2:H50' });
  const rows = res.data.values || [];
  
  let slideNum = 0;
  console.log("=== NEW EXACT MATCH AUDIT ===");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const dateStr = row[1];
    const brand = row[2];
    const format = row[4];
    const status = row[7] || '';
    
    if (format && format.includes('短影音')) {
      console.log(`⏭️  SKIP: ${dateStr} ${brand} [短影音]`);
      continue;
    }
    slideNum++;
    
    let targetMonth = parseInt(dateStr.substring(0, 2), 10);
    let targetDay = parseInt(dateStr.substring(3, 5), 10);
    const oldMatch = status.match(/使用\s*(\d{1,2})\/(\d{1,2})\s*舊圖/);
    if (oldMatch) { targetMonth = parseInt(oldMatch[1], 10); targetDay = parseInt(oldMatch[2], 10); }
    
    const bk = brand.includes('Neuramis') ? 'Neuramis' : brand.includes('Cooltech') ? 'Cooltech' : brand.includes('LPG') ? 'LPG' : brand;
    const exactP = new RegExp(`_${targetMonth}-${targetDay}${bk}`, 'i');
    const w5P = new RegExp(`W5_${targetMonth}-${targetDay}${bk}`, 'i');
    
    const febImages = allImages.filter(img => img.path && img.path.includes('二月'));
    let match = febImages.find(img => exactP.test(img.name) || w5P.test(img.name));
    if (!match) match = allImages.find(img => exactP.test(img.name));
    
    const matchName = match ? match.name : 'NONE';
    console.log(`Slide ${slideNum}: ${dateStr} ${brand} [${format}] → ${matchName}${oldMatch ? ` (舊圖 ${oldMatch[1]}/${oldMatch[2]})` : ''}`);
  }
}
verify();
