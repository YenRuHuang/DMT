const { google } = require('googleapis');
const config = require('../../config');

// CONFIGURATION FOR MONTH - APPEND MODE
const PRESENTATION_ID = '1Gqxzi2ro_A-s3drEHHbsz-Ca_TUxpAONbv476QMK2Gc';
const SPREADSHEET_ID = config.INTERNAL_SPREADSHEET_ID;
// Default to Month2, can be extended via CLI args later
const TARGET_MONTH = 'Month2';
const SHEET_NAME = `${TARGET_MONTH}_文案細節`;
const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;

// Read content from spreadsheet
async function readSpreadsheet(sheets) {
  console.log(`📖 讀取 ${TARGET_MONTH} 試算表內容...`);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:G100` // Skip header row
  });

  const rows = res.data.values || [];
  const items = [];

  for (const row of rows) {
    if (!row[0] || !row[1]) continue; // Skip empty rows

    const type = row[3] || ''; // Column D: 類型

    items.push({
      Week: row[0] || '',      // Column A: 週次
      Date: row[1] || '',      // Column B: 日期
      Brand: row[2] || '',     // Column C: 品牌
      Type: type.includes('貼文') ? '貼文' :
        type.includes('限動') ? '限動' :
          type.includes('短影音') ? '短影音' : type,
      Topic: row[4] || '',     // Column E: 主題
      Content: row[5] || '',   // Column F: 文案
      Visual: ''
    });
  }

  console.log(`   ✓ 找到 ${items.length} 項 ${TARGET_MONTH} 內容\n`);
  return items;
}

// Drive Image Listing
async function listDriveImages(drive) {
  console.log('📁 正在從 Google Drive 取得圖片清單...');
  const images = [];

  const res = await drive.files.list({
    q: `'${IMAGE_FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)'
  });

  for (const f of res.data.files) {
    if (f.mimeType === 'application/vnd.google-apps.folder') {
      const subRes = await drive.files.list({
        q: `'${f.id}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, webContentLink)'
      });

      for (const sub of subRes.data.files) {
        if (sub.mimeType === 'application/vnd.google-apps.folder') {
          console.log(`   📂 掃描子資料夾: ${sub.name} `);
          const deepRes = await drive.files.list({
            q: `'${sub.id}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webContentLink)',
            pageSize: 100
          });
          deepRes.data.files.forEach(d => {
            if (d.mimeType.startsWith('image/')) images.push(d);
          });
        } else if (sub.mimeType.startsWith('image/')) {
          images.push(sub);
        }
      }
    } else if (f.mimeType.startsWith('image/')) {
      images.push(f);
    }
  }

  console.log(`✅ 找到 ${images.length} 張圖片\n`);
  return images;
}

// Image matching logic (same as January)
function findMatchingImage(item, images, usedImages = new Set()) {
  const dateMatch = item.Date.match(/(\d+)\/(\d+)/);
  if (!dateMatch) return null;

  const month = parseInt(dateMatch[1]);
  const day = parseInt(dateMatch[2]);

  const brandKeyword = item.Brand.includes('Neuramis') ? 'Neuramis' :
    item.Brand.includes('Cooltech') ? 'Cooltech' :
      item.Brand.includes('LPG') ? 'LPG' : item.Brand;

  const exactPattern = `${month}-${day}${brandKeyword}`;
  const matchedImage = images.find(img =>
    img.name.includes(exactPattern) && !usedImages.has(img.id)
  );

  if (matchedImage) {
    usedImages.add(matchedImage.id);
    return matchedImage;
  }

  return null;
}

