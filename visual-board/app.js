// ===== Configuration =====
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api'; // Fallback for static file serving
const SYNC_INTERVAL = 30000; // 30 seconds

// ===== Data Storage =====
const STORAGE_KEY = 'visualBoardData';

// Schedule Data
const scheduleData = [
  { id: 1, date: '12/15 (一)', brand: 'aesthefill', type: '貼文', title: '交換禮物提案？送自己美麗', contentType: 'posts' },
  { id: 2, date: '12/16 (二)', brand: 'plasma', type: '貼文', title: 'P電漿 vs. 傳統雷射 (冬季安全性)', contentType: 'posts' },
  { id: 3, date: '12/17 (三)', brand: 'aesthefill', type: '限動', title: 'PDLLA 問答時間', contentType: 'stories' },
  { id: 4, date: '12/17 (三)', brand: 'hera', type: '貼文', title: '冬至 - 回歸平衡', contentType: 'posts' },
  { id: 5, date: '12/18 (四)', brand: 'plasma', type: '限動', title: '聖誕氛圍 - 辦公室佈置', contentType: 'stories' },
  { id: 6, date: '12/19 (五)', brand: 'hera', type: '限動', title: '冬至儀式感提案', contentType: 'stories' },
  { id: 7, date: '12/19 (五)', brand: 'plasma', type: '貼文', title: '聖誕氛圍 - 「給肌膚一個平安夜」', contentType: 'posts' },
  { id: 8, date: '12/19 (五)', brand: 'aesthefill', type: '貼文', title: '膠原蛋白增生原理說明', contentType: 'posts' },
  { id: 9, date: '12/20 (六)', brand: 'hera', type: '貼文', title: '深層共振的科學', contentType: 'posts' },
  { id: 10, date: '12/22 (一)', brand: 'aesthefill', type: '貼文', title: '原廠認證診所的重要性', contentType: 'posts' },
  { id: 11, date: '12/24 (三)', brand: 'aesthefill', type: '短影音', title: 'Alice 施展魔法 -> 肌膚發光', contentType: 'reels' },
  { id: 12, date: '12/26 (五)', brand: 'plasma', type: '短影音', title: '視覺化「電漿」清除細菌過程', contentType: 'reels' },
];

// ===== State Management =====
let completedItems = new Set();
let currentFilter = 'all';

// Load saved data
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    completedItems = new Set(data.completedItems || []);
  }
}

// Save data
function saveData() {
  const data = {
    completedItems: Array.from(completedItems)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ===== Date Display =====
function updateDate() {
  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  const dateStr = now.toLocaleDateString('zh-TW', options);
  document.getElementById('currentDate').textContent = dateStr;
}

// ===== KPI Progress =====
function updateKPI() {
  const counts = {
    posts: 0,
    stories: 0,
    reels: 0
  };

  // Count completed items by type
  completedItems.forEach(id => {
    const item = scheduleData.find(s => s.id === id);
    if (item) {
      counts[item.contentType]++;
    }
  });

  // Update displays
  updateProgressCircle('posts', counts.posts, 6);
  updateProgressCircle('stories', counts.stories, 10);
  updateProgressCircle('reels', counts.reels, 2);
}

function updateProgressCircle(type, current, total) {
  const valueEl = document.getElementById(`${type}Value`);
  const circleEl = document.getElementById(`${type}Circle`);

  valueEl.textContent = current;

  // Calculate progress (circumference = 2 * π * r = 2 * π * 54 ≈ 339.292)
  const circumference = 339.292;
  const progress = (current / total) * circumference;
  const offset = circumference - progress;

  circleEl.style.strokeDashoffset = offset;
}

// ===== Schedule Rendering =====
function renderSchedule() {
  const container = document.getElementById('scheduleList');
  container.innerHTML = '';

  let filteredData = scheduleData;
  if (currentFilter !== 'all') {
    filteredData = scheduleData.filter(item => item.brand === currentFilter);
  }

  filteredData.forEach(item => {
    const scheduleItem = createScheduleItem(item);
    container.appendChild(scheduleItem);
  });
}

function createScheduleItem(item) {
  const div = document.createElement('div');
  div.className = `schedule-item ${completedItems.has(item.id) ? 'completed' : ''}`;

  const brandClass = `badge-${item.brand}`;
  const brandNames = {
    'hera': 'Hera',
    'plasma': 'P電漿',
    'aesthefill': '精靈聚雙璇'
  };

  div.innerHTML = `
        <div class="schedule-checkbox ${completedItems.has(item.id) ? 'checked' : ''}" data-id="${item.id}"></div>
        <div class="schedule-info">
            <h4>${item.title}</h4>
            <div class="schedule-meta">
                <span>${item.date}</span>
                <span>•</span>
                <span>${item.type}</span>
            </div>
        </div>
        <div class="schedule-badge ${brandClass}">${brandNames[item.brand]}</div>
    `;

  // Add click handler to checkbox
  const checkbox = div.querySelector('.schedule-checkbox');
  checkbox.addEventListener('click', () => toggleItem(item.id));

  return div;
}

function toggleItem(id) {
  if (completedItems.has(id)) {
    completedItems.delete(id);
  } else {
    completedItems.add(id);
  }

  saveData();
  renderSchedule();
  updateKPI();
}

// ===== Filter Functionality =====
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update filter
      currentFilter = btn.dataset.filter;
      renderSchedule();
    });
  });
}

