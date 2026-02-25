const { google } = require('googleapis');
const config = require('../../config');

// Configuration
// NOTE: 此腳本為 Month1（2026-01）專用版本，使用 v3.0 以前的舊版排程試算表
const SCHEDULE_SHEET_ID = '1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8'; // legacy Month1
const SCHEDULE_GID = 894648926; // 2026_01_排程 (source of truth for dates)

const CONTENT_SHEET_ID = config.INTERNAL_SPREADSHEET_ID;
const CONTENT_GID = 1554548397; // 2026_01_文案細節 (source of copy)

const PRESENTATION_ID = '1Gqxzi2ro_A-s3drEHHbsz-Ca_TUxpAONbv476QMK2Gc'; // Month1 專用 slides（非當前 SLIDES_ID）
const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive'
      ]
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // 1. Read Schedule Sheet (dates are source of truth)
    const schedMeta = await sheets.spreadsheets.get({ spreadsheetId: SCHEDULE_SHEET_ID });
    const schedSheet = schedMeta.data.sheets.find(s => s.properties.sheetId === SCHEDULE_GID);
    const schedSheetName = schedSheet.properties.title;
    console.log(`Reading schedule from: ${schedSheetName}`);

    const schedRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SCHEDULE_SHEET_ID,
      range: `${schedSheetName}!A1:Z100`
    });
    const schedRows = schedRes.data.values;
    const schedHeaders = schedRows[0];
    const schedDateCol = schedHeaders.findIndex(h => h.includes('日期'));
    const schedBrandCol = schedHeaders.findIndex(h => h.includes('品牌'));
    const schedFormatCol = schedHeaders.findIndex(h => h.includes('格式'));
    const schedTopicCol = schedHeaders.findIndex(h => h.includes('主題'));

    // 2. Read Content Sheet (copy is source of truth)
    const contentMeta = await sheets.spreadsheets.get({ spreadsheetId: CONTENT_SHEET_ID });
    const contentSheet = contentMeta.data.sheets.find(s => s.properties.sheetId === CONTENT_GID);
    const contentSheetName = contentSheet.properties.title;
    console.log(`Reading content from: ${contentSheetName}`);

    const contentRes = await sheets.spreadsheets.values.get({
      spreadsheetId: CONTENT_SHEET_ID,
      range: `${contentSheetName}!A1:Z100`
    });
    const contentRows = contentRes.data.values;
    const contentHeaders = contentRows[0];
    const contentDateCol = contentHeaders.findIndex(h => h.includes('日期'));
    const contentBrandCol = contentHeaders.findIndex(h => h.includes('品牌'));
    const contentTypeCol = contentHeaders.findIndex(h => h.includes('類型'));
    const contentCopyCol = contentHeaders.findIndex(h => h.includes('文案') || h.includes('腳本'));

    // Build copy lookup as array for flexible matching
    const copyEntries = [];
    for (let i = 1; i < contentRows.length; i++) {
      const row = contentRows[i];
      if (!row[contentDateCol]) continue;
      copyEntries.push({
        date: row[contentDateCol].toLowerCase().replace(/\s/g, ''),
        brand: row[contentBrandCol] || '',
        copy: row[contentCopyCol] || '',
        type: row[contentTypeCol] || ''
      });
    }
    console.log(`Loaded ${copyEntries.length} copy entries.`);

    // Helper function to find copy by date and partial brand match
    function findCopy(schedDate, schedBrand) {
      const cleanDate = schedDate.toLowerCase().replace(/\s/g, '');
      const brandKeyword = schedBrand.includes('Neuramis') ? 'neuramis' :
        schedBrand.includes('Cooltech') ? 'cooltech' :
          schedBrand.includes('LPG') ? 'lpg' : schedBrand.toLowerCase();

      const entry = copyEntries.find(e => {
        const dateMatch = e.date === cleanDate;
        const brandMatch = e.brand.toLowerCase().includes(brandKeyword);
        return dateMatch && brandMatch;
      });
      return entry ? entry.copy : '';
    }

    // 3. Parse schedule into items
    const allItems = [];
    for (let i = 1; i < schedRows.length; i++) {
      const row = schedRows[i];
      if (!row[schedDateCol]) continue;
      const copy = findCopy(row[schedDateCol], row[schedBrandCol]);
      allItems.push({
        Date: row[schedDateCol] || '',
        Brand: row[schedBrandCol] || '',
        Type: row[schedFormatCol] || '',
        Topic: row[schedTopicCol] || '',
        Copy: copy
      });
    }
    console.log(`Found ${allItems.length} entries from schedule.`);

    // 4. Fetch Images from Drive
    console.log('Fetching images from Drive...');
    const driveImages = await listDriveImages(drive);
    console.log(`Creating lookup for ${driveImages.length} images.`);

    // 5. Clear Existing Slides
    console.log('Clearing existing slides...');
    const currentPres = await slides.presentations.get({ presentationId: PRESENTATION_ID });
    const existingSlides = currentPres.data.slides || [];

    // 6. Generate Slide Requests
    const requests = [];

    for (const item of allItems) {
      const slideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const titleId = `${slideId}_title`;
      const contentId = `${slideId}_content`;
      const metaId = `${slideId}_meta`;
      const imageId = `${slideId}_image`;

      const matchingImage = findMatchingImage(item, driveImages);
      const isPost = item.Type.includes('貼文');

      // Skip items without matching images
      if (!matchingImage) {
        continue;
      }

      // Create Slide
      requests.push({
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'BLANK' }
        }
      });

      // Title
      const typeLabel = item.Type.includes('限動') ? '【限動】' :
        item.Type.includes('貼文') ? '【貼文】' :
          item.Type.includes('短影音') ? '【短影音】' : `【${item.Type}】`;

      requests.push({
        createShape: {
          objectId: titleId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: { width: { magnitude: 600, unit: 'PT' }, height: { magnitude: 50, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 30, translateY: 20, unit: 'PT' }
          }
        }
      });
      requests.push({
        insertText: {
          objectId: titleId,
          text: `${typeLabel}${item.Brand} - ${item.Topic}`
        }
      });
      requests.push({
        updateTextStyle: {
          objectId: titleId,
          style: { fontSize: { magnitude: 18, unit: 'PT' }, bold: true },
          fields: 'fontSize,bold'
        }
      });

      // Image Area
      const imageX = isPost ? 380 : 100;
      const imageWidth = isPost ? 300 : 500;
      const imageHeight = isPost ? 280 : 300;

      if (matchingImage) {
        console.log(`   MATCH: ${item.Date} ${item.Brand} -> ${matchingImage.name}`);
        requests.push({
          createImage: {
            objectId: imageId,
            url: matchingImage.webContentLink,
            elementProperties: {
              pageObjectId: slideId,
              size: { width: { magnitude: imageWidth, unit: 'PT' }, height: { magnitude: imageHeight, unit: 'PT' } },
              transform: { scaleX: 1, scaleY: 1, translateX: imageX, translateY: 70, unit: 'PT' }
            }
          }
        });
      } else {
        requests.push({
          createShape: {
            objectId: imageId,
            shapeType: 'RECTANGLE',
            elementProperties: {
              pageObjectId: slideId,
              size: { width: { magnitude: imageWidth, unit: 'PT' }, height: { magnitude: imageHeight, unit: 'PT' } },
              transform: { scaleX: 1, scaleY: 1, translateX: imageX, translateY: 70, unit: 'PT' }
            }
          }
        });
        requests.push({
          insertText: {
            objectId: imageId,
            text: "\n\n\n[ 找不到對應圖片 ]\n(Image Not Found)"
          }
        });
      }

      // Content Text Box - Only for Posts (貼文)
      if (isPost && item.Copy) {
        // Clean copy: remove disclaimer lines
        let cleanCopy = item.Copy
          .replace(/---[\s\S]*?📍.*診所/g, '')
          .replace(/⚠️.*廣告/g, '')
          .replace(/📍.*診所/g, '')
          .trim();

        requests.push({
          createShape: {
            objectId: contentId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: { width: { magnitude: 340, unit: 'PT' }, height: { magnitude: 280, unit: 'PT' } },
              transform: { scaleX: 1, scaleY: 1, translateX: 30, translateY: 70, unit: 'PT' }
            }
          }
        });
        requests.push({
          insertText: {
            objectId: contentId,
            text: `【文案】\n${cleanCopy}`
          }
        });
        let fontSize = 8;
        if (item.Copy.length > 800) fontSize = 5;
        else if (item.Copy.length > 600) fontSize = 6;
        else if (item.Copy.length > 400) fontSize = 7;
        requests.push({
          updateTextStyle: {
            objectId: contentId,
            style: { fontSize: { magnitude: fontSize, unit: 'PT' } },
            fields: 'fontSize'
          }
        });
      }

      // Footer - Date
      requests.push({
        createShape: {
          objectId: metaId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: { width: { magnitude: 300, unit: 'PT' }, height: { magnitude: 30, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 30, translateY: 380, unit: 'PT' }
          }
        }
      });
      requests.push({
        insertText: {
          objectId: metaId,
          text: `預期上架時間：${item.Date}`
        }
      });
      requests.push({
        updateTextStyle: {
          objectId: metaId,
          style: { fontSize: { magnitude: 14, unit: 'PT' }, foregroundColor: { opaqueColor: { rgbColor: { red: 0.8, green: 0, blue: 0 } } }, bold: true },
          fields: 'fontSize,foregroundColor,bold'
        }
      });
    }

    // Delete old slides
    existingSlides.forEach(s => {
      requests.push({ deleteObject: { objectId: s.objectId } });
    });

    console.log('Sending batch update...');
    await slides.presentations.batchUpdate({
      presentationId: PRESENTATION_ID,
      resource: { requests }
    });
    console.log('Done.');

  } catch (e) {
    console.error('Error:', e);
  }
}

