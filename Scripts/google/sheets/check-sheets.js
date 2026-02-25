const { google } = require('googleapis');
const config = require('../../config');

async function checkSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const metaRes = await sheets.spreadsheets.get({ spreadsheetId: config.SPREADSHEET_ID });
    console.log("Master Sheet Tabs:");
    metaRes.data.sheets.forEach(s => console.log(`- ${s.properties.title}`));
  } catch (err) {
    console.error('Error:', err);
  }
}
checkSheets();
