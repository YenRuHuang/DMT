const scheduleData = [
  // W2 - 01/10 to 01/12
  { id: 1, date: '01/10 (五)', brand: 'neuramis', type: '貼文', title: '【SHAPE技術】什麼是動態自然感？', contentType: 'posts' },
  { id: 2, date: '01/10 (五)', brand: 'cooltech', type: '限動', title: '投票：過年最怕的體重問題？', contentType: 'stories' },
  { id: 3, date: '01/11 (六)', brand: 'cooltech', type: '貼文', title: '【360度冷凍】為什麼比傳統更有效？', contentType: 'posts' },
  { id: 4, date: '01/11 (六)', brand: 'lpg', type: '限動', title: '週末放鬆 ASMR：法式體雕的聲音', contentType: 'stories' },
  { id: 5, date: '01/12 (日)', brand: 'lpg', type: '貼文', title: '【法式哲學】身體是心靈的殿堂', contentType: 'posts' },
  { id: 6, date: '01/12 (日)', brand: 'neuramis', type: '限動', title: '診所 2026 新年氛圍分享', contentType: 'stories' },
  // W3 - 01/13 to 01/19
  { id: 7, date: '01/13 (一)', brand: 'neuramis', type: '貼文', title: '安心變美：韓國銷量霸主的信任基礎', contentType: 'posts' },
  { id: 8, date: '01/13 (一)', brand: 'cooltech', type: '限動', title: '4探頭同步：節省一半時間！', contentType: 'stories' },
  { id: 9, date: '01/14 (二)', brand: 'cooltech', type: '短影音', title: '冰晶與脂肪的共舞 (Veo 生成)', contentType: 'reels' },
  { id: 10, date: '01/14 (二)', brand: 'lpg', type: '限動', title: '無限波 (∞) 是什麼？投票', contentType: 'stories' },
  { id: 11, date: '01/15 (三)', brand: 'lpg', type: '貼文', title: '【第11代】細胞級運動的科學原理', contentType: 'posts' },
  { id: 12, date: '01/15 (三)', brand: 'neuramis', type: '限動', title: '重點回顧：SHAPE技術 (導流)', contentType: 'stories' },
  { id: 13, date: '01/16 (四)', brand: 'neuramis', type: '短影音', title: '仙女光澤展現 (Veo 流動感)', contentType: 'reels' },
  { id: 14, date: '01/16 (四)', brand: 'cooltech', type: '限動', title: '診所幕後花絮：酷特日常', contentType: 'stories' },
  { id: 15, date: '01/17 (五)', brand: 'cooltech', type: '貼文', title: 'Define Your Best：重新定義曲線自信', contentType: 'posts' },
  { id: 16, date: '01/17 (五)', brand: 'lpg', type: '限動', title: '重點回顧：第11代無限波 (導流)', contentType: 'stories' },
  { id: 17, date: '01/18 (六)', brand: 'lpg', type: '短影音', title: '無限波流動示意 (Veo 優雅曲線)', contentType: 'reels' },
  { id: 18, date: '01/18 (六)', brand: 'neuramis', type: '限動', title: '週末保養小撇步', contentType: 'stories' },
  { id: 19, date: '01/19 (日)', brand: 'cooltech', type: '限動', title: '客戶好評分享 (匿名)', contentType: 'stories' },
  { id: 20, date: '01/19 (日)', brand: 'lpg', type: '限動', title: '今日診所氛圍', contentType: 'stories' },
  // W4 - 01/20 to 01/26
  { id: 21, date: '01/20 (一)', brand: 'neuramis', type: '貼文', title: '術後保養完整攻略', contentType: 'posts' },
  { id: 22, date: '01/20 (一)', brand: 'cooltech', type: '限動', title: '重點回顧：360度冷凍 (導流)', contentType: 'stories' },
  { id: 23, date: '01/21 (二)', brand: 'cooltech', type: '短影音', title: '360度探頭環繞 (Veo 科技感)', contentType: 'reels' },
  { id: 24, date: '01/21 (二)', brand: 'lpg', type: '限動', title: '被動運動 vs 主動運動？', contentType: 'stories' },
  { id: 25, date: '01/22 (三)', brand: 'lpg', type: '貼文', title: '非侵入式保養的頂級選擇', contentType: 'posts' },
  { id: 26, date: '01/22 (三)', brand: 'neuramis', type: '限動', title: '玻尿酸 Q&A：常見問題解答', contentType: 'stories' },
  { id: 27, date: '01/23 (四)', brand: 'neuramis', type: '短影音', title: 'SHAPE技術流動感 (Veo 仙女光)', contentType: 'reels' },
  { id: 28, date: '01/23 (四)', brand: 'cooltech', type: '限動', title: '療程 ASMR：冰涼舒適感', contentType: 'stories' },
  { id: 29, date: '01/24 (五)', brand: 'cooltech', type: '貼文', title: '針對頑固脂肪的科學解方', contentType: 'posts' },
  { id: 30, date: '01/24 (五)', brand: 'lpg', type: '限動', title: '迷思破解：體雕 ≠ 減肥', contentType: 'stories' },
  { id: 31, date: '01/25 (六)', brand: 'lpg', type: '貼文', title: '身心靈的法式對話：喚醒內在能量', contentType: 'posts' },
  { id: 32, date: '01/25 (六)', brand: 'neuramis', type: '限動', title: '術前術後對比 (示意)', contentType: 'stories' },
  { id: 33, date: '01/26 (日)', brand: 'cooltech', type: '限動', title: '過年前最後衝刺！', contentType: 'stories' },
  { id: 34, date: '01/26 (日)', brand: 'lpg', type: '限動', title: '除夕倒數：好好愛自己', contentType: 'stories' },
  // W5 - 01/27 to 01/31
  { id: 35, date: '01/27 (一)', brand: 'neuramis', type: '貼文', title: '仙女光養成：從內而外的自信', contentType: 'posts' },
  { id: 36, date: '01/27 (一)', brand: 'cooltech', type: '限動', title: '年後瘦身預告：酷特開工特輯', contentType: 'stories' },
  { id: 37, date: '01/28 (二)', brand: 'lpg', type: '短影音', title: '法式優雅護理 (Veo 高質感)', contentType: 'reels' },
  { id: 38, date: '01/28 (二)', brand: 'neuramis', type: '限動', title: '重點回顧：韓國銷量霸主 (導流)', contentType: 'stories' },
  { id: 39, date: '01/29 (三)', brand: 'cooltech', type: '貼文', title: '忙碌現代人的效率瘦身夥伴', contentType: 'posts' },
  { id: 40, date: '01/29 (三)', brand: 'lpg', type: '限動', title: '過年期間不打烊提醒', contentType: 'stories' },
  { id: 41, date: '01/30 (四)', brand: 'lpg', type: '貼文', title: '【深度解析】無限波如何喚醒細胞？', contentType: 'posts' },
  { id: 42, date: '01/30 (四)', brand: 'neuramis', type: '限動', title: '新年快樂！2026 美麗計劃', contentType: 'stories' },
  { id: 43, date: '01/31 (五)', brand: 'neuramis', type: '貼文', title: '1月回顧：感謝陪伴的你', contentType: 'posts' },
  { id: 44, date: '01/31 (五)', brand: 'cooltech', type: '限動', title: '1月精選回顧', contentType: 'stories' },
  { id: 45, date: '01/31 (五)', brand: 'lpg', type: '限動', title: '2月預告：更多精彩等你', contentType: 'stories' }
];

