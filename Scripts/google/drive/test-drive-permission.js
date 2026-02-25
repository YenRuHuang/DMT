const { google } = require('googleapis');
const config = require('../../config');

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });

  // Try to list the folder
  const IMAGE_FOLDER_ID = config.IMAGE_FOLDER_ID;
  
  // Check folder permissions
  try {
    const folder = await drive.files.get({ fileId: IMAGE_FOLDER_ID, fields: 'id,name,capabilities' });
    console.log("Folder:", folder.data.name);
    console.log("Capabilities:", JSON.stringify(folder.data.capabilities, null, 2));
  } catch (e) {
    console.error("Folder access error:", e.message);
    process.exit(1);
  }

  // Try to get one image's permissions
  const res = await drive.files.list({
    q: `'${IMAGE_FOLDER_ID}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: 'files(id, name, capabilities, owners)',
    pageSize: 1
  });
  if (res.data.files.length > 0) {
    const f = res.data.files[0];
    console.log("\nTest file:", f.name);
    console.log("Capabilities:", JSON.stringify(f.capabilities, null, 2));
    console.log("Owners:", JSON.stringify(f.owners, null, 2));
    
    // Try copy approach
    try {
      const copy = await drive.files.copy({
        fileId: f.id,
        requestBody: { name: 'TEST_RENAME_' + f.name, parents: [IMAGE_FOLDER_ID] }
      });
      console.log("\n✅ Copy approach works! Created:", copy.data.name, copy.data.id);
      // Clean up test
      await drive.files.delete({ fileId: copy.data.id });
      console.log("✅ Cleaned up test copy.");
    } catch (e) {
      console.error("\n❌ Copy approach failed:", e.message);
      process.exit(1);
    }
  }
}
test();
