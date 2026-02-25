const { google } = require('googleapis');
const config = require('../../config');

async function fetchW2() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: config.SPREADSHEET_ID,
        range: 'Month1_排程!A2:H50'
    });
    const rows = res.data.values || [];
    const w2Missing = rows.filter(r => r[0] === 'W2' && r[7] && r[7].includes('使用'));
    
    console.log("W2 Posts Needing New Copy for Old Images:");
    w2Missing.forEach(r => console.log(`${r[1]} | ${r[2]} | ${r[3]} | ${r[5]} | ${r[7]}`));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
fetchW2();
