const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from visual-board directory
app.use(express.static(path.join(__dirname)));

// Path to the strategy document
const STRATEGY_FILE = path.join(__dirname, '..', 'Planning', 'Project_Requirements_Strategy.md');

// Cache for parsed strategy data
let strategyCache = null;
let lastModified = null;

// Parse strategy markdown file
function parseStrategyFile() {
  try {
    const content = fs.readFileSync(STRATEGY_FILE, 'utf-8');
    const stats = fs.statSync(STRATEGY_FILE);

    // Extract data from markdown
    const data = {
      goals: [
        {
          icon: '🎯',
          title: '出圈',
          description: '拓展觸及到陌生客群，擴大品牌影響力'
        },
        {
          icon: '🔗',
          title: '黏著度',
          description: '穩定增長既有受眾，維持高互動率'
        },
        {
          icon: '🤝',
          title: '異業合作',
          description: '保持內容彈性，配合跨產業品牌合作'
        }
      ],
      contentStrategy: {
        knowledge: {
          count: '2-3 篇',
          description: '材料介紹、醫學知識、痛點解決方案'
        },
        lifestyle: {
          count: '2-3 篇',
          description: '節慶話題、時事跟風、氛圍感品牌價值'
        }
      },
      theme: {
        title: '年末閃耀',
        subtitle: 'Glow Up for the Holidays',
        description: '原廠賦能特別企劃 · 聚焦醫美診所與醫師端'
      },
      workflow: [
        {
          date: '每月 10 日前',
          task: '結案成果報告'
        },
        {
          date: '每月 20 日前',
          task: '企劃提案（初稿）'
        },
        {
          date: '每月 27 日前',
          task: '企劃內容（定案）'
        }
      ],
      lastUpdated: stats.mtime.toISOString()
    };

    // Try to extract theme from content if available
    const themeMatch = content.match(/##?\s*(.+?主題.*?)\n/);
    if (themeMatch) {
      // Could enhance parsing here to extract actual theme from markdown
      console.log('Found theme section in markdown');
    }

    strategyCache = data;
    lastModified = stats.mtime;

    console.log(`✅ Strategy data parsed successfully at ${new Date().toLocaleTimeString('zh-TW')}`);
    return data;

  } catch (error) {
    console.error('❌ Error parsing strategy file:', error);
    return null;
  }
}

// Initial parse
parseStrategyFile();

// Watch for file changes
const watcher = chokidar.watch(STRATEGY_FILE, {
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', () => {
  console.log('📝 Strategy file changed, reloading...');
  parseStrategyFile();
});

// API endpoint
app.get('/api/strategy', (req, res) => {
  if (!strategyCache) {
    return res.status(500).json({ error: 'Strategy data not available' });
  }

  res.json(strategyCache);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    strategyFileExists: fs.existsSync(STRATEGY_FILE),
    lastUpdated: lastModified ? lastModified.toISOString() : null
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 視覺看板伺服器已啟動！');
  console.log(`📍 網址: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/strategy`);
  console.log(`👁️  監測文件: ${STRATEGY_FILE}`);
  console.log('\n按 Ctrl+C 停止伺服器\n');
});
