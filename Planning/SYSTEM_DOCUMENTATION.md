# 曜亞 x 默默的社群經營 - 系統文件

> **最後更新**：2026-01-05  
> **版本**：3.0 (2026 品牌轉型版)

---

## 📋 目錄

1. [專案概覽](#專案概覽)
2. [檔案結構](#檔案結構)
3. [核心文件說明](#核心文件說明)
4. [自動化腳本](#自動化腳本)
5. [品牌資訊](#品牌資訊)
6. [快速操作指令](#快速操作指令)
7. [新增品牌流程](#新增品牌流程)

---

## 專案概覽

### 目標受眾
**To B（診所/醫師/諮詢師）** - 原廠專業形象導向

### 管理品牌 (2026)
1. **Neuramis 仙女玻尿酸** - 柔和粉、純淨白、SHAPE技術
2. **Cooltech Define 酷特冷凍減脂** - 科技藍、冰晶白、4探頭
3. **LPG Infinity 法式體雕** - 香檳金、簡約白、無限波

### 內容策略
- ❌ 不做促銷/優惠/價格內容
- ✅ 知識型：臨床數據、原廠認證、技術原理
- ✅ 形象類：品牌質感、專業賦能、高級體驗

---

## 檔案結構

曜亞X默默的社群經營/
├── Planning/
│   ├── Final_Proposal_Submission_2026_01.md # 🎯 完整排程來源 (主要操作介面)
│   ├── Master_Command_Center.md          # 📊 進度追蹤
│   ├── Project_Requirements_Strategy.md  # 📋 專案策略文件
│   ├── AI_Team_Workflow.md              # 🤖 AI 團隊工作流程
│   ├── brand_research_2026.md           # 🎨 品牌視覺調性
│   ├── Trend_Research_2026_01.md        # 📈 趨勢分析
│   ├── Google_Sheets_Setup_Guide.md     # 🔧 Google API 設定教學
│   ├── AI_TOOLCHAIN_STANDARDS.md        # 🤖 AI 工具鏈版本規範 (Gemini 3 Pro)
│   └── SYSTEM_DOCUMENTATION.md          # 📖 本文件
│
└── Scripts/
    ├── sync-sheets.js                    # 🔄 同步到 Google Sheets
    ├── format-sheets.js                  # 🎨 格式化工作表
    ├── add-status-dropdowns.js           # 📝 新增狀態下拉選單
    ├── config.js                         # ⚙️ 專案設定檔
    └── glass-tide-461207-j2-8b7a7afd3e07.json # 🔑 Google API 金鑰

---

## 核心文件說明

### 1. Master_Command_Center.md
**用途**：日常操作的主要介面  
**內容**：
- 快速連結到所有文件
- 本月核心戰略
- 執行動作指南（含 AI Prompt）
- 貼文進度追蹤表（Markdown 格式）
- 品牌視覺檢核

**更新頻率**：每次修改內容後自動同步到 Google Sheets

### 2. AI_Team_Workflow.md
**用途**：AI 團隊角色與工作流程  
**內容**：
- 5 大 AI 角色定義
- 各角色使用的工具（Perplexity Pro, Google Veo 3.1, Nano Banana）
- 月度/週度工作流程
- 執行指令範例（B2B 導向）

### 3. Project_Requirements_Strategy.md
**用途**：專案策略與需求文件  
**內容**：
- 目標受眾定義（To B）
- 核心策略（原廠高度、知識賦能、形象質感）
- 視覺風格規範
- 短影音風格定義

### 4. Tone_and_Manner_Visuals.md
**用途**：品牌視覺參考  
**內容**：
- 三個品牌的 Mood Board 圖片
- 關鍵字與視覺描述

---

### 4. 自動化腳本 (Scripts)
位置：`/Users/murs/Documents/曜亞X默默的社群經營/Scripts/`

*   `sync-sheets.js`: **同步腳本**。讀取 Markdown 表格並更新到 Google Sheets。
*   `sync-slides.js`: **簡報同步腳本**。更新 Google Slides 標題與內容。
*   `health-check.js`: **健康檢查腳本**。驗證系統連線與設定狀態。
*   `config.js`: **共享設定模組**。集中管理所有路徑與 ID。
*   `format-sheets.js`: **格式化腳本**。設定 Google Sheets 的欄寬、凍結窗格等。
*   `add-status-dropdowns.js`: **下拉選單腳本**。為狀態欄位加入下拉選單。

> **⚠️ 文案生成**：請使用 **Google Workspace Studio Agent (AI Pro)** 進行文案生成，以使用最新的 Gemini 3 Pro 模型。

---

## 自動化腳本

### 📍 位置
`/Users/murs/Documents/曜亞X默默的社群經營/Scripts/`

### 🔄 sync-sheets.js
**功能**：將 `Master_Command_Center.md` 的表格同步到 Google Sheets  
**使用時機**：每次更新本地內容後  
**執行指令**：
```bash
cd /Users/murs/Documents/曜亞X默默的社群經營
node Scripts/sync-sheets.js
```

### 🎨 format-sheets.js
**功能**：美化 Google Sheets（欄寬、顏色、標題列）  
**使用時機**：建立新工作表或重新格式化時  

### 📝 add-status-dropdowns.js
**功能**：為「狀態」和「上架狀態」欄位新增下拉選單  
**使用時機**：建立新工作表後

---

## 品牌資訊

### Neuramis 仙女玻尿酸
- **色彩**：柔和粉 (#E6D5F0)、純淨白 (#FFFFFF)
- **關鍵字**：Soft, Pure, Fairy, SHAPE
- **視覺元素**：仙女光、流動質地
- **主打**：自然柔和、韓國銷量霸主

### Cooltech Define 酷特冷凍減脂
- **色彩**：科技藍 (#0066CC)、冰晶白 (#FFFFFF)
- **關鍵字**：Ice, Tech, Sharp, 360
- **視覺元素**：冰晶、精準線條、4探頭
- **主打**：效率、忙碌首選、Define Your Best

### LPG Infinity 法式體雕
- **色彩**：香檳金 (#FFD700)、簡約白 (#FFFFFF)
- **關鍵字**：Elegant, Flow, Infinity, 11thGen
- **視覺元素**：無限符號、法式曲線
- **主打**：第11代無限波、細胞級運動、身心平衡

---

## 快速操作指令

### 📝 更新內容並同步
```bash
# 1. 編輯 Master_Command_Center.md
# 2. 執行同步
cd /Users/murs/Documents/曜亞X默默的社群經營
node Scripts/sync-sheets.js
```

### 🆕 建立新月份內容
1. 複製 `2026_01_Content_Calendar.xlsx` 並改名
2. 更新 `Master_Command_Center.md` 的月度戰略
3. 執行同步腳本

### 🔍 查看 Google Sheets
[點此開啟](https://docs.google.com/spreadsheets/d/1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8)

---

## 新增品牌流程

### 步驟 1：定義品牌資訊
在 `Project_Requirements_Strategy.md` 新增：
- 品牌名稱
- 目標受眾
- 視覺風格（色彩、關鍵字）
- 主打特色

### 步驟 2：生成 Mood Board
使用 AI 生成品牌視覺圖：
```
請為新品牌生成 Mood Board，色彩：[顏色]，關鍵字：[關鍵字]
```

### 步驟 3：更新 AI Workflow
在 `AI_Team_Workflow.md` 新增品牌相關的 Prompt 範例

### 步驟 4：更新 Master Command Center
在 `Master_Command_Center.md` 新增：
- 品牌戰略
- 視覺檢核項目
- 執行指令範例

### 步驟 5：更新 Google Sheets
執行 `sync-sheets.js` 同步所有更新

---

## 技術設定

### Google Sheets API
- **金鑰位置**：`/Users/murs/Documents/曜亞X默默的社群經營/glass-tide-461207-j2-8b7a7afd3e07.json`
- **Spreadsheet ID**：`1Qvh58taqZD-q30FLO3wRKm6htsZ4Muy2lUlCJFlc4p8`
- **工作表名稱**：`2026_01_排程`

### 自動同步觸發條件
當您執行以下操作時，系統應自動同步：
1. 更新 `Master_Command_Center.md` 的表格內容
2. 修改貼文狀態
3. 新增或刪除貼文

---

## 維護建議

### 每週
- ✅ 更新貼文狀態
- ✅ 檢查 Google Sheets 同步狀態

### 每月
- ✅ 更新月度戰略
- ✅ 產生新的內容行事曆
- ✅ 備份所有文件

### 每季
- ✅ 檢視品牌視覺是否需要調整
- ✅ 更新 AI Workflow 的 Prompt
- ✅ 優化自動化腳本

---

**📞 需要協助？**  
直接告訴 AI：「幫我更新 [品牌] 的 [內容]」或「同步到 Google Sheets」