// Brand Names Mapping (2026)
const brandNames = {
  'neuramis': 'Neuramis 仙女',
  'cooltech': 'Cooltech 酷特',
  'lpg': 'LPG 法式'
};

// DOM Elements
let filterBtns;
let scheduleItems;
let progressRing;
let progressText;
let progressPercent;
let currentTypeFilter = 'all';
let currentBrandFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  filterBtns = document.querySelectorAll('.filter-btn');

  renderSchedule();
  initFilters();
  updateProgress();
  initCopyButtons();
  initProgressCheckboxes();
});

// Render Schedule
function renderSchedule() {
  const container = document.querySelector('.schedule-items');
  if (!container) return;

  container.innerHTML = scheduleData.map(item => `
    <div class="schedule-item" data-brand="${item.brand}" data-type="${item.contentType}">
      <div class="item-date">${item.date}</div>
      <div class="item-content">
        <span class="badge badge-${item.brand}">${brandNames[item.brand]}</span>
        <span class="badge badge-type">${item.type}</span>
        <span class="item-title">${item.title}</span>
      </div>
      <div class="item-status">
        <label class="checkbox-label">
          <input type="checkbox" class="status-checkbox" data-id="${item.id}">
          <span class="checkmark"></span>
        </label>
      </div>
    </div>
  `).join('');

  scheduleItems = document.querySelectorAll('.schedule-item');
}

