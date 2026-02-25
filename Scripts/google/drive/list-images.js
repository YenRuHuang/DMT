const { google } = require('googleapis');
const config = require('../../config');

async function listAllImages() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const drive = google.drive({ version: 'v3', auth });

  try {
    const rootFolderId = config.IMAGE_FOLDER_ID;

    // Get Brand folders
    const brandFolders = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)'
    });

    for (const brand of brandFolders.data.files) {
      console.log(`\n📁 Brand: ${brand.name}`);
      // Get Month folders
      const monthFolders = await drive.files.list({
        q: `'${brand.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)'
      });

      for (const month of monthFolders.data.files) {
        console.log(`  📂 Month: ${month.name}`);
        const images = await drive.files.list({
          q: `'${month.id}' in parents and trashed = false`,
          fields: 'files(id, name)'
        });
        images.data.files.forEach(img => console.log(`      - ${img.name}`));
      }
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
listAllImages();
