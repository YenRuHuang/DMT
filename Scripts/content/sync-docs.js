/**
 * sync-docs.js - 同步內容到 Google Docs
 * 
 * 使用 Google Docs API 將企劃提案內容寫入 Google 文件
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const config = require('../config');

// Google Docs 文件 ID
const DOCUMENT_ID = '1cweKhNPbLe5JotStAeMcd88p4DQzs23LUzAOcLCs2c8';

async function syncDocs() {
  try {
    console.log('🚀 開始同步到 Google Docs...');

    // 1. 讀取本地內容
    const proposalPath = path.join(config.PLANNING_DIR, 'Final_Proposal_Submission_2026_01.md');
    const trendPath = path.join(config.PLANNING_DIR, 'Trend_Research_2026_01.md');

    console.log('📖 讀取企劃提案...');
    const proposalContent = fs.readFileSync(proposalPath, 'utf8');

    console.log('📖 讀取趨勢報告...');
    const trendContent = fs.readFileSync(trendPath, 'utf8');

    // 2. 認證
    console.log('🔐 連接 Google Docs...');
    const auth = new google.auth.GoogleAuth({
      keyFile: config.CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/documents'],
    });
    const docs = google.docs({ version: 'v1', auth });

    // 3. 清空現有內容
    console.log('🧹 清空現有內容...');
    const document = await docs.documents.get({ documentId: DOCUMENT_ID });
    const endIndex = document.data.body.content
      .filter(element => element.paragraph)
      .reduce((max, element) => Math.max(max, element.endIndex || 0), 1);

    if (endIndex > 2) {
      await docs.documents.batchUpdate({
        documentId: DOCUMENT_ID,
        requestBody: {
          requests: [{
            deleteContentRange: {
              range: { startIndex: 1, endIndex: endIndex - 1 }
            }
          }]
        }
      });
    }

    // 4. 準備要插入的內容 (轉換 Markdown 為純文字)
    const contentToInsert = `
曜亞 x 默默的社群經營
2026年 1月份企劃提案 (Final Proposal)

提案日期：2026-01-05
執行期間：2026/01/10 - 2026/01/31
品牌：Neuramis (仙女) / Cooltech Define (酷特) / LPG Infinity (法式)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 本月產出配額

貼文：18 篇 (各品牌 6 篇)
限動：30 則 (各品牌 10 則)
短影音：6 支 (各品牌 2 支)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 一月趨勢研究摘要

1️⃣ 衛福部特管法 1/1 上路，加嚴醫美管理
   → 強調「原廠認證」、「專業資格」

2️⃣ 「自然感微整」成絕對主流，拒絕塑膠臉
   → Neuramis SHAPE 技術完美契合

3️⃣ 農曆新年消費高峰，「煥臉轉運」需求強
   → 加入節慶元素，強調「無恢復期」

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 本月核心戰略：新年新起點 × 品牌認知建立

【Neuramis 仙女玻尿酸】
核心訊息：仙女般的自然蛻變
主打切角：新年願望、SHAPE技術、韓國銷量霸主
視覺調性：柔和粉 / 純淨白

【Cooltech Define 酷特冷凍減脂】
核心訊息：過年大吃不怕胖
主打切角：360度全方位、4探頭效率、忙碌首選
視覺調性：科技藍 / 冰晶白

【LPG Infinity 法式體雕】
核心訊息：法式身心靈對話
主打切角：第11代無限波、細胞級運動、非侵入式保養
視覺調性：香檳金 / 簡約白

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 完整排程 (45 筆)

請參閱 Google Sheets：
https://docs.google.com/spreadsheets/d/1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 審核與流程

1. 初稿提交：每週三前完成下週內容初稿
2. 品牌審核：預留 3 個工作天
3. 排程上架：每週日確認下週排程
4. 禁用詞彙：治療、改善疾病、永久、保證、治癒

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

同步時間：${new Date().toLocaleString('zh-TW')}
`;

    // 5. 插入內容
    console.log('✍️ 寫入內容...');
    await docs.documents.batchUpdate({
      documentId: DOCUMENT_ID,
      requestBody: {
        requests: [{
          insertText: {
            location: { index: 1 },
            text: contentToInsert
          }
        }]
      }
    });

    console.log('✅ 同步成功！');
    console.log(`🔗 查看連結: https://docs.google.com/document/d/${DOCUMENT_ID}/edit`);

  } catch (error) {
    console.error('❌ 同步失敗:', error.message);
    if (error.message.includes('insufficient permission') || error.message.includes('403')) {
      console.log('\n💡 提示：服務帳戶可能沒有文件編輯權限。');
      console.log('   請將文件分享給服務帳戶：');
      console.log('   (查看 credentials JSON 中的 client_email)');
    }
    process.exit(1);
  }
}

syncDocs();
