# 曜亞 × 默默 醫美社群經營系統

> **DMT (Digital Marketing Tools)** - 曜亞生醫 × 默默網路行銷 合作專案

針對 2026 三大重點品牌 (**Neuramis 仙女玻尿酸**, **Cooltech Define 酷特冷凍減脂**, **LPG Infinity 法式體雕**) 的 B2B 社群內容管理系統。

## 🆕 最新更新 (2026-02)

- ✅ **安全強化**：敏感設定移至 `.env`，移除硬寫路徑
- ✅ **腳本重整**：Scripts/ 依功能分層（google/sheets、slides、drive、content 等）
- ✅ **npm scripts**：`npm run sync:all`、`npm run health` 等快捷指令
- ✅ **品牌轉型**：全面支援 Neuramis, Cooltech Define, LPG Infinity
- ✅ **整合 AI Pro** (Gemini 3 Pro, Veo 3.1, Nano Banana)

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
├── Planning/                     # 策略文件、AI 工作流程
│   ├── Master_Command_Center.md  # 核心控制中心
│   ├── AI_Team_Workflow.md       # AI 團隊角色與提示詞
│   └── 2026_02_Cycle/            # 本月週期企劃
├── Scripts/                      # Node.js 自動化腳本
│   ├── config.js                 # ⚙️ 集中設定（讀取 .env）
│   ├── utils.js                  # 共用工具（logger）
│   ├── health-check.js           # 系統健康檢查
│   ├── google/
│   │   ├── sheets/               # Sheets 同步、格式化、稽核
│   │   ├── slides/               # Slides 同步、生成、修正
│   │   └── drive/                # Drive 檔案、圖片管理
│   ├── content/                  # 文案、行事曆、Markdown 處理
│   ├── ai/                       # AI 工具（Flux 圖片生成）
│   ├── deploy/                   # 部署、Token 管理
│   └── database/                 # 資料庫設定與診斷
├── Output/                       # 產出文案與排程
├── visual-board/                 # 網頁儀表板
└── .env                          # 🔒 環境變數（不進 git）
```

---

## 🛠️ 快速開始

```bash
# 安裝相依套件
npm install

# 複製環境變數範本並填入實際值
cp .env.example .env

# 系統健康檢查
npm run health

# 啟動 Visual Board (http://localhost:3000)
npm run board

# 同步全部（Sheets + Slides）
npm run sync:all

# 分開同步
npm run sync:sheets
npm run sync:slides

# 產出行事曆
npm run calendar
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