// ===== Copy Functionality =====
function setupCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      copyToClipboard(prompt);
    });
  });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('指令已複製到剪貼簿！');
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      showToast('指令已複製到剪貼簿！');
    } catch (err) {
      showToast('複製失敗，請手動複製');
    }

    document.body.removeChild(textArea);
  }
}

// ===== Toast Notification =====
function showToast(message) {
  const toast = document.getElementById('toast');
  const messageEl = toast.querySelector('.toast-message');

  messageEl.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== Reset Progress =====
function setupReset() {
  const resetBtn = document.getElementById('resetProgress');
  resetBtn.addEventListener('click', () => {
    if (confirm('確定要重置所有進度嗎？此操作無法復原。')) {
      completedItems.clear();
      saveData();
      renderSchedule();
      updateKPI();
      showToast('進度已重置');
    }
  });
}

// ===== Add SVG Gradient Definitions =====
function addSVGGradients() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.position = 'absolute';

  svg.innerHTML = `
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
            </linearGradient>
        </defs>
    `;

  document.body.appendChild(svg);
}

// ===== Strategy Sync Functions =====
let lastStrategyUpdate = null;

async function fetchStrategyData() {
  try {
    const response = await fetch(`${API_BASE_URL}/strategy`);
    if (!response.ok) {
      throw new Error('Failed to fetch strategy data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching strategy data:', error);
    return null;
  }
}

function updateStrategySection(data) {
  if (!data) return;

  // Update theme card
  const themeTitle = document.querySelector('.theme-title');
  const themeSubtitle = document.querySelector('.theme-subtitle');
  const themeDesc = document.querySelector('.theme-desc');

  if (themeTitle) themeTitle.textContent = data.theme.title;
  if (themeSubtitle) themeSubtitle.textContent = data.theme.subtitle;
  if (themeDesc) themeDesc.textContent = data.theme.description;

  // Update goal cards (if needed in future - currently static)

  // Update content strategy (if needed in future - currently static)

  // Update workflow timeline (if needed in future - currently static)

  lastStrategyUpdate = data.lastUpdated;
  console.log('✅ Strategy section updated at', new Date().toLocaleTimeString('zh-TW'));
}

async function syncStrategy() {
  const data = await fetchStrategyData();
  if (data) {
    // Check if data has changed
    if (!lastStrategyUpdate || data.lastUpdated !== lastStrategyUpdate) {
      updateStrategySection(data);
      showToast('📋 企劃資料已更新！');
    }
  }
}

function setupStrategySync() {
  // Initial sync
  syncStrategy();

  // Auto sync every SYNC_INTERVAL
  setInterval(syncStrategy, SYNC_INTERVAL);

  // Manual sync button
  const syncBtn = document.getElementById('syncStrategy');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncStrategy();
      showToast('🔄 正在同步企劃資料...');
    });
  }
}

// ===== Initialization =====
function init() {
  loadData();
  updateDate();
  addSVGGradients();
  updateKPI();
  renderSchedule();
  setupFilters();
  setupCopyButtons();
  setupReset();
  setupStrategySync(); // Enable live sync
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);

// Update date every minute
setInterval(updateDate, 60000);
