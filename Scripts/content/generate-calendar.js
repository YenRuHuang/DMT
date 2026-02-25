const fs = require('fs');
const config = require('../config'); // Ensure we use the shared config

// Quotas (Total Needed - Already Done)
// Neuramis: 6P, 10S, 2R
// Cooltech: 6P, 10S, 2R
// LPG: 6P, 10S, 2R

const brands = {
  Neuramis: {
    name: 'Neuramis', p: 6, s: 10, r: 2, topics: [
      { t: '【新年願望】給自己一份仙女般的禮物', a: '切角：New Year, New You (強調自然柔和)', resize: true },
      { t: 'SHAPE 技術：純淨的流動感', a: '視覺：透明質酸的純淨與光澤', resize: true },
      { t: '術後保養小叮嚀', a: '互動：實用資訊', resize: true },
      { t: '診所 2026 新主視覺分享', a: '互動：美感共鳴' },
      { t: '安心變美：為什麼選擇韓國銷量霸主？', a: '信任：品牌地位與安全性' },
      { t: '仙女光養成：從內而外的自信', a: '賦能：自我價值提升' }
    ]
  },
  Cooltech: {
    name: 'Cooltech', p: 6, s: 10, r: 2, topics: [
      { t: '【過年大吃不怕】什麼是 360 度全方位減脂？', a: '切角：Define 升級版差異驗證', resize: true },
      { t: '為什麼「4隻探頭」是忙碌現代人的救星？', a: '賦能：效率 (Time-saving)', resize: true },
      { t: '冰晶與脂肪的共舞 (3D示意)', a: '視覺：吸睛短影音 (科技冷調)' },
      { t: '重點回顧：4隻探頭優勢 (導流)', a: '導流：貼文 Resize / 懶人包' },
      { t: '針對頑固脂肪的高效解決方案', a: '痛點：運動無法解決的脂肪' },
      { t: 'Define Your Best：重新定義曲線', a: '品牌：自信與掌控感' }
    ]
  },
  LPG: {
    name: 'LPG', p: 6, s: 10, r: 2, topics: [
      { t: '【法式優雅】這一刻，喚醒身體的無限可能', a: '切角：Infinity 第11代 (身心靈平衡)', resize: true },
      { t: '無限波 (Infinite Waves) 科普', a: '互動：投票 (你有聽過嗎？)', resize: true },
      { t: '不只是體雕：第11代的「細胞級運動」', a: '知識：被動式運動原理', resize: true },
      { t: '身心靈的法式對話', a: '氛圍：放鬆與療癒' },
      { t: '非侵入式保養的頂級選擇', a: '定位：高端客群需求' },
      { t: '喚醒內在的無限能量', a: '品牌：Infinity 概念延伸' }
    ]
  }
};

const storyTopics = [
  '投票：你的 2026 美麗願望？', '醫師快問快答', '診所幕後花絮', '療程 ASMR',
  '術前術後對比 (示意)', '客戶好評分享', '週末保養小撇步', '保養品搭配建議',
  '迷思破解', '今日診所氛圍'
];

const reelTopics = {
  Neuramis: ['SHAPE 技術流動感', '仙女光澤展現'],
  Cooltech: ['冰晶與脂肪共舞', '360度探頭環繞'],
  LPG: ['無限波流動示意', '法式優雅護理']
};

const calendar = [];
const startDate = new Date('2026-01-01');
const endDate = new Date('2026-01-31');

let currentDate = new Date(startDate);
let bIndex = 0; // 0=Neuramis, 1=Cooltech, 2=LPG
const brandKeys = ['Neuramis', 'Cooltech', 'LPG'];

// Resize Queue: Stores pending resize stories for each brand
const resizeQueue = { Neuramis: [], Cooltech: [], LPG: [] };

// Helper to format date
function fmtDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const day = days[d.getDay()];
  return `${mm}/${dd} (${day})`;
}

// Calculate Week Number based on date
function getWeek(d) {
  const day = d.getDate();
  if (day <= 3) return 'W1';
  if (day <= 10) return 'W2';
  if (day <= 17) return 'W3';
  if (day <= 24) return 'W4';
  return 'W5';
}

