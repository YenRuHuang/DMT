const fs = require('fs');
const path = require('path');

const month1Dir = path.join(__dirname, '..', 'Output', 'Month1');
const files = fs.readdirSync(month1Dir).filter(f => f.endsWith('.md') && f.startsWith('Content_'));

let globalCopyMap = {}; // Key: "02/16_Neuramis", Value: "The full copy text..."

for (const file of files) {
    const content = fs.readFileSync(path.join(month1Dir, file), 'utf-8');
    
    // Naive parse: We look for blocks like "### 🗓 02/23 (一) | Cooltech | 貼文"
    // Or "### Post 1: Neuramis 仙女玻尿酸" followed by "*   **發布時間**：02/16 (除夕)"
    // It's probably easier to just parse the whole Markdown by lines and build contexts.
    
    let currentKey = null;
    let currentCopy = [];
    let capturingCopy = false;

    const lines = content.split('\n');
    for (const line of lines) {
        // Match standard format: "### 🗓 02/23 (一) | Cooltech | 貼文"
        let m = line.match(/###\s*(?:🗓)?\s*(\d{2}\/\d{2}).*?\|\s*([A-Za-z]+)\s*\|/);
        if (m) {
            if (currentKey && currentCopy.length > 0) {
                globalCopyMap[currentKey] = currentCopy.join('\n').trim();
            }
            currentKey = `${m[1]}_${m[2]}`;
            currentCopy = [];
            capturingCopy = false;
            continue;
        }
        
        // Match another common format: "### Post 1: Neuramis" then "* **發布時間**：02/16"
        let brandMatch = line.match(/###\s*(?:Post|Story|Reel).*?(Neuramis|Cooltech|LPG|全品牌)/i);
        if (brandMatch) {
            if (currentKey && currentCopy.length > 0) {
                globalCopyMap[currentKey] = currentCopy.join('\n').trim();
            }
            currentKey = `PENDING_${brandMatch[1]}`;
            currentCopy = [];
            capturingCopy = false;
            continue;
        }

        let dateMatch = line.match(/\*?\s*\**發布(?:時間|日期)\**[：:]\s*(\d{2}\/\d{2})/);
        if (dateMatch && currentKey && currentKey.startsWith('PENDING_')) {
            currentKey = `${dateMatch[1]}_${currentKey.split('_')[1]}`;
        }

        if (line.includes('**(文案)**') || line.includes('**文案**：')) {
            capturingCopy = true;
            // Get text on the same line if any
            const inlineText = line.replace(/.*?\*\*文案\*\*：?\s*/, '').replace(/.*\*\*\s*\(文案\)\s*\*\*\s*/, '');
            if (inlineText.trim() && inlineText !== line) currentCopy.push(inlineText);
            continue;
        }
        
        // Stop capturing on new section or topic
        // Actually for standard markdown, it just goes until the next headers or `---`
        if (capturingCopy) {
            if (line.startsWith('---') || (line.startsWith('###') && !line.includes('文案'))) {
                capturingCopy = false;
                if (currentKey && currentCopy.length > 0) {
                    globalCopyMap[currentKey] = currentCopy.join('\n').trim();
                    currentKey = null;
                }
            } else {
                currentCopy.push(line);
            }
        }
    }
    
    // End of file
    if (currentKey && currentCopy.length > 0) {
        globalCopyMap[currentKey] = currentCopy.join('\n').trim();
    }
}

console.log(`Extracted copy for ${Object.keys(globalCopyMap).length} posts from Markdown.`);

// Also try to read from the Internal Google Sheet
const { google } = require('googleapis');
const config = require('../config');

async function checkInternal() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
   
  try {
      // Just dumping keys to verify
      fs.writeFileSync('Scripts/debug_copy.json', JSON.stringify(globalCopyMap, null, 2));
      console.log("Dumped mapped copy to Scripts/debug_copy.json");
  } catch (e) {
      console.error(e);
  }
}
checkInternal();
