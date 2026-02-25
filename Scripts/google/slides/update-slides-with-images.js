const { google } = require('googleapis');
const config = require('../../config');

const PRESENTATION_ID = '1Gqxzi2ro_A-s3drEHHbsz-Ca_TUxpAONbv476QMK2Gc';

// 手動配對：根據 Drive 中實際存在的圖片
const IMAGE_MAPPING = {
  '2-10_Cooltech': 'https://drive.google.com/uc?export=download&id=',
  '2-10_Neuramis': 'https://drive.google.com/uc?export=download&id=',
  '2-11_Cooltech': 'https://drive.google.com/uc?export=download&id=',
  '2-11_LPG': 'https://drive.google.com/uc?export=download&id=',
  '2-12_Neuramis': 'https://drive.google.com/uc?export=download&id='
};

async function updateSlidesWithImages() {
  try {
    console.log('🔄 開始更新投影片圖片...\n');

    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/presentations', 'https://www.googleapis.com/auth/drive']
    });
    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // 1. 取得所有二月圖片的完整資訊（包含 webContentLink）
    console.log('📁 取得 Google Drive 圖片資訊...');
    const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;
    const imageMap = new Map();

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

        for (const sub of subRes.data.files) {
          if (sub.mimeType === 'application/vnd.google-apps.folder' && sub.name === '二月') {
            const deepRes = await drive.files.list({
              q: `'${sub.id}' in parents and trashed = false`,
              fields: 'files(id, name, mimeType, webContentLink)',
              pageSize: 100
            });
            deepRes.data.files.forEach(d => {
              if (d.mimeType.startsWith('image/')) {
                console.log(`   ✓ ${d.name}`);
                imageMap.set(d.name, d.webContentLink);
              }
            });
          }
        }
      }
    }

    console.log(`\n✅ 找到 ${imageMap.size} 張二月圖片\n`);

    // 2. 取得簡報並找出需要更新的投影片
    console.log('📋 檢查簡報投影片...');
    const presentation = await slides.presentations.get({
      presentationId: PRESENTATION_ID
    });

    const allSlides = presentation.data.slides || [];
    console.log(`   總共 ${allSlides.length} 張投影片\n`);

    // 3. 找出第 22-70 張投影片（二月內容）
    const febSlides = allSlides.slice(21); // 跳過前 21 張（一月）
    console.log(`🎯 處理 ${febSlides.length} 張二月投影片...\n`);

    const requests = [];
    let updateCount = 0;

    for (const slide of febSlides) {
      // 從投影片中提取標題來判斷日期和品牌
      const titleElement = slide.pageElements?.find(el =>
        el.shape?.text?.textElements?.some(te =>
          te.textRun?.content?.includes('【貼文】') ||
          te.textRun?.content?.includes('【短影音】') ||
          te.textRun?.content?.includes('【限動】')
        )
      );

      if (!titleElement) continue;

      const titleText = titleElement.shape.text.textElements
        .map(te => te.textRun?.content || '')
        .join('');

      // 提取品牌
      let brand = '';
      if (titleText.includes('Neuramis')) brand = 'Neuramis';
      else if (titleText.includes('Cooltech')) brand = 'Cooltech';
      else if (titleText.includes('LPG')) brand = 'LPG';

      if (!brand) continue;

      // 從投影片的 footer 提取日期
      const footerElement = slide.pageElements?.find(el =>
        el.shape?.text?.textElements?.some(te =>
          te.textRun?.content?.includes('預期上架時間')
        )
      );

      if (!footerElement) continue;

      const footerText = footerElement.shape.text.textElements
        .map(te => te.textRun?.content || '')
        .join('');

      // 提取日期 "02/10" -> "2-10"
      const dateMatch = footerText.match(/(\d+)\/(\d+)/);
      if (!dateMatch) continue;

      const month = parseInt(dateMatch[1]);
      const day = parseInt(dateMatch[2]);
      const dateKey = `${month}-${day}`;

      // 找對應的圖片
      const imageName = `二月醫美_${dateKey}${brand}.jpg`;
      const imageUrl = imageMap.get(imageName);

      if (imageUrl) {
        console.log(`   ✓ 配對成功: ${dateKey} ${brand} → ${imageName}`);

        // 找到圖片佔位符並替換
        const imageElement = slide.pageElements?.find(el =>
          el.shape?.shapeType === 'RECTANGLE' &&
          el.shape?.text?.textElements?.some(te =>
            te.textRun?.content?.includes('找不到對應圖片')
          )
        );

        if (imageElement) {
          // 刪除舊的佔位符
          requests.push({
            deleteObject: { objectId: imageElement.objectId }
          });

          // 新增圖片
          const newImageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          requests.push({
            createImage: {
              objectId: newImageId,
              url: imageUrl,
              elementProperties: {
                pageObjectId: slide.objectId,
                size: { width: { magnitude: 320, unit: 'PT' }, height: { magnitude: 280, unit: 'PT' } },
                transform: { scaleX: 1, scaleY: 1, translateX: 380, translateY: 70, unit: 'PT' }
              }
            }
          });

          updateCount++;
        }
      }
    }

    // 4. 執行更新
    if (requests.length > 0) {
      console.log(`\n⚡ 執行批次更新（${updateCount} 張投影片）...`);
      await slides.presentations.batchUpdate({
        presentationId: PRESENTATION_ID,
        resource: { requests: requests }
      });
      console.log(`\n✅ 成功更新 ${updateCount} 張投影片的圖片！`);
    } else {
      console.log('\n⚠️  沒有找到需要更新的投影片');
    }

    console.log(`\n🔗 查看簡報: https://docs.google.com/presentation/d/${PRESENTATION_ID}`);

  } catch (e) {
    console.error('❌ 錯誤:', e.message);
    if (e.response) {
      console.error('詳細:', JSON.stringify(e.response.data, null, 2));
    }
    process.exit(1);
  }
}

updateSlidesWithImages();