async function addMonthSlides() {
  try {
    console.log(`🚀 開始新增 ${TARGET_MONTH} 投影片...\n`);

    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/presentations', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Read Month content from spreadsheet
    const allItems = await readSpreadsheet(sheets);

    // 2. Fetch images
    const driveImages = await listDriveImages(drive);

    // 3. Check existing presentation
    console.log('📋 檢查現有簡報...');
    const currentPres = await slides.presentations.get({ presentationId: PRESENTATION_ID });
    const existingSlides = currentPres.data.slides || [];
    console.log(`   現有投影片數量: ${existingSlides.length} 張（舊版內容將被保留）\n`);

    // 4. Generate Requests
    console.log(`🎨 生成 ${TARGET_MONTH} 投影片...\n`);
    const requests = [];
    const usedImages = new Set();
    let generatedSlideCount = 0;

    for (const item of allItems) {
      // SKIP REELS
      if (item.Type && item.Type.includes('短影音')) {
        console.log(`   ⏭️  ${item.Date} ${item.Brand} (短影音) → 跳過不生成投影片`);
        continue;
      }

      generatedSlideCount++;

      const slideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const titleId = `${slideId}_title`;
      const contentId = `${slideId}_content`;
      const metaId = `${slideId}_meta`;
      const imageId = `${slideId}_image`;

      const matchingImage = findMatchingImage(item, driveImages, usedImages);

      if (matchingImage) {
        console.log(`   ✓ ${item.Date} ${item.Brand} → 🖼️  ${matchingImage.name}`);
      } else {
        console.log(`   ⚠️  ${item.Date} ${item.Brand} → ❌ 找不到對應圖片`);
      }

      // Create Slide
      requests.push({
        createSlide: {
          objectId: slideId,
          slideLayoutReference: { predefinedLayout: 'BLANK' }
        }
      });

      // Title
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
          text: `【${item.Type}】${item.Brand} - ${item.Topic}`
        }
      });
      requests.push({
        updateTextStyle: {
          objectId: titleId,
          style: { fontSize: { magnitude: 18, unit: 'PT' }, bold: true, foregroundColor: { opaqueColor: { themeColor: 'TEXT1' } } },
          fields: 'fontSize,bold,foregroundColor'
        }
      });

      // Content - SKIP for Stories
      const isStory = item.Type && item.Type.includes('限動');

      if (!isStory && item.Content) {
        let contentText = `【文案】\n${item.Content}`;
        let contentFontSize = 8;
        if (contentText.length > 1000) contentFontSize = 5;
        else if (contentText.length > 800) contentFontSize = 6;
        else if (contentText.length > 600) contentFontSize = 7;

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
            text: contentText
          }
        });
        requests.push({
          updateTextStyle: {
            objectId: contentId,
            style: { fontSize: { magnitude: contentFontSize, unit: 'PT' } },
            fields: 'fontSize'
          }
        });
      }

      // Image - SAME SIZE AS JANUARY (300x300, positioned at 420,80)
      if (matchingImage) {
        const imageUrl = `https://drive.google.com/uc?export=view&id=${matchingImage.id}`;
        requests.push({
          createImage: {
            objectId: imageId,
            url: imageUrl,
            elementProperties: {
              pageObjectId: slideId,
              size: { width: { magnitude: 300, unit: 'PT' }, height: { magnitude: 300, unit: 'PT' } },
              transform: { scaleX: 1, scaleY: 1, translateX: 420, translateY: 80, unit: 'PT' }
            }
          }
        });
      } else {
        requests.push({
          createShape: {
            objectId: metaId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: { width: { magnitude: 300, unit: 'PT' }, height: { magnitude: 100, unit: 'PT' } },
              transform: { scaleX: 1, scaleY: 1, translateX: 420, translateY: 150, unit: 'PT' }
            }
          }
        });
        requests.push({
          insertText: {
            objectId: metaId,
            text: `⚠️ 找不到對應圖片\n\n預期檔名：\n${item.Date.replace(/\//g, '-')}${item.Brand.split(' ')[0]}.jpg`
          }
        });
        requests.push({
          updateTextStyle: {
            objectId: metaId,
            style: { fontSize: { magnitude: 12, unit: 'PT' }, foregroundColor: { opaqueColor: { rgbColor: { red: 0.8, green: 0, blue: 0 } } }, bold: true },
            fields: 'fontSize,foregroundColor,bold'
          }
        });
      }
    }

    // Execute batch update
    console.log(`\n⚡ 執行批次更新（新增 ${generatedSlideCount} 張投影片）...\n`);
    await slides.presentations.batchUpdate({
      presentationId: PRESENTATION_ID,
      resource: { requests: requests }
    });

    const finalPres = await slides.presentations.get({ presentationId: PRESENTATION_ID });
    const totalSlides = finalPres.data.slides.length;
    const reelsSkipped = allItems.length - generatedSlideCount;

    console.log(`✅ ${TARGET_MONTH} 投影片新增完成！`);
    console.log(`📊 簡報現在共有 ${totalSlides} 張投影片`);
    console.log(`   - 舊有: ${existingSlides.length} 張（保留）`);
    console.log(`   - 新增: ${generatedSlideCount} 張（已跳過 ${reelsSkipped} 個短影音）\n`);
    console.log(`🔗 查看簡報: https://docs.google.com/presentation/d/1Gqxzi2ro_A-s3drEHHbsz-Ca_TUxpAONbv476QMK2Gc\n`);

  } catch (e) {
    console.error(e);
  }
}

addMonthSlides();
