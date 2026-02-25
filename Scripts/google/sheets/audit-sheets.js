const { google } = require('googleapis');
const config = require('../../config');

async function auditSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const masterRes = await sheets.spreadsheets.values.get({
      spreadsheetId: config.SPREADSHEET_ID,
      range: '2026_02_排程!A1:G40'
    });
    const masterRows = masterRes.data.values;
    if (masterRows && masterRows.length) {
      masterRows.forEach(row => {
        console.log(row.join(' | '));
      });
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
auditSheets();
