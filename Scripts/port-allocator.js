#!/usr/bin/env node

/**
 * 🚢 Mursfoto Port Allocator
 * 
 * 自動分配未被佔用的端口，並更新 PORT_ALLOCATION_REGISTRY.md
 * 
 * 用法:
 *   node Scripts/port-allocator.js                    # 查看下一個可用端口
 *   node Scripts/port-allocator.js --allocate "專案名稱" "服務描述"
 *   node Scripts/port-allocator.js --list             # 列出所有已分配端口
 *   node Scripts/port-allocator.js --check 3000       # 檢查特定端口
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 端口範圍定義
const PORT_RANGES = {
  frontend: { start: 3000, end: 3099, name: '前端開發' },
  backend: { start: 3100, end: 3199, name: '後端 API' },
  gateway: { start: 4000, end: 4099, name: 'API Gateway' },
  dashboard: { start: 4100, end: 4199, name: 'Dashboard' },
  database: { start: 5000, end: 5099, name: '資料庫工具' },
  test: { start: 6000, end: 6099, name: '測試服務' },
  python: { start: 8000, end: 8099, name: 'Python' }
};

const REGISTRY_PATH = path.join(__dirname, '../Planning/PORT_ALLOCATION_REGISTRY.md');

/**
 * 檢查端口是否被佔用
 */
function isPortInUse(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 找到指定範圍內第一個可用的端口
 */
function findAvailablePort(rangeType = 'frontend') {
  const range = PORT_RANGES[rangeType];
  if (!range) {
    console.error(`❌ 未知的範圍類型: ${rangeType}`);
    console.log(`可用類型: ${Object.keys(PORT_RANGES).join(', ')}`);
    return null;
  }

  for (let port = range.start; port <= range.end; port++) {
    if (!isPortInUse(port)) {
      return { port, range: rangeType, rangeName: range.name };
    }
  }

  console.error(`❌ 範圍 ${range.name} (${range.start}-${range.end}) 內沒有可用端口`);
  return null;
}

/**
 * 更新 Registry 文件
 */
function updateRegistry(port, projectName, serviceDesc, status = '🟢 活躍') {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('❌ 找不到 PORT_ALLOCATION_REGISTRY.md');
    return false;
  }

  let content = fs.readFileSync(REGISTRY_PATH, 'utf8');

  // 找到 "### 活躍專案" 區塊並新增一行
  const insertLine = `| ${port} | ${projectName} | ${serviceDesc} | ${status} |`;

  // 在活躍專案表格後插入
  const activeSection = '### 活躍專案';
  const tableHeaderPattern = /\| 端口 \| 專案 \| 服務 \| 狀態 \|/;

  if (content.includes(activeSection)) {
    const lines = content.split('\n');
    let insertIndex = -1;
    let inActiveSection = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(activeSection)) {
        inActiveSection = true;
      }
      if (inActiveSection && lines[i].startsWith('| 3') || lines[i].startsWith('| 4')) {
        insertIndex = i + 1;
      }
      if (inActiveSection && lines[i].startsWith('###') && !lines[i].includes(activeSection)) {
        break;
      }
    }

    if (insertIndex === -1) {
      // 在表格標題後插入
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(activeSection)) {
          insertIndex = i + 4; // 跳過標題和表格頭
          break;
        }
      }
    }

    lines.splice(insertIndex, 0, insertLine);
    content = lines.join('\n');
    fs.writeFileSync(REGISTRY_PATH, content);
    return true;
  }

  return false;
}

/**
 * 主程式
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--next') {
    // 顯示每個範圍內的下一個可用端口
    console.log('🚢 各範圍下一個可用端口:\n');
    for (const [type, range] of Object.entries(PORT_RANGES)) {
      const result = findAvailablePort(type);
      if (result) {
        console.log(`  ${range.name.padEnd(12)} (${type.padEnd(10)}): ${result.port}`);
      }
    }
    return;
  }

  if (args[0] === '--check') {
    const port = parseInt(args[1]);
    if (isNaN(port)) {
      console.error('❌ 請提供有效的端口號');
      return;
    }
    const inUse = isPortInUse(port);
    console.log(inUse ? `🔴 端口 ${port} 已被佔用` : `🟢 端口 ${port} 可用`);
    return;
  }

  if (args[0] === '--allocate') {
    const projectName = args[1] || '新專案';
    const serviceDesc = args[2] || '服務';
    const rangeType = args[3] || 'frontend';

    const result = findAvailablePort(rangeType);
    if (result) {
      console.log(`\n🎉 分配端口: ${result.port}`);
      console.log(`   類型: ${result.rangeName}`);
      console.log(`   專案: ${projectName}`);
      console.log(`   服務: ${serviceDesc}`);

      if (updateRegistry(result.port, projectName, serviceDesc)) {
        console.log(`\n✅ 已更新 PORT_ALLOCATION_REGISTRY.md`);
      }

      console.log(`\n📋 在您的專案中使用:`);
      console.log(`   PORT=${result.port}`);
    }
    return;
  }

  if (args[0] === '--list') {
    console.log('📋 正在檢查端口佔用狀況...\n');
    for (const [type, range] of Object.entries(PORT_RANGES)) {
      const usedPorts = [];
      for (let port = range.start; port <= range.end; port++) {
        if (isPortInUse(port)) {
          usedPorts.push(port);
        }
      }
      console.log(`${range.name}: ${usedPorts.length > 0 ? usedPorts.join(', ') : '無佔用'}`);
    }
    return;
  }

  console.log(`
🚢 Mursfoto Port Allocator

用法:
  node Scripts/port-allocator.js                           # 查看所有範圍的下一個可用端口
  node Scripts/port-allocator.js --check <port>            # 檢查特定端口是否被佔用
  node Scripts/port-allocator.js --allocate <專案> <服務> [類型]  # 分配並註冊端口
  node Scripts/port-allocator.js --list                    # 列出所有被佔用的端口

範圍類型: ${Object.keys(PORT_RANGES).join(', ')}
  `);
}

main();