// Helper: List Drive Images (Recursive)
async function listDriveImages(drive) {
  const images = [];
  const res = await drive.files.list({
    q: `'${IMAGE_FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)'
  });

  for (const f of res.data.files) {
    if (f.mimeType === 'application/vnd.google-apps.folder') {
      const subRes = await drive.files.list({
        q: `'${f.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)'
      });
      for (const sf of subRes.data.files) {
        if (sf.mimeType === 'application/vnd.google-apps.folder') {
          console.log(`Deep scanning folder: ${sf.name}`);
          const deepRes = await drive.files.list({
            q: `'${sf.id}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webContentLink)'
          });
          deepRes.data.files.forEach(img => {
            if (img.mimeType.startsWith('image/')) {
              images.push(img);
            }
          });
        } else if (sf.mimeType.startsWith('image/')) {
          images.push(sf);
        }
      }
    } else if (f.mimeType.startsWith('image/')) {
      images.push(f);
    }
  }
  return images;
}

// Helper: Find Matching Image
function findMatchingImage(item, images) {
  const dateMatch = item.Date.match(/(\d+)\/(\d+)/);
  if (!dateMatch) return null;
  const m = parseInt(dateMatch[1]);
  const d = parseInt(dateMatch[2]);
  const dateStr = `${m}-${d}`;

  const brandKeyword = item.Brand.includes('Neuramis') ? 'Neuramis' :
    item.Brand.includes('Cooltech') ? 'Cooltech' :
      item.Brand.includes('LPG') ? 'LPG' : item.Brand;

  return images.find(img => {
    if (!img.name.includes(brandKeyword)) return false;
    if (img.name.includes(dateStr)) return true;
    return false;
  });
}

run();
