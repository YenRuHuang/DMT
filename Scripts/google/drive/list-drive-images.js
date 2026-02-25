const { google } = require('googleapis');
const config = require('../../config');

const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;

async function listAllImages() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth });

    console.log('📁 列出 Google Drive 中的所有圖片...\n');

    const res = await drive.files.list({
      q: `'${IMAGE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)'
    });

    for (const f of res.data.files) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        console.log(`\n📂 資料夾: ${f.name}`);
        const subRes = await drive.files.list({
          q: `'${f.id}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType)'
        });

        for (const sub of subRes.data.files) {
          if (sub.mimeType === 'application/vnd.google-apps.folder') {
            console.log(`  📂 子資料夾: ${sub.name}`);
            const deepRes = await drive.files.list({
              q: `'${sub.id}' in parents and trashed = false`,
              fields: 'files(id, name, mimeType)',
              pageSize: 100
            });
            deepRes.data.files.forEach(d => {
              if (d.mimeType.startsWith('image/')) {
                console.log(`    🖼️  ${d.name}`);
              }
            });
          } else if (sub.mimeType.startsWith('image/')) {
            console.log(`  🖼️  ${sub.name}`);
          }
        }
      } else if (f.mimeType.startsWith('image/')) {
        console.log(`🖼️  ${f.name}`);
      }
    }

  } catch (e) {
    console.error('❌ 錯誤:', e.message);
    process.exit(1);
  }
}

listAllImages();
