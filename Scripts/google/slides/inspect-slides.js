const { google } = require('googleapis');
const config = require('../../config');

// 設定
const CREDENTIALS_PATH = config.CREDENTIALS_PATH;
const PRESENTATION_ID = config.SLIDES_ID;

async function inspectSlides() {
  try {
    console.log('🔍 開始檢查 Google Slides 結構...');

    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/presentations'],
    });

    const slides = google.slides({ version: 'v1', auth });

    const presentation = await slides.presentations.get({
      presentationId: PRESENTATION_ID
    });

    console.log(`📊 簡報標題: ${presentation.data.title}`);
    console.log('-----------------------------------');

    presentation.data.slides.forEach((slide, index) => {
      console.log(`Slide #${index + 1} (ID: ${slide.objectId})`);

      if (slide.pageElements) {
        slide.pageElements.forEach((element, eIndex) => {
          if (element.shape && element.shape.text) {
            const textContent = element.shape.text.textElements
              .map(t => t.textRun ? t.textRun.content : '')
              .join('')
              .trim();

            if (textContent) {
              console.log(`  - Element #${eIndex} (${element.objectId}): "${textContent.substring(0, 50)}..."`);
            }
          } else if (element.table) {
            console.log(`  - Element #${eIndex} (${element.objectId}): [Table] ${element.table.rows} rows x ${element.table.columns} cols`);
          }
        });
      }
      console.log('-----------------------------------');
    });

  } catch (error) {
    console.error('❌ 檢查失敗:', error.message);
  }
}

inspectSlides();
