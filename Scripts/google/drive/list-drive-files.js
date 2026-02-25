const { google } = require('googleapis');
const config = require('../../config');

const FOLDER_ID = config.IMAGE_FOLDER_ID;

async function listFiles() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log(`Checking folder: ${FOLDER_ID}...`);
    // First check if we can get the folder itself
    try {
      await drive.files.get({ fileId: FOLDER_ID });
      console.log('✅ Access to folder confirmed.');
    } catch (e) {
      console.log(`❌ Cannot access folder: ${e.message}`);
      console.log('Please share the folder "10NEHiEhHv8_..." with: mursfoto-sheets-sync@glass-tide-461207-j2.iam.gserviceaccount.com');
      return;
      process.exit(1);
    }

    // List files
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100
    });

    console.log(`Found ${res.data.files.length} sub-folders/files:`);

    for (const f of res.data.files) {
      console.log(`\n📂 Checking ${f.name} [${f.id}]...`);
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        const subRes = await drive.files.list({
          q: `'${f.id}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, webContentLink)',
          pageSize: 100
        });
        for (const sub of subRes.data.files) {
          console.log(`   - ${sub.name} (ID: ${sub.id}, Mime: ${sub.mimeType})`);
          if (sub.mimeType === 'application/vnd.google-apps.folder') {
            const deepRes = await drive.files.list({
              q: `'${sub.id}' in parents and trashed = false`,
              fields: 'files(id, name, mimeType, webContentLink)',
              pageSize: 50
            });
            deepRes.data.files.forEach(d => console.log(`      -> ${d.name} (${d.webContentLink})`));
          }
        }
      }
    }

  } catch (e) {
    console.log('GLOABL ERROR: ' + e.message);
    process.exit(1);
  }
}

listFiles();
