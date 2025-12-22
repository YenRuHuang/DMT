# 曜亞 × 默默 醫美社群經營系統

> **DMT (Digital Marketing Tools)** - 曜亞生醫 × 默默網路行銷 合作專案

針對三大醫美品牌 (P-Plasma, AestheFill, Hera) 的 B2B 社群內容管理系統。

## 🆕 最新更新 (2025-12)

- ✅ 整合 **AI Pro** (Gemini 3 Pro, Veo 3.1, Nano Banana)
- ✅ Express 5 + 安全漏洞修復
- ✅ Jules AI 程式碼品質重構

---

## 🚀 功能

| 功能 | 說明 |
|:---|:---|
| **Visual Board** | 網頁儀表板：月目標、品牌視覺、內容進度 |
| **自動化腳本** | Google Sheets / Slides 同步 |
| **AI Pro 整合** | Gemini 3 Pro 文案、Veo 3.1 影片、Nano Banana 圖片 |
| **集中規劃** | Planning 目錄為單一資料來源 |

---

## 📂 專案結構

```
├── Planning/                # 策略文件、AI 工作流程
│   ├── Master_Command_Center.md  # 核心控制中心
│   ├── AI_Team_Workflow.md       # AI 團隊角色與提示詞
│   └── ...
├── Scripts/                 # Node.js 自動化腳本
│   ├── sync-sheets.js       # 同步到 Google Sheets
│   ├── sync-slides.js       # 同步到 Google Slides
│   └── health-check.js      # 系統健康檢查
├── visual-board/            # 網頁儀表板
│   ├── server.js
│   └── index.html
└── package.json
```

---

## 🛠️ 快速開始

```bash
# 安裝相依套件
npm install

# 啟動 Visual Board (http://localhost:3000)
npm run board

# 同步到 Google Sheets
node Scripts/sync-sheets.js

# 系統健康檢查
node Scripts/health-check.js
```

---

## 🔗 相關連結

| 連結 | 說明 |
|:---|:---|
| [Visual Board](./VISUAL_BOARD_CENTER.md) | 儀表板快速入口 |
| [Planning](./Planning/) | 策略規劃文件 |
| [mursfoto-devops](https://github.com/YenRuHuang/mursfoto-devops) | DevOps 工具與部署指南 |

---

## 📄 授權

MIT License