// Fill Logic
while (currentDate <= endDate) {
  const dateStr = fmtDate(currentDate);
  const week = getWeek(currentDate);
  const dow = currentDate.getDay(); // 0=Sun

  // Simple Round Robin allocation
  let dailyItems = [];

  // --- POST / REEL ASSIGNMENT ---
  if (dow === 1 || dow === 3 || dow === 5) { // Mon, Wed, Fri -> POST priority
    const brandKey = brandKeys[bIndex % 3];
    const brand = brands[brandKey];
    if (brand.p > 0) {
      const topic = brand.topics.shift() || { t: '品牌推廣', a: '一般貼文', resize: false };
      dailyItems.push(`| **${week}** | ${dateStr} | **${brand.name}** | **${topic.a.split('：')[0]}** | **貼文** | **${topic.t}** | ${topic.a} | 待辦 |`);

      // Check for Resize Trigger
      if (topic.resize) {
        resizeQueue[brandKey].push({
          t: `重點回顧：${topic.t.substring(0, 10)}... (導流)`,
          note: '導流：貼文 Resize / 懶人包'
        });
      }

      brand.p--;
      bIndex++;
    }
  }

  if (dow === 2 || dow === 4) { // Tue, Thu -> REEL priority
    const brandKey = brandKeys[bIndex % 3];
    const brand = brands[brandKey];
    if (brand.r > 0) {
      const rTopic = reelTopics[brandKey].shift() || '品牌形象短片';
      dailyItems.push(`| **${week}** | ${dateStr} | **${brand.name}** | **炫技** | **短影音** | **${rTopic}** | 視覺：吸睛短影音 | 待辦 |`);
      brand.r--;
      bIndex++;
    } else if (brand.p > 0) {
      // Fallback to post
      const topic = brand.topics.shift() || { t: '品牌推廣', a: '一般貼文', resize: false };
      dailyItems.push(`| **${week}** | ${dateStr} | **${brand.name}** | **${topic.a.split('：')[0]}** | **貼文** | **${topic.t}** | ${topic.a} | 待辦 |`);

      // Check for Resize Trigger
      if (topic.resize) {
        resizeQueue[brandKey].push({
          t: `重點回顧：${topic.t.substring(0, 10)}... (導流)`,
          note: '導流：貼文 Resize / 懶人包'
        });
      }

      brand.p--;
      bIndex++;
    }
  }

  // Sat Post (Catchup)
  if (dow === 6) {
    const brandKey = brandKeys[bIndex % 3];
    const brand = brands[brandKey];
    if (brand.p > 0) {
      const topic = brand.topics.shift() || { t: '品牌推廣', a: '一般貼文', resize: false };
      dailyItems.push(`| **${week}** | ${dateStr} | **${brand.name}** | **${topic.a.split('：')[0]}** | **貼文** | **${topic.t}** | ${topic.a} | 待辦 |`);

      // Check for Resize Trigger
      if (topic.resize) {
        resizeQueue[brandKey].push({
          t: `重點回顧：${topic.t.substring(0, 10)}... (導流)`,
          note: '導流：貼文 Resize / 懶人包'
        });
      }

      brand.p--;
      bIndex++;
    }
  }

  // --- STORY ASSIGNMENT ---
  // Always try to add a Story every day
  const sBrandKey = brandKeys[(bIndex + 1) % 3]; // Rotate brand
  const sBrand = brands[sBrandKey];

  if (sBrand.s > 0) {
    let sTopic = '';
    let type = '生活類';
    let note = '互動：保持帳號活躍';

    // 1. Check Resize Queue first
    if (resizeQueue[sBrandKey].length > 0) {
      const resizeItem = resizeQueue[sBrandKey].shift();
      sTopic = resizeItem.t;
      type = '再製';
      note = resizeItem.note;
    } else {
      // 2. Fallback to Random Topic
      const rawTopic = storyTopics[Math.floor(Math.random() * storyTopics.length)];
      sTopic = rawTopic;
      if (sTopic.includes('投票')) type = '互動型';
      if (sTopic.includes('醫師')) type = '知識性';
    }

    dailyItems.push(`| **${week}** | ${dateStr} | ${sBrand.name} | ${type} | 限動 | ${sTopic} | ${note} | 待辦 |`);
    sBrand.s--;
  }

  calendar.push(...dailyItems);
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(calendar.join('\n'));
