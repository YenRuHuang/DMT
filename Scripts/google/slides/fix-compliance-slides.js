/**
 * 修正 Google Slides 中的違規內容
 * 
 * 此腳本會自動搜尋並替換/刪除違規的療效宣稱用語
 */

const { google } = require('googleapis');
const config = require('../../config');

// 需要處理的簡報 ID
const PRESENTATION_IDS = [
  '1Gqxzi2ro_A-s3drEHHbsz-Ca_TUxpAONbv476QMK2Gc',  // 簡報 1
  '1Y2jdQmNdX7pZIsG4NBQ4ueYSjkSUHOl55LmCPt4DFxM'   // 簡報 2
];

// 違規詞彙對照表（要替換的）
const REPLACEMENTS = {
  // LPG 相關
  '細胞級的改變': '第11代技術亮點',
  '細胞級運動': '專業動力技術',
  '刺激脂肪細胞代謝': '專利動力滾輪技術',
  '促進膠原蛋白重塑': '深層動力按摩',
  '改善淋巴循環': '法國原廠認證技術',
  '緊緻肌膚輪廓': '精準動力傳導',
  '喚醒沉睡的細胞': '精密動力技術',
  '消水腫': '舒適放鬆體驗',
  '排水排濕': '舒適體驗',

  // Cooltech 相關
  '冷凍減脂': '冷卻體態管理',
  '減脂': '體態管理',
  '頑固脂肪': '指定部位',
  '脂肪細胞代謝': '低溫技術應用',
  '脂肪細胞凋亡': '低溫技術',
  '單次可減少約22%脂肪層': '西班牙原廠專利技術',

  // 通用
  '療程': '體驗',
  '治療': '服務',
  '術後': '使用後',
  '療效': '技術特點',
  '非療程廣告': '非消費者廣告'
};

// 需要整行刪除的違規詞彙（替換成空字串）
const DELETE_PHRASES = [
  '▸ 刺激脂肪細胞代謝',
  '▸ 促進膠原蛋白重塑',
  '▸ 改善淋巴循環',
  '▸ 緊緻肌膚輪廓'
];

async function fixComplianceIssues() {
  try {
    console.log('🔧 開始修正 Google Slides 違規內容...\n');

    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/presentations'],
    });

    const slides = google.slides({ version: 'v1', auth });

    for (const presentationId of PRESENTATION_IDS) {
      console.log(`\n📊 處理簡報: ${presentationId}`);
      console.log('='.repeat(50));

      // 取得簡報內容
      const presentation = await slides.presentations.get({
        presentationId: presentationId
      });

      console.log(`📝 簡報標題: ${presentation.data.title}`);

      const requests = [];
      let fixCount = 0;

      // 遍歷每個投影片
      for (const slide of presentation.data.slides) {
        if (!slide.pageElements) continue;

        for (const element of slide.pageElements) {
          if (!element.shape || !element.shape.text) continue;

          // 取得文字內容
          const textContent = element.shape.text.textElements
            .map(t => t.textRun ? t.textRun.content : '')
            .join('');

          // 檢查並建立替換請求
          for (const [oldText, newText] of Object.entries(REPLACEMENTS)) {
            if (textContent.includes(oldText)) {
              requests.push({
                replaceAllText: {
                  containsText: {
                    text: oldText,
                    matchCase: false
                  },
                  replaceText: newText
                }
              });
              console.log(`  ✏️ 替換: "${oldText}" → "${newText}"`);
              fixCount++;
            }
          }

          // 檢查需要刪除的整行
          for (const phrase of DELETE_PHRASES) {
            if (textContent.includes(phrase)) {
              requests.push({
                replaceAllText: {
                  containsText: {
                    text: phrase,
                    matchCase: false
                  },
                  replaceText: ''  // 刪除
                }
              });
              console.log(`  🗑️ 刪除: "${phrase}"`);
              fixCount++;
            }
          }
        }
      }

      // 去除重複的請求
      const uniqueRequests = [];
      const seen = new Set();
      for (const req of requests) {
        const key = JSON.stringify(req);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRequests.push(req);
        }
      }

      // 執行批次更新
      if (uniqueRequests.length > 0) {
        console.log(`\n⚡ 執行 ${uniqueRequests.length} 項修正...`);

        await slides.presentations.batchUpdate({
          presentationId: presentationId,
          requestBody: { requests: uniqueRequests }
        });

        console.log(`✅ 簡報修正完成！共 ${uniqueRequests.length} 處`);
      } else {
        console.log('✅ 此簡報無需修正');
      }

      console.log(`🔗 查看: https://docs.google.com/presentation/d/${presentationId}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 所有簡報修正完成！');
    console.log('\n⚠️ 請手動檢查簡報，確認內容正確。');

  } catch (error) {
    console.error('❌ 修正失敗:', error.message);
    if (error.code === 403) {
      console.log('\n💡 提示：請確認服務帳戶有這兩份簡報的「編輯者」權限。');
      console.log('   你可以在 Google Slides 中把這個服務帳戶加入共編：');
      console.log('   glass-tide-461207-j2@glass-tide-461207-j2.iam.gserviceaccount.com');
    }
    process.exit(1);
  }
}

fixComplianceIssues();
