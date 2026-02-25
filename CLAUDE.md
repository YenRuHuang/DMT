# CLAUDE.md — 曜亞 × 默默 醫美社群經營系統

> 此檔案由 Claude Code 和 Google Antigravity 自動載入，作為 AI 協作的共同協議書。

## 專案簡介

**曜亞生醫 × 默默網路行銷** 合作專案（DMT - Digital Marketing Tools）
針對三大醫美品牌，管理 B2B 社群內容（貼文、限動、短影音），並透過 Google Sheets / Slides 進行內容追蹤與交付。

---

## 三大品牌規則

| 品牌 | 暱稱 | 主色調 | 核心關鍵字 |
|------|------|--------|-----------|
| **Neuramis 仙女玻尿酸** | 仙女 | 柔和粉 `#E6D5F0` / 白 | SHAPE技術、自然柔和、安心變美、仙女光 |
| **Cooltech Define 酷特冷凍減脂** | 酷特 | 科技藍 `#0066CC` / 冰晶白 | 360度冷凍、4探頭效率、科技線條 |
| **LPG Infinity 法式體雕** | 法式 | 香檳金 `#FFD700` / 簡約白 | 無限波、身心平衡、法式優雅 |

---

## 合規禁用詞（醫療法規，絕對不能出現）

```
治療、改善疾病、永久、保證、治癒、痊癒
減重、減肥、瘦身、胖
銷量霸主、冠軍
```

**替代用語**：「曲線管理」「線條雕塑」「身形優化」「輪廓調整」

---

## 每月週期節奏

| 日期 | 任務 |
|------|------|
| **每月 8 日前** | 提交下月企劃提案（含 18 篇文案草稿） |
| **每月 15 日** | 新週期執行開始 |
| **每週一** | 內容產製（文案 + 圖片 / 影片素材） |
| **每週日** | 確認排程、準備上架 |
| **每月 20 日前** | 提交上月結案報告 |

### 每月固定產出配額

- 貼文：**18 篇**（各品牌 6 篇）
- 限動：**30 則**（各品牌 10 則）
- 短影音：**6 支**（各品牌 2 支）

---

## 換月流程（每月 8 日後執行）

**換月只需改 `.env` 兩個值**，其餘全部自動對應：

```bash
# .env 換月設定（以 3 月為例）
CURRENT_CYCLE=2026_03
CURRENT_SHEET_NAME=Month3_排程
```

### 自動生效的項目

| 設定 | 自動對應值（以 2026_03 為例） |
|------|-------------------------------|
| `MARKDOWN_FILE_PATH` | `Planning/2026_03_Cycle/Final_Proposal_Submission_2026_03.md` |
| `SHEET_NAME` | `Month3_排程` |
| 健康檢查標籤 | `Final_Proposal_Submission_2026_03.md` |
| Slides 標題 | `2026_03_曜亞X默默的社群經營 - B2B 專業提案` |

### 換月步驟

```bash
# 1. 更新 .env（只改這兩行）
CURRENT_CYCLE=2026_03
CURRENT_SHEET_NAME=Month3_排程

# 2. 建立新月份的企劃目錄
mkdir -p Planning/2026_03_Cycle

# 3. 驗證設定無誤
npm run health

# 4. 確認健康檢查 4/4 通過後即可開始執行
```

> ⚠️ **注意**：換月前請確認新月份的 Markdown 企劃文件與 Google Sheets 分頁已建立，否則 `npm run health` 會提示找不到檔案。

---

## 腳本目錄結構

```
Scripts/
├── config.js           # 集中設定，讀取 .env（所有腳本的入口）
├── utils.js            # logger、handleError
├── health-check.js     # npm run health
├── google/
│   ├── sheets/         # sync-sheets.js、format-sheets.js、audit-sheets.js 等
│   ├── slides/         # sync-slides.js、inspect-slides.js 等
│   └── drive/          # list-drive-files.js、fetch-w2-images.js 等
├── content/            # generate-calendar.js、fetch-markdown-copy.js 等
├── ai/                 # flux_image_generator.py（Nano Banana 圖片生成）
├── deploy/             # mursfoto-deploy.js、check-deployment.js
└── database/           # setup-database.js、diagnose-database.js
```

**重要**：所有腳本透過 `require('../../config')` 或 `require('../config')` 讀取共享設定，敏感資訊（Google IDs、憑證路徑）存於 `.env`，不進 git。

---

## npm 快捷指令

```bash
npm run health        # 系統健康檢查（4 項目）
npm run board         # 啟動 Visual Board (localhost:3000)
npm run sync:all      # 同步 Sheets + Slides
npm run sync:sheets   # 只同步 Sheets
npm run sync:slides   # 只同步 Slides
npm run calendar      # 產出行事曆
npm run deploy        # 部署至 Zeabur
```

---

## AI 工具分工

### Claude Code（此工具）負責
- 架構決策、安全審查、重大重構
- 複雜程式碼問題（依賴分析、多檔案修改）
- 月初規劃、系統設計、CI/CD 設置

### Google Antigravity 負責
- **每週內容產製**：文案、圖片 prompt（Nano Banana）、影片 prompt（Veo 3.1）
- **多 Agent 平行執行**：Manager View 同時派三個品牌的內容任務
- Google Sheets / Slides 腳本日常執行
- Gemini 3 Pro 深度文案生成

### 共同讀取的檔案
- `CLAUDE.md`（本文件，兩者自動載入）
- `Planning/{CURRENT_CYCLE}_Cycle/Final_Proposal_Submission_{CURRENT_CYCLE}.md`（當月排程，路徑由 `.env` 的 `CURRENT_CYCLE` 決定）
- `Scripts/config.js`（系統設定，讀取 `.env`）
- `Planning/Master_Command_Center.md`（核心控制中心）

---

## 敏感設定說明

- `.env`：所有 Google IDs 與憑證路徑（**不進 git**）
- `glass-tide-461207-j2-8b7a7afd3e07.json`：GCP Service Account 憑證（**不進 git**）
- `.env.example`：安全的範本，可提交至 git

---

## 工作目錄提示

從**專案目錄**啟動 Claude Code，CLAUDE.md 會自動載入：

```bash
cd ~/Documents/曜亞X默默的社群經營 && claude
```

> **換月時的完整流程**：更新 `.env` → `npm run health` → `npm run sync:all`
