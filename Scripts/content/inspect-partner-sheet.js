const { google } = require('googleapis');
const config = require('../config');

// USE MAIN SPREADSHEET ID (Target)
const TARGET_ID = config.SPREADSHEET_ID;
const TARGET_SHEET_NAME = '2026_02_排程';

async function inspectTarget() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log(`📖 Inspecting Target Sheet: ${TARGET_SHEET_NAME} (${TARGET_ID})...`);

    // 1. Get Sheet Properties & Conditional Formats (Need 'fields' or 'includeGridData')
    // requesting fields: sheets(properties, conditionalFormats, data(rowData(values(formattedValue, userEnteredFormat, effectiveFormat))))
    const sheetResp = await sheets.spreadsheets.get({
      spreadsheetId: TARGET_ID,
      ranges: [`${TARGET_SHEET_NAME}!A1:J2`],
      includeGridData: true
    });

    const sheet = sheetResp.data.sheets[0];
    if (!sheet) {
      console.log('❌ Sheet not found!');
      return;
    }

    console.log(`Title: ${sheet.properties.title}`);

    // 2. Check Headers (Row 1)
    if (sheet.data && sheet.data[0].rowData && sheet.data[0].rowData.length > 0) {
      const headerRow = sheet.data[0].rowData[0].values;
      const headers = headerRow.map(c => c.formattedValue);
      console.log('\nHeaders:', headers);
    } else {
      console.log('No data found.');
    }

    // 3. Check Conditional Formats
    const rules = sheet.conditionalFormats;
    if (rules && rules.length > 0) {
      console.log(`\n✅ Found ${rules.length} Conditional Format Rules:`);
      rules.forEach((r, i) => {
        if (r.booleanRule) {
          const cond = r.booleanRule.condition;
          const fmt = r.booleanRule.format;
          console.log(`  [${i}] Condition: ${cond.type} ${cond.values ? JSON.stringify(cond.values) : ''}`);
          console.log(`      Format BG: ${JSON.stringify(fmt.backgroundColor)}`);
        } else {
          console.log(`  [${i}] Gradient Rule`);
        }
      });
    } else {
      console.log('\n❌ No Conditional Format Rules found on this sheet.');
    }

    // 4. Check a Data Row (Row 2) for effective format
    if (sheet.data[0].rowData.length > 1) {
      const row2 = sheet.data[0].rowData[1].values;
      console.log('\nRow 2 Data First Few Cols:');
      console.log('Type (Col D):', row2[3]?.formattedValue);
      console.log('Format (Col E):', row2[4]?.formattedValue);

      // Colors
      row2.forEach((cell, idx) => {
        const bg = cell.effectiveFormat?.backgroundColor;
        if (bg) {
          // Ignore White (1,1,1)
          if (bg.red !== 1 || bg.green !== 1 || bg.blue !== 1) {
            console.log(`  Col ${idx} has distinct BG: R=${bg.red}, G=${bg.green}, B=${bg.blue}`);
          }
        }
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

inspectTarget();
