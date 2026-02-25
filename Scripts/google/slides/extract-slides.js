const { google } = require('googleapis');
const config = require('../../config');

async function readSlides() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/presentations.readonly'],
  });
  const slides = google.slides({ version: 'v1', auth });

  try {
    const res = await slides.presentations.get({
      presentationId: '1Gqxzi2ro_A-s3drEHHbsz-Ca_TUxpAONbv476QMK2Gc',
    });

    // Get slides 6 to 20 (index 5 to 19)
    const targetSlides = res.data.slides.slice(5, 20);

    let allText = [];
    targetSlides.forEach((slide, index) => {
      let slideText = `--- Slide ${index + 6} ---\n`;
      if (slide.pageElements) {
        slide.pageElements.forEach(element => {
          if (element.shape && element.shape.text && element.shape.text.textElements) {
            element.shape.text.textElements.forEach(textEl => {
              if (textEl.textRun && textEl.textRun.content) {
                slideText += textEl.textRun.content;
              }
            });
          }
        });
      }
      allText.push(slideText);
    });

    console.log(allText.join('\n'));

    const fs = require('fs');
    fs.writeFileSync('./Output/Rewritten_Copy_Analysis.txt', allText.join('\n'));
    console.log('Saved to Output/Rewritten_Copy_Analysis.txt');
  } catch (err) {
    console.error('Error reading slides:', err);
    process.exit(1);
  }
}

readSlides();