// Init Filters
function initFilters() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterType = btn.dataset.filter;
      const filterGroup = btn.closest('.filter-group');

      // Remove active from same group
      filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Determine filter type (brand or content type)
      if (['neuramis', 'cooltech', 'lpg', 'all'].includes(filterType) && !['posts', 'stories', 'reels'].includes(filterType)) {
        currentBrandFilter = filterType;
      } else if (['posts', 'stories', 'reels'].includes(filterType)) {
        currentTypeFilter = filterType;
      } else {
        currentBrandFilter = 'all';
        currentTypeFilter = 'all';
      }

      applyFilters();
    });
  });
}

// Apply Filters
function applyFilters() {
  scheduleItems.forEach(item => {
    const brand = item.dataset.brand;
    const type = item.dataset.type;

    const brandMatch = currentBrandFilter === 'all' || brand === currentBrandFilter;
    const typeMatch = currentTypeFilter === 'all' || type === currentTypeFilter;

    item.style.display = brandMatch && typeMatch ? 'flex' : 'none';
  });
}

// Update Progress
function updateProgress() {
  progressRing = document.querySelector('.progress-ring-circle');
  progressText = document.querySelector('.progress-text');
  progressPercent = document.querySelector('.progress-percent');

  if (!progressRing) return;

  const total = scheduleData.length;
  const completed = document.querySelectorAll('.status-checkbox:checked').length;
  const percent = Math.round((completed / total) * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percent / 100) * circumference;

  progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
  progressRing.style.strokeDashoffset = offset;

  if (progressText) progressText.textContent = `${completed}/${total}`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
}

// Init Copy Buttons
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.command-card');
      const prompt = card.querySelector('.prompt-text').textContent;
      navigator.clipboard.writeText(prompt).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✅ 已複製';
        setTimeout(() => btn.textContent = originalText, 2000);
      });
    });
  });
}

// Init Progress Checkboxes
function initProgressCheckboxes() {
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-checkbox')) {
      updateProgress();
      saveProgress();
    }
  });

  loadProgress();
}

// Save Progress to LocalStorage
function saveProgress() {
  const completed = [];
  document.querySelectorAll('.status-checkbox:checked').forEach(cb => {
    completed.push(cb.dataset.id);
  });
  localStorage.setItem('scheduleProgress', JSON.stringify(completed));
}

// Load Progress from LocalStorage
function loadProgress() {
  const saved = localStorage.getItem('scheduleProgress');
  if (saved) {
    const completed = JSON.parse(saved);
    completed.forEach(id => {
      const cb = document.querySelector(`.status-checkbox[data-id="${id}"]`);
      if (cb) cb.checked = true;
    });
    updateProgress();
  }
}

// Export for potential use
window.scheduleData = scheduleData;
window.brandNames = brandNames;
